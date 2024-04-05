const orderSchema = require("../model/order.model")
const returnSchema = require("../model/returns.model")
const SROrders = require("../model/shipping_order.model")
const userSchema = require("../model/user.model")
const Payment = require("../model/payment.model")
const asyncHandler = require("express-async-handler")
// Add Order To SR

const addSrOrder = async (req, res) => {
    // retrive Data From Client Side
    const { SRId } = req.params
    const { products } = req.body
    // Make Try Catch Statemnt
    try {
        // Find Shipping Represent in DataBase
        const SR = await userSchema.findById(SRId)
        if (!SR) return res.status(404).json({ "message": "SR not found" })
        // Check Shipping Represent Information
        if (SR.role !== 2500) return res.status(404).json({ "message": "This Id Did not Belong To Any SR" })
        // Check Order Information
        if (!products.length) return res.status(400).json({ "message": "All Fields Are Required" })
        // Get Products Quantity
        const productsQuantity = products.length
        // Calculate Product Total Price Of Products
        const remainAmount = products.reduce((acc, product) => {
            return acc += product.totalPrice * product.SRQuantity
        }, 0)
        // Check The Value Of Total Price
        if (!remainAmount) return res.status(400).json({ "message": "invalid Price Of Products" })
        // Create Order
        await SROrders.create({ products, remainAmount, productsQuantity, SR: SRId }).then(async (val, error) => {
            // Check If  Error Occured
            if (error) return res.status(500).message(error.message)
            // Add remaintAmount  To  Shipping Represent Information
            await userSchema.findByIdAndUpdate(SRId, { remainAmount: SR.remainAmount + remainAmount }).then((user) => console.log(user))
            // Sending Adding Response To Client Side
            res.sendStatus(201)
        })
    } catch (error) {
        // Print error message
        console.log(error.message)
        // Send error message to Client Side
        res.status(500).json({ message: error.message })
    }
}

// Get All SR Order

