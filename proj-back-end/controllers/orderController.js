require('dotenv').config();
const AWS = require('aws-sdk');
const AWS_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    accessSecretKey: process.env.AWS_SECRET_KEY,
    accessSessionToken: process.env.AWS_SESSION_TOKEN,
    region: "us-east-1"
}
AWS.config.update(AWS_CONFIG)

const {v4: uuid} = require('uuid');
const {tables} = require("../config");
const ATTR = require('dynamodb-data-types').AttributeValue

//DB Configuration!

const db = new AWS.DynamoDB();
const dbClient = new AWS.DynamoDB.DocumentClient();


const unwrapItems = (data) => {

    if (Array.isArray(data)) {
        return data.map(item => (ATTR.unwrap(item)))
    } else {
        return null
    }
}


exports.getOrderById = (req, res, next, id) => {
    if (!id) {
        return res.send("Invalid Id");
    }

    const getParams = {
        TableName: tables.orders,
        Key: {
            orderId: {S: id}
        }
    }
    db.getItem(getParams, (err, result) => {
        if (err || !result) {
            return res.status(400).json({
                message: "Failed to get the Order details for id: " + id,
                error: err,
                operation: "failure"
            })
        } else {
            req.order = ATTR.unwrap(result.Item);
            next();
        }
    })
}

exports.getAnOrder = (req, res) => {

    if (!req.order) {
        return res.status(400).json({
            message: "Failed to get the order details",
            error: "Invalid Order ID sent",
            operation: "failure"
        })
    } else {
        return res.status(200).json({
            message: "Order Details found",
            data: req.order,
            operation: "success"
        })
    }

}

exports.listAllOrders = (req, res) => {
    const params = {TableName: tables.orders};

    db.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                message: "Failed to get all the orders details",
                error: err,
                operation: "failure"
            })
        } else {
            return res.status(200).json({
                message: "Found the list of the orders",
                data: unwrapItems(data.Items),
                operation: "success"
            })
        }
    })
}

exports.getOrdersOfUser = async (req, res) => {
    const {email} = req.params;
    const params = {
        TableName: tables.orders,
        FilterExpression: 'email = :emailValue',
        ExpressionAttributeValues: {
            ':emailValue': email
        },
    };
    try {

        const result = await dbClient.scan(params).promise();
        return res.status(200).json({
            message: "Found the list of the orders for the user with email " + email,
            data: result.Items,
            operation: "success"
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "Failed to get all the orders of the user with email " + email,
            error: error,
            operation: "failure"
        })
    }


}

async function updateProductStock(productId, orderQuantity, currentStock) {

    const updatedStock = parseInt(currentStock) - parseInt(orderQuantity);
    console.log(productId, orderQuantity, currentStock);
    console.log("Updating the stock value to " + updatedStock)
    const params = {
        TableName: tables.products,
        Key: {
            id: productId
        },
        UpdateExpression: 'set stock = :stockValue',
        ExpressionAttributeValues: {
            ':stockValue': updatedStock
        }
    }

    // Run the db command.
    try {
        const response = await dbClient.update(params).promise();
        return {
            message: "updated the stock value",
            response: response
        }
    } catch (error) {
        console.log("Error updating the account balance")
        return {
            message: "Error updating the account balance",
            error: error
        }

    }


}

exports.updateOrderStatus = async (req, res) => {

    const {orderId, orderStatus: oldOrderStatus} = req.order;
    const params = {
        TableName: tables.orders,
        Key: {
            orderId: orderId
        },
        UpdateExpression: `set orderStatus = :orderStatusValue`,
        ExpressionAttributeValues: {
            ":orderStatusValue": req.body.orderStatus || oldOrderStatus
        }
    }


    try {
        const result = await dbClient.update(params).promise();
        return res.status(200).json({
            message: `Updated the order status for ${orderId} from ${oldOrderStatus} to ${req.body.orderStatus}`,
            data: `Status updated to ${req.body.orderStatus}`,
            operation: "success",
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "Failed to updated the order status for the order " + orderId,
            error: error,
            operation: "failure"
        })
    }

}

exports.createOrder = (req, res) => {

    const productId = req.product["id"]["S"];
    const currentStock = req.product["stock"]["N"];

    const {email, orderQuantity, orderStatus, paymentType} = req.body;

    const orderId = uuid();
    const orderTimeStamp = new Date().toLocaleString();


    console.log("Creating the order");
    console.log(req.product);

    const orderParams = {
        TableName: tables.orders,
        Item: {
            orderId: {S: orderId},
            productId: {S: productId},
            email: {S: email.toString()},
            orderQuantity: {N: orderQuantity.toString()},
            orderStatus: {S: orderStatus.toString()},
            orderTimeStamp: {S: orderTimeStamp},
            paymentType: {S: paymentType.toString()}
        }
    }

    db.putItem(orderParams, ((err, data) => {
        if (err) {
            console.log("Error Happened While creating the order: " + err)
            return res.status(400).json({
                message: "Failed to create the order",
                error: err,
                operation: "failure"
            })
        } else {

            // Decrease the product stock by the orderQuantity;
            updateProductStock(productId, orderQuantity, currentStock).then(r => {
                    return res.status(201).json({
                        message: "Successfully Created the order and order id is: " + orderId,
                        data: {...data, orderId},
                        operation: "success"
                    })
                }
            ).catch(err => {
                return res.status(400).json({
                    message: "Order Created but Error Updating the stock of the order: " + err.message,
                    operation: "partial success"
                })

            })
        }
    }));
}