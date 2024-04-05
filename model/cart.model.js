const mongoose = require("mongoose");
const cartSechema = mongoose.model(
  "Cart",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
          },
        customerQuantity: {
            type: Number,
            required: true,
            default: 1,
          },
          totalPrice: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);
module.exports = cartSechema;
