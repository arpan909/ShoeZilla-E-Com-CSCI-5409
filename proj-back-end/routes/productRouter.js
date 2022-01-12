const express = require('express');
const {
    listProducts,
    createProduct,
    getProductById,
    getAProduct,
    deleteProduct, updateProduct
} = require("../controllers/productController");

const productRouter = express.Router();

productRouter.param('productId', getProductById)

productRouter.get('/product/:productId', getAProduct)
productRouter.get('/products', listProducts);

productRouter.post('/product/add', createProduct)
productRouter.delete('/product/:productId', deleteProduct)
productRouter.put('/product/:productId', updateProduct)

module.exports = productRouter;