const getAllSrOrders = async (req, res) => {
    // Make Try Catch Statment  
    try {
        // Retrive Orders From Database
        const orders = await SROrders.find({}).populate({ path: "products.product", select: "name nameAR flavor flavorAR price img" }).populate({ path: "SR", select: "username email phone paymentAmount" })
        // Making Customizer Order Attribute Format For Client Side
        const filterOrders = orders.map((order) => {
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
        // Sending Success Response And Orders Details For Client Side
        res.status(200).json({ orders: filterOrders })
    } catch (error) {
        // Print error message
        console.log(error.message)
        // Send error message to Client Side
        res.status(500).json({ message: error.message })
    }

}

// Archive SR Order

const archiveSrOrder = async (req, res) => {
    // Retrieve Data From Client Side
    const { order_id } = req.params
    try {
        // Retrieve Order Data from DataBase
        const order = await SROrders.findById(order_id)
        // Check Existing Order
        if (!order) return res.status(404).json({ "message": "Order not found" })
        // Check If Order Still Has Money To Collect
        if (order.remainAmount != 0 || !order.paymentMade) return res.status(409).json({ "message": "This Order Still Has Money To Collect" })
        // Updateing The Data Of Order 
        await SROrders.findByIdAndUpdate(order_id, { archived: !order.archived })
        // Return Success Response To Client Side
        res.sendStatus(200)
    }
    catch (error) {
        // Print error message
        console.log(error.message)
        // Send error message to Client Side
        res.status(500).json({ message: error.message })
    }
}

// Collect Money belong to order From SR 

const Col_Money = async (req, res) => {
    // Retrieve Data From Client Side
    const { order_id, SRId } = req.params
    const { price } = req.body
    // Check Validation Of Data
    if (!order_id || !SRId) return res.status(400).json({ message: "All Feilds Are Required" })
    if (!price || typeof price !== "number") return res.status(400).json({ message: "Please Enter Valid Price" })
    // Making Try Catch Statment
    try {
        // Retrieve Shipping Represent Information
        const SR = await userSchema.findById(SRId).exec()
        // Check Existing For Shipping Represent Information
        if (!SR) return res.status(404).json({ message: "Can't Find This SR" })
        // Check The Remain Amount Of Shipping Represents
        if (SR.remainAmount === 0) return res.status(403).json({ message: "This SR Already Not Have Remain Amount" })
        // Check The Validation Of Price Value
        if (SR.remainAmount < price) return res.status(409).json({ message: "This Price is Greater Than Remaining Amount Of This SR" })
        // Retrieve Order Information
        const Order = await SROrders.findById(order_id).exec()
        // Check Existing For Order Information
        if (!Order) return res.status(404).json({ message: "Can't Find This Order" })
        // Check The Remain Amount Of Order
        if (Order.remainAmount === 0) return res.status(403).json({ message: "This Order Already Not Have Remain Amount" })
        // Check The Validation Of Price Value
        if (Order.remainAmount < price) return res.status(409).json({ message: "This Price is Greater Than Remaining Amount Of This Order" })
        // Update The Remaining Amount Of This Order 
        await SROrders.findByIdAndUpdate(order_id, { remainAmount: Order.remainAmount - price, paymentHistory: [...Order.paymentHistory, { price }] }, { new: true })
            .then(async (val, error) => {
                // Return Occured Error To Client Side
                if (error) return res.status(500).json({ message: error.message });
                // Update The Status Of Order Payment Status
                if (val.remainAmount === 0) await SROrders.findByIdAndUpdate(order_id, { paymentMade: true })
                // Update The Remaining Amount Of This Shipping Represents 
                await userSchema.findByIdAndUpdate(SRId, { remainAmount: SR.remainAmount - price }).then(() => res.sendStatus(201))
            })
    } catch (error) {
        // Print error message
        console.log(error.message)
        // Send error message to Client Side
        res.status(500).json({ message: error.message })
    }
}

// Get All SR 

const allSR = async (req, res) => {
    // Making Try Catch Statment
    try {
        // Retrive all Shipping Represents 
        const allSR = await userSchema.find({ role: 2500 })
        // Making Success Response with Shipping Represents Data
        res.status(200).json({ "SRs": allSR })
    } catch (error) {
        // Print error message
        console.log(error.message)
        // Send error message to Client Side
        res.status(500).json({ message: error.message })
    }

}

// Get All Returned Product From SR

const getAllReturns = async (req, res) => {
    // Making Try Catch Statment
    try {
        // Retrieving All Returned Product from All Sihpping Represents
        const Allreturns = await returnSchema.find().populate({ path: 'products.productDetails', select: "name nameAR flavor flavorAR price img " }).populate({ path: "SR", select: "username email phone " })
        // Check If Exists Returned Products
        if (!Allreturns.length) return res.status(404).json({ message: "No Returned Product" })
        // Making Success Response To Client Side With  Returned Products
        res.status(200).json(Allreturns)
    } catch (error) {
        // Print error message
        console.log(error.message)
        // Send error message to Client Side
        res.status(500).json({ message: error.message })
    }
}


const getSROrders = async (req, res, next) => await SROrders.findById(req.params.SROrder_id).populate("SR").then((orders) => res.json({ orders }))

const getSr = async (req, res, next) => {
    await User.findById(req.params.SRId).then(async (user) => {
        delete user._doc.password;
        await SROrders.findOne({ SR: user._id }).then((orders) => res.json({ userData: user, orders }))
    })
}

const getTotalOnlinePrice = asyncHandler(async (req, res, next) => {
    await orderSchema.find({ method: "onlinePayment" }).then((orders) => {
        const totalPrice = orders.reduce((acc, order) => {
            return acc += Number(order.totalPrice)
        }, 0)
        res.json({ totalPrice })
    })
}
)


const paymentHistory = asyncHandler(async (req, res, next) => {
    await Payment.find({}).populate("user order").then((payments) => res.json({ payments }))
})
module.exports = { getAllReturns, addSrOrder, getAllSrOrders, archiveSrOrder, Col_Money, allSR, getSROrders, getSr, getTotalOnlinePrice, paymentHistory }