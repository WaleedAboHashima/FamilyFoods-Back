
const cartSechema = require("../model/cart.model");
const orderSchema = require("../model/order.model")
const productSchema = require("../model/product.model");
const userSchema = require("../model/user.model");
const asyncHandler = require("express-async-handler")
const ApiError = require("../middlewares/apiError")
const Payment = require("../model/payment.model")
const paypal = require('paypal-rest-sdk');
const CC = require("currency-converter-lt")


paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// Get Customer Cart
exports.getCart = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    await cartSechema.findOne({ user: id }).select("products customerQuantity").populate({
        path: 'products.product',
        select: 'name nameAR flavor flavorAR price quantity img',
    }).then(cart => {

        const filterCart = cart ? cart.products.map((product) => {
            return {
                productInfo:
                {
                    productId: product.product._id,
                    name: product.product.name,
                    nameAR: product.product.nameAR,
                    flavor: product.product.flavor,
                    flavorAR: product.product.flavorAR,
                    price: product.product.price,
                    quantity: product.product.quantity,
                    img: product.product.img.imgURL
                },
                customerQuantity: product.customerQuantity,
                totalPrice: Number(product.customerQuantity) * Number(product.product.price)
            }
        }) : []
        res.status(200).json({ "carts": filterCart });
    })
})

// Customer Add Products To Cart

exports.AddtoCart = asyncHandler(async (req, res, next) => {
    const { customerQuantity } = req.body
    const { id } = req.user
    const { productId } = req.params
    const productInfo = await productSchema.findById(productId)
    await cartSechema.findOne({ user: id }).then(async duplicateCart => {
        if (duplicateCart) {
            const userProducts = duplicateCart.products;
            var duplicateProduct = false;
            userProducts.forEach((e) =>
                e.product.equals(productId) ? (duplicateProduct = e) : null
            )
            if (duplicateProduct) {
                duplicateProduct.customerQuantity += Number(customerQuantity);
                duplicateProduct.totalPrice = Number(duplicateProduct.customerQuantity) * Number(productInfo.price);
                await duplicateCart.save();
                res.sendStatus(200);
            } else {
                duplicateCart.products = [
                    ...userProducts,
                    {
                        product: productInfo.id,
                        customerQuantity: customerQuantity ? customerQuantity : 1,
                        totalPrice: customerQuantity ? customerQuantity * productInfo.price : 1 * productInfo.price,
                    },
                ];
                await duplicateCart.save();
                res.sendStatus(200);
            }
        } else {
            await cartSechema.create({
                user: id,
                products: [
                    {
                        product: productId,
                        customerQuantity: customerQuantity ? customerQuantity : 1,
                        totalPrice: customerQuantity ? customerQuantity * productInfo.price : productInfo.price,
                    },
                ],
            });
            res.sendStatus(200);
        }
    })
})

// Delete Product From Cart

exports.deleteFromCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { id } = req.user;
    await cartSechema.findOne({ user: id }).then(async foundCart => {
        if (!foundCart) return res.json({ carts: [] })
        var userProducts = foundCart.products;
        if (userProducts.length > 1) {
            foundCart.products = foundCart.products.filter(product => !product.product.equals(productId))
            await foundCart.save();
            res.sendStatus(200);
        } else await cartSechema.findOneAndDelete({ user: id }).then(() => res.sendStatus(200))
    })
})

// Delete Customet Cart => Delete All Products

exports.deleteCart = asyncHandler(async (req, res, next) => {
    const { id } = req.user;
    await cartSechema.findOne({ user: id }).then(async cart => {
        if (!cart) return res.json({ carts: [] });
        else await cartSechema.findByIdAndDelete(cart._id).then(() => res.sendStatus(200))
    })
})

// Get Customer Orders

exports.getOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.user;
    await orderSchema.find({ user: id }).populate({ path: "products.productId", select: "name nameAR flavor flavorAR price img" }).then(findOrders => {
        if (!findOrders.length) return next(new ApiError("Orders Not Found", 404))
        else res.json({
            "orders": findOrders.map(order => {
                return {
                    _id: order._id,
                    productQuantity: order.quantity,
                    totalPrice: order.totalPrice,
                    products: order.products.map(product => {
                        return {
                            productId: product.productId._id,
                            name: product.productId.name,
                            nameAR: product.productId.nameAR,
                            flavor: product.productId.flavor,
                            flavorAR: product.productId.flavorAR,
                            img: product.productId.img.imgURL,
                            price: product.productId.price,
                            customerQuantity: product.customerQuantity,
                            totalPrice: product.totalPrice
                        }
                    }),
                    type: order.type && order.type,
                    order_id: order.orderId,
                    user_id: order.id,
                    date: order.date.toDateString(),
                    status: order.status,
                    archived: order.archived,
                    SR: order.SR,
                    way: order.way,
                    remainAmount: order.way === "installment" && order.remainAmount,
                    starterAmount: order.way === "installment" && order.starterAmount,
                    deliverd: order.deliverd,
                    deliverdDate: order.deliverdDate && order.deliverdDate

                }
            })
        })
    })
})

