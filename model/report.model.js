const mongoose = require( "mongoose" )
const reportSchema = mongoose.model(
  "Reports",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  })
);
module.exports = reportSchema 