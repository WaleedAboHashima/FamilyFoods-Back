const { check } = require("express-validator")
const validator = require("../../middlewares/validator")

exports.CustomerValidator = [check("customerId").notEmpty().isMongoId().withMessage("Please Provide Valid Customer Id"),validator]