// Customer Make An Order

exports.AddOrder = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.user;
        const { type } = req.query;
        const userCart = await cartSechema.findOne({ user: id });
        const filterProducts = userCart.products.map((product) => {
            return {
                productId: product.product,
                customerQuantity: product.customerQuantity,
                totalPrice: product.totalPrice,
            };
        });
        const quantity = filterProducts.length;
        const totalPrice = filterProducts.reduce((acc, product) => {
            return (acc += Number(product.totalPrice));
        }, 0);
        const user = await userSchema.findById(id);
        if (user.SR) {
            if (type === "Online") {
                const { orderId } = req.body;
                if (!orderId) {
                    throw new ApiError("Please Add OrderID", 400);
                }
                const order = await orderSchema.create({
                    products: filterProducts,
                    user: id,
                    orderId,
                    method: "onlinePayment",
                    way: "Full",
                    type: "Paymop",
                    quantity,
                    SR: user.SR,
                    totalPrice,
                    Pay_Completed_Suc: true,
                });
                await Payment.create({
                    user: id,
                    order: order._id,
                    transaction_id: orderId,
                    amount: totalPrice,
                });
            } else if (type === "Paypal") {
                const order = await orderSchema.create({
                    products: filterProducts,
                    user: id,
                    method: "onlinePayment",
                    way: "Full",
                    type: "Paypal",
                    quantity,
                    SR: user.SR,
                    totalPrice,
                    Pay_Completed_Suc: true,
                });
                await Payment.create({
                    user: id,
                    order: order._id,
                    amount: totalPrice,
                });
            } else {
                await orderSchema.create({
                    products: filterProducts,
                    user: id,
                    method: "Cash",
                    quantity,
                    way: "Full",
                    type: "Cash",
                    SR: user.SR,
                    totalPrice,
                    Pay_Completed_Suc: false,
                });
            }
            res.sendStatus(201);
        } else {
            throw new ApiError("SR First Should Add Customer", 409);
        }
    } catch (err) {
        next(err);
    }
});

// Make An Installment Order

exports.installmentOrder = asyncHandler(async (req, res, next) => {
    const { carts, starterAmount } = req.body;
    const { id } = req.user
    const { type } = req.query
    const filterProducts = carts.map((product) => {
        return {
            productId: product.productInfo && product.productInfo.productId,
            customerQuantity: product.customerQuantity,
            totalPrice: product.totalPrice
        }
    })
    const quantity = filterProducts.length
    const totalPrice = filterProducts.reduce((acc, product) => {
        return acc += Number(product.totalPrice)
    }, 0)
    const remainAmount = totalPrice - starterAmount
    const user = await userSchema.findById(id)
    if (user.paperVerification) {
        if (user.SR) {
            if (type === "Online") {
                const { orderId } = req.body
                if (!orderId) return next(new ApiError("Please Add OrderID", 400))
                user.remainAmount += remainAmount
                await user.save()
                await orderSchema.create({ products: filterProducts, user: id, orderId, method: "onlinePayment", quantity, SR: user.SR, totalPrice, way: "installment", starterAmount, remainAmount }).then(() => res.sendStatus(201))
            }
            else {
                user.remainAmount += remainAmount
                await user.save()
                await orderSchema.create({ products: filterProducts, user: id, method: "Cash", quantity, SR: user.SR, totalPrice, Pay_Completed_Suc: false, way: "installment", starterAmount, remainAmount }).then(() => res.sendStatus(201))
            }
        } else return next(new ApiError("SR First Should Add Customer", 409))
    } else return next(new ApiError("Paper Verification First", 403))
})

exports.archiveOrders = asyncHandler(async (req, res, next) => {
    const { order_id } = req.params
    const { id } = req.user
    await orderSchema.findById(order_id).then(async (order) => {
        if (!order) return next(new ApiError("Order not Found", 404))
        if (!order.user.equals(id)) return next(new ApiError("This Order Not Belong To This User", 409))
        await orderSchema.findByIdAndUpdate(order_id, { archived: true }).then(() => res.sendStatus(200))
    })
})



exports.paypalAuth = asyncHandler(async (req, res, next) => {
    const { id } = req.user

    const userCart = await cartSechema.findOne({ user: id })
    const totalPrice = userCart.products.reduce((acc, product) => {
        return acc += Number(product.totalPrice)
    }, 0)
    const currency_converter = new CC({ from: "EGP", to: "USD" })
    let quantity = userCart.products.length
    const paymentData = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:8000/success",
            "cancel_url": "http://localhost:8000/cancel"
        },
        "transactions": [{
            "item_list": {
            },
            "amount": {
                "currency": "USD",
                "total": `${Number((await currency_converter.convert(totalPrice)).toFixed())}`
            },
            "description": "Products"
        }]
    };
    paypal.payment.create(paymentData, (err, payment) => {
        if (err) return next(new ApiError(err.message, err.statusCode))
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
        res.json({ approvalUrl })
    })
})

