const mongoose = require("mongoose")
const userSchema = mongoose.model("Users", new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        required: true,
        validate: { validator: (val) => val.length === 11, message: "Invalid phone number => Phone Number Must Be 11 Number " },
        unique: true
    },
    role: {
        type: Number,
        default: 2001,
        enum: [2001, 2500, 5000, 5050]
    },
    remainAmount: {
        type: Number,
        default: 0
    },
    SR: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    paperVerification: Boolean,
    otpSecert:Number

}));
module.exports = userSchema 