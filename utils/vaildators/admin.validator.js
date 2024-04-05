
const { check } = require("express-validator")
const validator = require("../../middlewares/validator")


exports.AddUserValidator = [
    check("username").notEmpty().isLength({ min: 3 }).withMessage("Provide Username With Minmum 3 Characters"),
    check("email").isEmail().withMessage("Please Provide Valid  Email Address"),
    check("phone").isMobilePhone("ar-EG").withMessage("Please Provide Valid Phone Number"),
    check("type").notEmpty().isIn(["Admin", "SR", "Accountant"]).withMessage("Please Provide Valid Type Of User"),
    check("password").notEmpty().isLength({ min: 6 }).withMessage("Please Provide Valid Password With Minmum Characters 6"),
    validator
]
    // name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, category, categoryAR
exports.AddProductValidator = [
    check("name").notEmpty().withMessage("Please enter a valid name for product"),
    check("nameAR").notEmpty().withMessage("Please enter a valid nameAR for product"),
    check("flavor").notEmpty().withMessage("Please enter a valid flavor for product"),
    check("flavorAR").notEmpty().withMessage("Please enter a valid flavorAR for product"),
    check("price").notEmpty().withMessage("Please enter a valid price for product"),
    check("quantity").notEmpty().withMessage("Please enter a valid quantity for product"),
    check("weight").notEmpty().withMessage("Please enter a valid weight for product"),
    check("validDate").notEmpty().withMessage("Please enter a valid name for product"),
    check("expDate").notEmpty().withMessage("Please enter a valid name for product"),
    check("category").notEmpty().withMessage("Please enter a valid name for product"),
    check("categoryAR").notEmpty().withMessage("Please enter a valid name for product"),
    validator
]

exports.UpdateProductValidator = [
    check("name").optional().notEmpty().withMessage("Please enter a valid name for product"),
    check("nameAR").optional().notEmpty().withMessage("Please enter a valid nameAR for product"),
    check("flavor").optional().notEmpty().withMessage("Please enter a valid flavor for product"),
    check("flavorAR").optional().notEmpty().withMessage("Please enter a valid flavorAR for product"),
    check("price").optional().notEmpty().withMessage("Please enter a valid price for product"),
    check("quantity").optional().notEmpty().withMessage("Please enter a valid quantity for product"),
    check("weight").optional().notEmpty().withMessage("Please enter a valid weight for product"),
    check("validDate").optional().notEmpty().withMessage("Please enter a valid name for product"),
    check("expDate").optional().notEmpty().withMessage("Please enter a valid name for product"),
    check("category").optional().notEmpty().withMessage("Please enter a valid name for product"),
    check("categoryAR").optional().notEmpty().withMessage("Please enter a valid name for product"),
    validator
]