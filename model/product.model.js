const mongoose = require('mongoose')
const productSchema = mongoose.model('Products', new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameAR: {
    type: String,
    required: true
  },
  flavor: {
    type: String,
    required: true
  },
  flavorAR: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  validDate: {
    type: String,
    required: true
  },
  expDate: {
    type: String,
    required: true
  },
  img: {
    imgId: {
      type: String,
      default:null
    },
    imgURL: {
      type: String,
      default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.mrpanet.org%2Fstore%2FListProducts.aspx%3Fcatid%3D276725&psig=AOvVaw2b0gn0JwnZbai3UDozs7vv&ust=1678896267394000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCJiwn4Lm2_0CFQAAAAAdAAAAABAE"
    },
    imgSrc: {
      type: String,
      default: null
    }
  },
  category: {
    type: String,
    required:true
  },
  categoryAR: {
    type: String,
    required:true
  }
},
{
      timestamps: true,
  }
))
module.exports = productSchema
