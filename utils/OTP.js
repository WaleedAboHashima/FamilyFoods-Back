const mailer = require("nodemailer")
const userSchema = require("../model/user.model")
const sendOTP = async (email) => {
    const otpSecert = Math.floor(Math.random() * (100000 - 999999 + 1)) + 999999
    await userSchema.findOneAndUpdate({ email }, { otpSecert })
    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GOOGLE_EMAIL_USER,
            pass: process.env.GOOGLE_EMAIL_SECERT
        }
    });
    const mailOptions = {
        from: process.env.GOOGLE_EMAIL_USER,
        to: `${email}`,
        subject: 'Sending OTP Recovery Password Family Foods',
        text: `Your OTP Password is ${otpSecert}  Valid For 60 min`
    };
    return await transporter.sendMail(mailOptions)
}

const verifyOTP = async (OTP,id) => {

    let check = false
    await userSchema.findById(id).then(user => {
        if (user.otpSecert == OTP) check = true
    })
    return check
}

module.exports = { sendOTP, verifyOTP }