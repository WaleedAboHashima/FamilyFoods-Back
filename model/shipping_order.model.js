const mongoose = require('mongoose');
const SROrders = mongoose.model('SROrders', new mongoose.Schema({
    SR: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            },
            SRQuantity: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            }
        }
    ],
    productsQuantity: {
        type: Number,
        required: true  
    },
    remainAmount: {
        type: Number,
        required: true
    },
    paymentHistory: [
        {
            price: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    paymentMade: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    }
}));

module.exports = SROrders;