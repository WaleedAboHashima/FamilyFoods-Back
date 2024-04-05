const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const ApiError = require("../middlewares/apiError")
const { sendOTP, verifyOTP } = require("../utils/OTP")
const { sendOTPTwilio, verfiyTwilioOTP } = require("../utils/Twilio")
const userSchema = require("../model/user.model")
const bcrypt = require("bcrypt")
const reportSchema = require("../model/report.model")

// Register New User

exports.Register = asyncHandler(async (req, res, next) => {
    const { username, email, phone, password } = req.body
    await userSchema.findOne({ $or: [{ phone }, { email }] }).then(async user => {
        if (user) return next(new ApiError("Phone Or Email is Exists", 409))
        await userSchema.create({
            username,
            email,
            phone,
            password: await bcrypt.hash(password, 10),
            paperVerification: false
        }).then(() => res.status(201).json({ username, email, phone }))
    })
})

// Login User

exports.Login = asyncHandler(async (req, res, next) => {
    const { email, password, phone } = req.body
    const foundUser = await userSchema.findOne({ email, phone })
    if (!foundUser) throw new ApiError("Email Or Phone Not Found", 404)
    if (! await bcrypt.compare(password, foundUser.password)) return next(new ApiError("Password Not Match", 400));
    const token = jwt.sign({ id: foundUser.id, role: foundUser.role,email:foundUser.email }, process.env.ACCESS_TOKEN, { expiresIn: "30d" })
    res.cookie("jwt", token, { httpOnly: false, maxAge: 3 * 24 * 60 * 60 * 1000 });
    delete foundUser._doc.password
    res.status(200).json({
        _id: foundUser.id,
        email,
        phone,
        token,
        role: foundUser.role,
        username: foundUser.username,
        remainAmount: foundUser.remainAmount,
        SR: foundUser.SR ? true : false,
        paperVerification: foundUser.paperVerification
    })
})


// Send Otp To User Contact

exports.throwOTP = asyncHandler(async (req, res, next) => {
    const { email, phone } = req.body
    const { type } = req.query
    if (type === "email") {
        await userSchema.findOne({ email }).then(async user => {
            if (!user) throw new ApiError("Can't Find User Email", 404)
            const OTP_Process = await sendOTP(email)
            if (!OTP_Process) return next(new ApiError("Email Not Sent  Try again later", 403))
            res.sendStatus(200)
        })

    }
    else {
        await userSchema.findOne({ phone }).then((user) => {
            if (!user) throw new ApiError("Can't Find User Phone", 404)
            const Sender = sendOTPTwilio(phone)
            if (!Sender) return next(new ApiError("Message Not Sent  Try again later", 403))
            res.sendStatus(200)
        })
    }
}
)

// Verfiy Otp 

exports.checkOTP = asyncHandler(async (req, res, next) => {
    const { OTP, email, phone } = req.body
    const { type } = req.query
    if (type === "email") {
        await userSchema.findOne({ email }).then(async user => {
            if (!user) return next(new ApiError("Cant't Find Ur Email", 403))
            const validator = await verifyOTP(OTP, user.id)
            if (!validator) return next(new ApiError("OTP Is InValid", 403))
            res.status(200).json({ id: user.id })
        })
    } else {
        await userSchema.findOne({ phone }).then(async user => {
            if (!user) return next(new ApiError("Cant't Find Ur Phone", 403))
            const validator = await verfiyTwilioOTP(OTP, phone)
            if (!validator) return next(new ApiError("OTP Is InValid", 403))
            res.status(200).json({ id: user.id })
        })
    }
})

// Update User Password

exports.UpdatePassword = asyncHandler(async (req, res, next) => {
    const { newPassword } = req.body
    const { user_id } = req.params
    await userSchema.findById(user_id).then(async user => {
        if (!user) return next(new ApiError("User Not Found", 404))
        const password = await bcrypt.hash(newPassword, 10)
        await userSchema.findByIdAndUpdate(user_id, { password, otpSecert :null}).exec()
        res.sendStatus(200)
    })
})

// User Who Have issue When Make Auth => Make Report 

exports.authReport = asyncHandler(async (req, res) => await reportSchema.create({ username: req.body.username, position: req.body.position, message: req.body.message, phone: req.body.phone }).then(report => res.status(201).json({ report })))