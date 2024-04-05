const route = require("express").Router()
const { AddUser, getAllUsers, deleteUser, AddNewProduct, updateProduct, deleteProduct, getAllReports, deleteReport, getOrders, archivedOrder, addPrivacy, charts, top3 } = require("../controllers/admin.controllers")
const { AddUserValidator, AddProductValidator, UpdateProductValidator } = require("../utils/vaildators/admin.validator")
const uploader = require("../middlewares/Multer")

// Users
route.get("/users", getAllUsers)
route.post("/user", AddUserValidator, AddUser)
route.delete("/user/:userId", deleteUser)
// Products
route.post('/product', uploader.single('productImg'), AddProductValidator, AddNewProduct)
route.put('/product/:productId', uploader.single('productImg'), UpdateProductValidator, updateProduct)
route.delete('/product/:productId', deleteProduct)
// Reports
route.get('/reports', getAllReports)
route.delete('/report/:report_id', deleteReport)
// Orders 
route.get('/orders', getOrders)
route.delete('/order/:order_id', archivedOrder)
route.put("/privacy", addPrivacy)
route.get("/chart", charts)
route.get("/top3", top3)


module.exports = route