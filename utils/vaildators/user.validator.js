const { check } = require("express-validator")
const ApiError = require("../../middlewares/apiError")
const validator = require("../../middlewares/validator");


exports.editUserInfoValidator = [
    check("username").optional().notEmpty().withMessage("Please Enter A Username"),
    check("email").optional().isEmail().withMessage("Please Enter A Valid Email"),
    check("phone").optional().isMobilePhone('ar-EG').withMessage("Please Enter A Valid Phone"),
    validator
]

exports.changePasswordValidator = [
    check("oldPassword").notEmpty().withMessage("Please Enter A Valid Password"),
    check("newPassword").notEmpty().withMessage("Please Enter A Valid Password").custom((password, { req }) => {
        if (password !== req.body.confirmPassword) {
            throw new ApiError("Password And Confirm Password Must Be Equal ")
        }
        return true
    }),
    validator
]
exports.getProductValidator = [
    check("productId").notEmpty().isMongoId().withMessage("Please Enter Valid Product Id"),
    validator
]
exports.ReportInAuthValidator = [
    check("username").notEmpty().withMessage("Please Enter Valid Username"),
    check("position").notEmpty().withMessage("Please Enter A position"),
    check("message").notEmpty().withMessage("Please Enter A Valid message"),
    check("phone").isMobilePhone('ar-EG').withMessage("Please Enter A Valid Phone"),
    validator
]