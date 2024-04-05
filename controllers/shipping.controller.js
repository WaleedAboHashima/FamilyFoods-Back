const userSchema = require("../model/user.model")
const orderSchema = require("../model/order.model");
const productSchema = require("../model/product.model");
const returnSchema = require("../model/returns.model");
const SROrders = require("../model/shipping_order.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../middlewares/apiError");
// Add Customer To Shipping Represintive

exports.AddCustomer = asyncHandler(async (req, res, next) => {
    const SRId = req.user.id
    const { customerId } = req.params
    await userSchema.findById(customerId).then(async customer => {
        if (customer.SR) return next(new ApiError("Customer Already Have SR", 409))
        if (customer.role !== 2001) return next(new ApiError("This User Is Not Customer", 403))
        customer.SR = SRId
        await customer.save()
        res.sendStatus(201)
    })
})

exports.getSRcustomers = asyncHandler(async (req, res, next) => {
    const SRId = req.user.id
    await userSchema.find({ SR: SRId }).then(users => res.json({ users: users.map(user => delete user._doc.password && user) }))
})

// Get Customer Deatails

exports.getCustomerDetails = asyncHandler(async (req, res, next) => {
    const SRId = req.user.id
    const { customerId } = req.params
    await userSchema.findById(customerId).populate({ path: "SR", select: "username email phone" }).then(async customer => {
        if (customer.role !== 2001) return next(new ApiError("Customer Not Found Or You User Id Belong To Anthor Stuff ", 404))
        delete customer._doc.password
        if (!customer.SR) return res.status(200).json({ "customerDetails": customer, "orderDetails": [] })
        if (!customer.SR.equals(SRId)) return next(new ApiError("Customer Belong To Anthor SR", 403))
        const filterCustomer = {
            _id: customer._id,
            username: customer.username,
            email: customer.email,
            phone: customer.phone,
            remainAmount: customer.remainAmount,
            paperVerification: customer.paperVerification,
            SR_Id: customer.SR._id,
            SR_username: customer.SR.username,
            SR_phone: customer.SR.phone,
            SR_email: customer.SR.email
        }
        let totalPayed = 0
        await orderSchema.find({ user: customerId }).populate({
            path: 'products.productId',
            select: 'name nameAR flavor flavorAR price quantity img',
        }).then((customerOrders) => {
            const orderDetails = customerOrders.flatMap(order => {
                totalPayed += order.totalPrice
                return (
                    {
                        _id: order._id,
                        userId: order.userId,
                        status: order.status,
                        totalPrice: order.totalPrice,
                        productsQuantity: order.quantity,
                        orderId: order.orderId,
                        archived: order.archived,
                        date: order.date.toDateString(),
                        products: order.products.flatMap(product => {
                            return {
                                productId: product.productId._id,
                                name: product.productId.name,
                                price: product.productId.price,
                                img: product.productId.img.imgURL,
                                customerQuantity: product.customerQuantity,
                                totalPrice: product.totalPrice
                            }
                        })
                    }
                )
            })
            res.json({ "customerDetails": filterCustomer, orderDetails, totalPayed })
        })
    })
})

// Get All Customers

exports.getAllCustomers = asyncHandler(async (req, res, next) => {
    await userSchema.find({ role: 2001 }).populate({ path: "SR", select: "username email phone" }).then(async (Customers) => {
        if (!Customers.length) return next(new ApiError("No Customers Found", 404))
        res.json({
            customers: Customers.map(customer => {
                return {
                    _id: customer._id,
                    username: customer.username,
                    email: customer.email,
                    phone: customer.phone,
                    remainAmount: customer.remainAmount,
                    paperVerification: customer.paperVerification,
                    SR_Id: customer.SR ? customer.SR._id : null,
                    SR_username: customer.SR ? customer.SR.username : null,
                    SR_phone: customer.SR ? customer.SR.phone : null,
                    SR_email: customer.SR ? customer.SR.email : null
                }
            })
        })
    })
})

// Search Customers

exports.SearchCustomers = asyncHandler(async (req, res) => await userSchema.find({ $or: [{ username: req.query.username && { $regex: new RegExp(req.query.username, 'i') }, role: 2001 }, { email: { $regex: req.query.email && new RegExp(req.query.email, 'i') }, role: 2001 }, { phone: req.query.phone && { $regex: new RegExp(req.query.phone, 'i') }, role: 2001 }] }).select("username email phone SR").then(data => res.status(200).json({ Customers: data })))

// Make Return Products

exports.returnedProducts = async (req, res) => {
    const SRId = req.user.id;
    const { products } = req.body;
    const quantity = products.length;
    const totalPrice = products.reduce((totalPrice, product) => {
        return totalPrice += product.totalPrice
    }, 0)
    await returnSchema.create({
        products,
        quantity,
        totalPrice,
        SR: SRId
    }).then((data, err) => {
        if (err) return next(new ApiError(err.message, err.statusCode))
        res.status(201).json({ data })
    })
}

// Get All Customer Orders

