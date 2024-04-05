const mongoose = require('mongoose');
const orderSchema = mongoose.model("Orders", new mongoose.Schema({
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products"
            },
            customerQuantity: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            }
        },
    ],
    orderId: String,
    way: String,
    method:String,
    type:String,
    SR: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: "Waiting" // Waiting / Preparing / Delivered  
    },
    archived: {
        type: Boolean,
        default: false
    },
    Pay_Completed_Suc: {
        type: Boolean   
    },
    delivered: {
        type: Boolean,
        default: false
    },
    deliverDate: Date,
    starterAmount: Number,
    remainAmount:Number
}))

module.exports = orderSchema