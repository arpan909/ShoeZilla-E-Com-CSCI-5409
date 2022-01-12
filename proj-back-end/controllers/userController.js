// Aws Configuration
require('dotenv').config();
const AWS = require('aws-sdk');
const AWS_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    accessSecretKey: process.env.AWS_SECRET_KEY,
    accessSessionToken: process.env.AWS_SESSION_TOKEN,
    region: "us-east-1"
}
AWS.config.update(AWS_CONFIG)

const {region, tables} = require('../config');


AWS.config.update({region})

const docClient = new AWS.DynamoDB.DocumentClient({
    sslEnabled: false,
    paramValidation: false,
    convertResponseTypes: false
})
const db = new AWS.DynamoDB();

async function listAllUsers() {

    let params = {TableName: tables.users};
    let results = [];
    let items;
    let users = [];

    do {
        items = await docClient.scan(params).promise();
        items.Items.forEach((item) => results.push(item));
        users.push(items.Items[0]['email'])
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return users;
}


exports.addUser = async (req, res) => {

    const {email} = req.body;
    const params = {
        TableName: tables.users,
        Item: {
            email: {S: email}
        }
    }

    db.putItem(params, ((err, data) => {
        if (err) {
            console.log("Error Happened While saving the user: " + err)
            return res.status(400).json({
                message: "Failed to Save the user to DB!",
                error: err,
                operation: "failure"
            })
        } else {
            return res.status(201).json({
                message: "Successfully saved user to DB!",
                data: data,
                operation: "success"
            })
        }
    }))
}