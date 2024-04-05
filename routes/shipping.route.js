const route = require('express').Router()

const { AddCustomer, getCustomerDetails, getAllCustomers, SearchCustomers, getSRcustomers, returnedProducts, getCustomerOrders, OrderStatus, verifyPaper, getAllReturned, getPayOrders, getSrOrders, deleteUser } = require("../controllers/shipping.controller")
const { CustomerValidator } = require("../utils/vaildators/SR.validator")


route.post("/user/:customerId", CustomerValidator, AddCustomer)
route.get("/user/:customerId", CustomerValidator, getCustomerDetails)
route.get("/users/sr", getSRcustomers)
route.get("/users", getAllCustomers)
route.get("/user", SearchCustomers)
route.post("/return", returnedProducts)
route.get("/return", getAllReturned)
route.get("/orders", getCustomerOrders)
route.put("/orders/:order_id", OrderStatus)
route.put("/verify/:customerId", verifyPaper)
route.get("/sr_order", getSrOrders)
route.get("/pay_admin_orders", getPayOrders)
route.delete("/user/:user_id", deleteUser)
module.exports = route