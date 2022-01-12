require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const debug = require('debug')('index:');
const productRouter = require("./routes/productRouter");
const orderRouter = require("./routes/orderRouter");
const userRouter = require('./routes/userRoute');


// App Initialization
const app = express();
const cors = require('cors');
// Middleware
app.use(cors());
const port =  process.env.PORT || 5000;

//Adding manual headers
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    next();
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())



// Routers
app.use('/', productRouter);
app.use('/', orderRouter);
app.use('/', userRouter);


// Start listening to the requests
app.listen(port, () => {
    debug("hey");
    console.log("Started server on the port: " + port);
})
