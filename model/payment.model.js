const mongoose = require("mongoose")

module.exports = mongoose.model("Payment", new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Orders"
    },
    transaction_id: String,
    amount: {
        type: Number,
        required:true
    }

}))