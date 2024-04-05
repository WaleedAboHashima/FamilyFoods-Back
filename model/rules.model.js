const mongoose = require('mongoose')
module.exports = mongoose.model("Rules", new mongoose.Schema({
    textBody: {
        type: String,
        required: [true,"Please Add Text Body "]
    },
    type: {
        type: String,
        enum:["privacy"]
    }
},{timestamps:true}))