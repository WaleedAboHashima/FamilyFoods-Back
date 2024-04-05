const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);    

const sendOTPTwilio = async (phone) => {
    try {
        const Sender = await client.verify.v2
            .services(process.env.TWILO_VERIFY_SID)
            .verifications.create({ to: `+2${phone}`, channel: "sms" })
        return Sender.status === "pending" ? true : false   
    } catch (error) {
        console.log(error)
    }

}

const verfiyTwilioOTP = async (otp, phone) => {
    try {
        const verification = await client.verify.v2
            .services(process.env.TWILO_VERIFY_SID)
            .verificationChecks.create({ to: `+2${phone}`, code: otp })
        return verification.status === "approved" ? true : false
    } catch (error) {
        console.error(error)   
    }
}
module.exports = {
    sendOTPTwilio,
    verfiyTwilioOTP
}