const route = require("express").Router()
const { getAllReturns, addSrOrder, getAllSrOrders, archiveSrOrder, Col_Money, allSR, getSROrders, getSr, getTotalOnlinePrice, paymentHistory } = require("../controllers/accountant.controllers")


route.post("/SR/order/:SRId", addSrOrder)
// SR 
route.get("/SR", allSR)
// SR Orders
route.get('/SR/orders', getAllSrOrders)
route.get("/SR/order/:SROrder_id", getSROrders)
route.delete("/SR/order/:order_id", archiveSrOrder)
route.put("/SR/order/:order_id/:SRId", Col_Money)
route.get("/SR/:SRId", getSr)
route.get("/totalPrice", getTotalOnlinePrice)
route.get("/payment", paymentHistory)
// Returned Products From SR 
route.get("/getAllReturns", getAllReturns)
module.exports = route