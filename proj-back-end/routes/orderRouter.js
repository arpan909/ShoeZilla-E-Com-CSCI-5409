const express = require('express');
const {
    listAllOrders,
    getOrderById,
    createOrder,
    getAnOrder,
    getOrdersOfUser,
    updateOrderStatus
} = require("../controllers/orderController");
const {getProductById} = require("../controllers/productController");

const orderRouter = express.Router();
orderRouter.param('orderId', getOrderById);
orderRouter.param('productId', getProductById);

orderRouter.get('/order/:orderId', getAnOrder);
orderRouter.get('/orders/user/:email', getOrdersOfUser)

// Admin Ops!
orderRouter.post('/order/create/:productId', createOrder);
orderRouter.get('/admin/orders/list', listAllOrders);
orderRouter.post('/admin/order/update/:orderId', updateOrderStatus);

module.exports = orderRouter;