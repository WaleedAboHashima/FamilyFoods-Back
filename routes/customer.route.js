const route = require("express").Router();
const { AddtoCart, getCart, deleteFromCart, deleteCart, AddOrder, getOrder, ReportInAuth, installmentOrder, archiveOrders,paypalAuth } = require("../controllers/customer.controllers")
const { paymentVerification, userInformation, paymentValidation } = require('../utils/payMob')
const { addCartValidatior, deleteFromCartValidator, addOrderValidator, makeInstallmentValidator, makeAuthPaymop, makePaymopInfoValidtor } = require("../utils/vaildators/customer.validator")


route.get("/cart", getCart)
route.post("/cart/:productId", addCartValidatior, AddtoCart)
route.put("/cart/:productId", deleteFromCartValidator, deleteFromCart)
route.delete("/cart", deleteCart)

route.get("/order", getOrder)
route.post("/order", addOrderValidator, AddOrder)
route.post("/order/installment", makeInstallmentValidator,installmentOrder)
route.put("/order/:order_id",archiveOrders)
// route.post('/approval', approveMethod);
route.post('/payment/verify', makeAuthPaymop,paymentVerification);
route.post('/payment/info', makePaymopInfoValidtor,userInformation);
route.post('/paymment/valid', paymentValidation);
// Paypal
route.post("/payment/paypal/link",paypalAuth)


module.exports = route

