const route = require("express").Router();

const { Register, Login, throwOTP, checkOTP, UpdatePassword, authReport } = require("../controllers/auth.controller")
const { RegVaildator, LoginValidator, ForgetpasswordValidator, CheckOtpValidator, UpdatePasswordValidator, AuthReportValidator } = require("../utils/vaildators/auth.vaildtor")


route.post("/register", RegVaildator, Register)
route.post('/login', LoginValidator, Login)
route.post('/forget_password', ForgetpasswordValidator, throwOTP)
route.post('/update_password/:user_id', UpdatePassword)
route.post('/reset_password', checkOTP)
route.post("/report", authReport)


module.exports = route