exports.getCustomerOrders = async (req, res) => {
    const SRId = req.user.id
    await orderSchema.find({ SR: SRId }).populate({ path: "products.productId", select: "name nameAR flavor flavorAR price img" }).populate({ path: "user" }).then((findOrder) => {
        if (!findOrder.length) return res.status(403).json({ orders: [] })
        res.json({
            orders: findOrder.map(order => {
                console.log(order.user)
                return {
                    _id: order._id,
                    productQuantity: order.quantity,
                    totalPrice: order.totalPrice,
                    products: order.products.map(product => {
                        return {
                            productId: product._id,
                            name: product.productId.name,
                            nameAR: product.productId.nameAR,
                            flavor: product.productId.flavor,
                            flavorAR: product.productId.flavorAR,
                            img: product.productId.img.imgURL,
                            price: product.productId.price,
                        }
                    }),
                    order_id: order.orderId,
                    user_id: order.user.id,
                    user_name: order.user.username,
                    user_phone: order.user.phone,
                    date: order.date.toDateString(),
                    status: order.status,
                    archived: order.archived,
                    SR: order.SR,
                    method: order.method
                }
            })
        })
    })

}

// Change Order Status

exports.OrderStatus = asyncHandler(async (req, res, next) => {
    const SRId = req.user.id
    const { order_id } = req.params
    await orderSchema.findById(order_id).then(async (findOrder) => {
        if (!findOrder) return next(new ApiError("Order Not Found", 404))
        if (!findOrder.SR) return next(new ApiError("Order Not Have SR", 403))
        if (!findOrder.SR.equals(SRId)) return next(new ApiError("This Order Not Belong To This SR", 403))
        await orderSchema.findByIdAndUpdate(order_id, { status: findOrder.status === "Waiting" ? "Preparing" : findOrder.status === "Preparing" ? "Delivered" : "Delivered" }).then(() => res.sendStatus(200))
    })
})

// Verify Customer Paper

exports.verifyPaper = async (req, res) => {
    const { customerId } = req.params
    const SRId = req.user.id
    try {
        const findUser = await userSchema.findById(customerId)
        if (!findUser) return res.status(403).json({ message: "Customer Not Found" })
        if (findUser.role !== 2001) return res.status(403).json({ message: "This User Doesn't Have Access To Make " })
        if (!findUser.SR) return res.status(403).json({ message: "User Doesn't Have SR" })
        if (!findUser.SR.equals(SRId)) return res.status(403).json({ message: "Invalid Data To Update " })
        if (findUser.paperVerification) return res.status(409).json({ message: "Customer Already Verified His Paper" })
        await userSchema.findByIdAndUpdate(customerId, { paperVerification: true })
        res.status(200).json({ message: "Paper Verified" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
}


exports.getAllReturned = asyncHandler(async (req, res) => res.json({ returnedProducts: await returnSchema.find({ SR: req.user.id }) }))

// Get The Amount On Shipping Representive 

exports.getPayOrders = asyncHandler(async (req, res) => {
    await SROrders.find({ SR: req.user.id, archived: false }).then(orders => {
        if (!orders.length) return res.status(404).json({ "message": "No Orders Found To This SR", "orders": [] })
        const totalToAdmin = orders.reduce((acc, order) => acc += order.remainAmount, 0)
        // Get Also Amount From Customers 
        res.status(200).json({ "totalAdmin": totalToAdmin })
    })
})

// Get Sr Orders From Accounatant
exports.getSrOrders = async (req, res) => {
    const SRId = req.user.id
    await SROrders.find({ SR: SRId }).populate({ path: "products.product", select: "name nameAR flavor flavorAR price img" }).populate({ path: "SR", select: "username email phone paymentAmount" }).then(orders => {
        if (!orders.length) return res.status(404).json({ "message": "No Orders Found To This SR", "orders": [] })
        res.status(200).json({
            orders: orders.map((order) => {
                return {
                    _id: order._id,
                    SR_id: order.SR._id,
                    SR_username: order.SR.username,
                    SR_phone: order.SR.phone,
                    SR_email: order.SR.email,
                    products: order.products.map((product) => {
                        return {
                            _id: product.product._id,
                            name: product.product.name,
                            nameAR: product.product.nameAR,
                            flavor: product.product.flavor,
                            flavorAR: product.product.flavorAR,
                            price: product.product.price,
                            img: product.product.img.imgURL,
                            SRQuantity: product.SRQuantity,
                            totalPrice: product.totalPrice,
                        }
                    }),
                    productsQuantity: order.productsQuantity,
                    remainAmount: order.remainAmount,
                    paymentMade: order.paymentMade,
                    archived: order.archived,
                    date: order.date,
                    paymentHistory: order.paymentHistory
                }
            })
        })
    })
}

exports.getUserDetails = asyncHandler(async (req, res, next) => {
    const { user_id } = req.params
    await userSchema.findById(user_id).then((user) => {
        if (!user) return next(new ApiError("User Not Found", 404))

    })
})

exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { user_id } = req.params
    const { id } = req.user
    await userSchema.findById(user_id).then(async (user) => {
        if (!user) return next(new ApiError("User Not Found", 404))
        if (!user.SR) return next(new ApiError("User Didn't have Sr", 403))
        if (!user.SR.equals(id)) return next(new ApiError("You Are Not Sr To This User", 409))
        user.SR = null
        await user.save()
        res.sendStatus(200)
    })
})