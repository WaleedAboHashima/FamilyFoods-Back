const axios = require("axios");
require("dotenv").config();
const url = require("url");
const asyncHandler = require("express-async-handler")
// const urlString =
// "https://accept.paymobsolutions.com/api/acceptance/post_pay?success=true&is_void=false&created_at=2023-02-15T00%3A46%3A12.769881&is_refund=false&is_standalone_payment=true&amount_cents=1000&id=86464605&acq_response_code=00&order=100698188&is_bill=false&is_auth=false&txn_response_code=APPROVED&discount_details=%5B%5D&has_parent_transaction=false&captured_amount=0&source_data.sub_type=MasterCard&error_occured=false&source_data.pan=2346&currency=EGP&integration_id=3389945&source_data.type=card&updated_at=2023-02-15T00%3A46%3A31.380865&is_voided=false&is_refunded=false&profile_id=694292&owner=1181580&is_settled=false&is_capture=false&merchant_commission=0&is_3d_secure=true&hmac=33ff8381e86f989e611e41746f4f327f6bee39643cc9e0e82620c6d549648a62d1e5ca89bd86f5c0bb9153456d820330dc6f9cc56ce9be7f9426f26a38620d2d&pending=false&data.message=Approved&bill_balanced=false&refunded_amount_cents=0";

// const intWallet = process.env.INT_WALLET;
// const WalletAcceptance =
//   "https://accept.paymob.com/api/acceptance/payments/pay";
const intCard = process.env.INT_CARD;
const Iframe = process.env.IFRAME;
const AuthApi = "https://accept.paymob.com/api/auth/tokens";
const PaymentOrders = "https://accept.paymob.com/api/ecommerce/orders";
const PaymentAcceptance =
  "https://accept.paymob.com/api/acceptance/payment_keys";

const paymentVerification = asyncHandler(async (req, res) => {
  if (!req.body.carts ) return res.status(400).json({msg:"Please Add Customer Carts"})
  const products = req.body.carts.map(p => {
    return {
      name: p.productInfo.name,
      amount_cents: p.productInfo.price,
      description: p.productInfo.flavor,
      quantity: p.customerQuantity,
    }
  });
  try {
    const getAuthToken = await axios.post(AuthApi, { api_key: process.env.PAYMOP_API_KEY});
    const token = getAuthToken.data.token;
      const paymentVerification = await axios.post(PaymentOrders, {
        auth_token: token,
        delivery_needed: "false",
        amount_cents:req.body.totalPrice * 100,
        currency: "EGP",
        items: products
      })
      const order_id = paymentVerification.data.id.toString();
    res.status(200).json({ token, order_id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
})

const userInformation = asyncHandler(async (req, res) => await axios.post(PaymentAcceptance, {
      auth_token: req.body.auth_token,
      amount_cents: req.body.amount_cents * 100, 
      expiration: 1800,
      order_id: req.body.order_id,
      billing_data: {
        email:req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone_number: req.body.phone_number,
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "EG",
        state: "NA",
      },
      currency: "EGP",
      integration_id: intCard,
}).then((userInfo) => res.status(200).send({ Link: Iframe + userInfo.data.token })))

const paymentValidation = async (req, res) => {
  const sortData = {};
  const order = req.body.order_id; 
  const verificationLink = req.body.Link; // https://accept.paymobsolutions.com/api/acceptance/post_pay?source_data.pan=2346&is_standalone_payment=true&order=101743379&error_occured=false&owner=1181580&created_at=2023-02-19T21%3A14%3A23.061141&bill_balanced=false&is_refunded=false&amount_cents=500000&id=87414101&is_bill=false&acq_response_code=00&is_auth=false&updated_at=2023-02-19T21%3A14%3A42.639887&has_parent_transaction=false&success=true&discount_details=%5B%5D&refunded_amount_cents=0&integration_id=3389945&is_capture=false&is_settled=false&currency=EGP&captured_amount=0&profile_id=694292&merchant_commission=0&hmac=b308fe52256b1f5c0a1956f2bbfce4a535da3f7b6b9d36d03f38afcf74ba46b276078ef7f633e5301683c2a147e1e0e535a255c11232c03a4b4d7b1b69e9bdcf&source_data.sub_type=MasterCard&is_3d_secure=true&source_data.type=card&is_voided=false&pending=false&is_refund=false&data.message=Approved&is_void=false&txn_response_code=APPROVED

  const parsedQueries = url.parse(verificationLink, true).query;
  const sortedKeys = Object.keys(parsedQueries).sort();

  for (const key of sortedKeys) sortData[key] = parsedQueries[key];

  if (
    sortData.success === 'true' &&
    sortData.pending === 'false' &&
    order === sortData.order
  ) {
    res.status(200).send({ message: 'Success.'})
  }
  else {  
    res.status(400).send({ message: 'Invalid.' })
  }
};

module.exports = {
  paymentVerification,
  userInformation,
  paymentValidation,
};
