const { check } = require("express-validator")
const validator = require("../../middlewares/validator")

exports.addCartValidatior = [
    check("customerQuantity").notEmpty().withMessage("Please Add Customer Quantity"),
    check("productId").isMongoId().withMessage("Please Add Valid Product Id"),
    validator
]
exports.deleteFromCartValidator = [
    check("productId").isMongoId().withMessage("Please Add Valid Product Id"),
    validator
]

exports.addOrderValidator = [
    check("carts").optional().notEmpty().withMessage("Please Add User Cart"),
    check("orderId").optional().notEmpty().withMessage("Please Add Order Payment Id"),
    validator
]

exports.makeInstallmentValidator = [
    check("type").notEmpty().isIn(["Online", "Cash"]).withMessage("Please Add Order Type"),
    check("carts").notEmpty().withMessage("Please Add User Cart"),
    check("starterAmount").notEmpty().withMessage("Please Add Order Starter Amount"),
    validator
]

exports.makeAuthPaymop = [
    check("carts").notEmpty().withMessage("Please Add Cart"),
    check("totalPrice").notEmpty().withMessage("Please Add Order Total Price"),
    validator
]

exports.makePaymopInfoValidtor = [
    check("auth_token").notEmpty().withMessage("Please Add Token"),
    check("order_id").notEmpty().withMessage("Please Add Order ID"),
    check("first_name").notEmpty().withMessage("Please Add First Name"),
    check("last_name").notEmpty().withMessage("Please Add Last Name"),
    check("phone_number").isMobilePhone().notEmpty().withMessage("Please Add Valid Phone"),
    check("email").isEmail().withMessage("Please Add First Name"),validator
]