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


const formidable = require('formidable');
const fs = require('fs');
const {buckets, tables, region} = require('../config');
const {v4: uuid} = require('uuid');
const {BitlyClient} = require('bitly');
const {log} = require("debug");
const attr = require('dynamodb-data-types').AttributeValue;

const db = new AWS.DynamoDB();

exports.getProductById = (req, res, next, id) => {

    console.log("Getting the product details...");
    if (!id) {
        return res.send("Invalid Id");
    }

    const getParams = {
        TableName: tables.products,
        Key: {
            id: {S: id}
        }
    }
    db.getItem(getParams, (err, result) => {
        if (err || !result) {
            return res.status(400).json({
                message: "Failed to get the product details for id " + id,
                error: err,
                operation: "failure"
            })
        } else {
            req.product = result.Item;
            next();
        }
    })

}
// Get a product
exports.getAProduct = (req, res) => {
    if (!req.product) {
        return res.status(400).json({
            message: "No Product found",
            error: "Invalid Id passed for the product id",
            operation: "failure"
        })
    } else {
        return res.status(200).json({
            message: "Product Details Found",
            data: req.product,
            operation: "success"
        })
    }
}

exports.listProducts = (req, res) => {
    const params = {TableName: tables.products};

    db.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                message: "Failed to get all the product details",
                error: err,
                operation: "failure"
            })
        } else {
            return res.status(200).json({
                message: "Found the list of the products",
                data: data.Items,
                operation: "success"
            })
        }

    })
}

function uploadFileToS3(file, id, res) {
    if (file.image) {
        const s3 = new AWS.S3();
        const imageContent = fs.readFileSync(file.image.filepath)

        // create S3 params
        const params = {
            Bucket: buckets.productImages,
            Key: id + ".jpg",
            Body: imageContent,
            ContentType: file.image.mimeType,
            ACL: 'public-read'
        }

        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return res.send("Failed to Upload the data")
            } else {
                console.log("File Uploaded Successfully to S3 at =>   " + `https://${buckets.productImages}.s3.amazonaws.com/${id}.jpg`);
            }
        })

    }
}

async function getShortenUrl(longUrl) {

    const getMeBitlyToken = async () => {
        // Create a Secrets Manager client
        const secretName = process.env.SECRET_NAME;

        const smClient = new AWS.SecretsManager({
            region: AWS_CONFIG.region
        });
        const response = await smClient.getSecretValue({SecretId: secretName}).promise();
        const secretObject = JSON.parse(response.SecretString);
        console.log(secretObject)
        return secretObject['bitlyToken'];
    }


    let result;
    try {
        const bitlyToken = await getMeBitlyToken();
        const bitly = new BitlyClient(bitlyToken, {});
        result = await bitly.shorten(longUrl);
    } catch (error) {
        console.log(error)
    }

    return result;
}

exports.createProduct = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // Parse the form for data
    form.parse(req, async (err, fields, file) => {

        if (err) {
            return res.status(400).json({
                message: "Problems found in the file you sent..." + file.image,
                error: err,
                operation: "failure"
            })
        }

        // De-Structure the fields
        const id = uuid();
        const {name, description, price, stock} = fields;

        if (!id || !name || !description || !price || !stock) {
            return res.status(400).json({
                message: "Some fields missing or empty",
                error: "Insufficient data in non-file fields",
                operation: "failure"
            })
        }

        // Check the image size and should be < 4MB
        if (file.image && file.image.size > 4 * 1024 * 1024) {
            return res.status(406).json({
                message: "Failed to perform the operation",
                error: "Image size exceeded 4MB",
                operation: "failure"
            })
        }

        // Read the image and upload to s3
        uploadFileToS3(file, id, res);

        // Get the Shorten URL using bitly!
        let url = `https://${buckets.productImages}.s3.amazonaws.com/${id}.jpg`
        if (process.env.SHORT_URL.toString() === "true" || process.env.SHORT_URL.toString().includes("true")) {
            const shortenUrlResponse = await getShortenUrl(url);
            const shortenUrl = shortenUrlResponse.link;
            url = shortenUrl === undefined ? url : shortenUrl;
        }

        // Upload the product details to DynamoDB
        // Build DynamoDB Params
        const productParams = {
            TableName: tables.products,
            Item: {
                id: {S: id},
                name: {S: name},
                description: {S: description},
                price: {N: price.toString()},
                stock: {N: stock.toString()},
                url: {S: url.toString()}
            }
        }

        db.putItem(productParams, (err, data) => {
            if (err) {
                console.log("Error Happened While creating the product: " + err)
                return res.status(500).json({
                    message: "Failed to create the product",
                    error: err,
                    operation: "failure"
                });
            } else {
                console.log(`Successfully Created the product ${name} with id: ${id}`);
                res.status(200).json({
                    message: `Successfully Created the product ${name} with id: ${id}`,
                    operation: "success"
                });
            }
        })

    })

}

exports.deleteProduct = (req, res) => {
    const id = req.product.id.S;
    if (!req.product) {
        return res.status(400).json({
            message: "Kindly send a valid product id",
            error: "No product found for the given id",
            operation: "failure"
        })
    }

    const params = {
        TableName: tables.products,
        Key: {
            id: {S: id.toString()}
        }
    };

    db.deleteItem(params, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                message: "Failed to delete the product",
                error: err,
                operation: "failure"
            })
        } else {
            return res.status(200).json({
                message: "Successfully Deleted the product with id: " + id,
                operation: "success"
            })
        }

    })

}

exports.updateProduct = (req, res) => {

    if (!req.body) {
        return res.status(400).json({
            message: "Place the data in the ",
            error: "no body in req....",
            operation: "failure"
        })
    }
    const id = req.product.id.S;
    const {name, description, price, stock} = req.body;
    const params = {
        TableName: tables.products,
        Item: {
            id: {S: id},
            name: {S: name || req.product.name.S},
            description: {S: description || req.product.description.S},
            price: {N: price.toString()},
            stock: {N: stock.toString()}
        }
    }

    db.putItem(params, (err) => {
        if (err) {
            return res.status(400).json({
                message: "Failed to update the product",
                error: err,
                operation: "failure"
            })
        } else {
            return res.status(200).json({
                message: "Successfully updated the product for id: " + id,
                operation: "success"
            });
        }
    })

}
