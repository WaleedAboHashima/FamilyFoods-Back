const express = require('express')
const app = express()
const mongoose = require("mongoose")
const cors = require('cors')
const cookie = require('cookie-parser')
const path = require('path')
const morgan = require("morgan")
const verifyRoles = require('./middlewares/verifyRoles')
const allowedRoles = require('./config/allowedRoles')
const globalError = require('./middlewares/errorMiddlware')
const verifyToken = require('./middlewares/verifyToken')
const paypal = require('paypal-rest-sdk');




// env Info config
require('dotenv').config()
const PORT = process.env.PORT || 8000
// enable cors  
app.use(cors())
// express URL encodded
app.use(express.urlencoded({ extended: false }))
// built-in middleware for json
app.use(express.json())
// enable cookies
app.use(cookie())
// static file for img
app.use('/images', express.static(path.join(__dirname, 'images')))
// Api Requests Logs
process.env.NODE_ENV !== 'production' && app.use(morgan("dev"))
// Routes 
app.get("/", (req, res) => res.send("Server Of Family Foods Already Running"))
app.use('/auth', require("./routes/auth.route"))
app.use("/user", verifyToken, require("./routes/user.route"))
app.use('/customer', verifyRoles(allowedRoles.Customer), require('./routes/customer.route'))
app.use("/SR", verifyRoles(allowedRoles.SR),require("./routes/shipping.route"))
app.use("/accountant", verifyRoles(allowedRoles.Accountant , allowedRoles.Admin),require("./routes/accountant.route"))
app.use('/admin', verifyRoles(allowedRoles.Admin), require('./routes/admin.route'))
// Paypal Handler
paypal.configure({
  'mode': 'sandbox', 
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});
// Success Payment 
app.get("/success",(req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": 900
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
})

// Paypal Canceled  
app.get("/cancel",(req,res)=>res.send("Payment Canceled "))
// Error Handler 
app.use(globalError)  
// Connect To MongoDB And Lunch Server
mongoose.connect(process.env.DATABASE_SECRET, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`))
}).catch(err => {
  console.error(err)
})