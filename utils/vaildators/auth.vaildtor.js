const { check } = require("express-validator")
const ApiError = require("../../middlewares/apiError")
const validator = require("../../middlewares/validator");

exports.RegVaildator = [
    check("username").notEmpty().withMessage("Username Is Required And  Min Length 3").isLength({ min: 3 }),
    check("email").isEmail().withMessage("Email Is Not Valid"),
    check("phone").notEmpty().isMobilePhone("ar-EG").withMessage("Phone Is Not Valid"),
    check("password").notEmpty().withMessage("Password Is Required").custom((password, { req }) => {
        if (password !== req.body.confirmPassword) throw new ApiError("Password Not Match", 400);
        return true
    }),
    validator
]

exports.LoginValidator = [
    check("email").isEmail().withMessage("Not Valid Email"),
    check("phone").isMobilePhone("ar-EG").withMessage("Phone Is Not Valid"),
    check("password").notEmpty().withMessage("Password Required"),
    validator
]

exports.ForgetpasswordValidator = [
    check("type").isIn(["email", "phone"]).withMessage("Enter Valid Type"),
    check("email").optional().isEmail().withMessage("Not Valid Email"),
    check("phone").optional().isMobilePhone("ar-EG").withMessage("Phone Is Not Valid"),
    validator
]

exports.CheckOtpValidator = [
    check("OTP").notEmpty().withMessage("Please Enter Valid OTP"),
    check("email").optional().isEmail().withMessage(" Email Is Not Valid"),
    check("phone").optional().isMobilePhone("ar-EG").withMessage("Phone Is Not Valid"),
    validator
]

exports.UpdatePasswordValidator = [
    check("newPassword").notEmpty().isLength({ min: 6 }).withMessage("Password must be at least 6 characters").custom((password, { req }) => {
        if (password !== req.body.confirmPassword) return next(new ApiError("Password Not Match", 400))
        return true
    }),
    validator
]

exports.AuthReportValidator = [
    check("username").notEmpty().withMessage("Please Enter Your Username"),
    check("phone").notEmpty().isMobilePhone("ar-EG").withMessage("Phone Is Not Valid"),
    check("position").notEmpty().withMessage("position Is Not Valid"),
    check("message").notEmpty().withMessage("position Is Not Valid"),
    validator
]