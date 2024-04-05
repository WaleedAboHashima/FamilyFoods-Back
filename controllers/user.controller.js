const userSchema = require("../model/user.model")
const asyncHandler = require("express-async-handler")
const { FilterProduct } = require("../utils/Product")
const bcrypt = require("bcrypt")
const ApiError = require("../middlewares/apiError")
const productSchema = require("../model/product.model");
const reportSchema = require("../model/report.model");
const Rules = require("../model/rules.model");

// Get User Info

exports.getUserInfo = async (req, res) => {
    // Retrive User Info From Database
    const user = await userSchema.findById(req.user.id)
    // Delete User Password From Info
    delete user._doc.password && delete user._doc.__v
    user._doc.SR = user._doc.SR ? true : false
    // Send Reponse to Client Side
    res.status(200).json({ user })
}

// Change User Information

exports.editUserInfo = asyncHandler(async (req, res, next) => {
    // Retrive Required Data From Client
    const { id } = req.user
    const { username, email, phone } = req.query
    // If Username Need To Modify
    if (username) {
        // Update Username
        await userSchema.findByIdAndUpdate(id, { username }, { new: true }).then(async (user) => {
            delete user._doc.password && delete user._doc.__v
            res.status(201).json({ user })
        })
    }
    // If Username Need To Modify
    else if (email) {
        // Check Dublicate Email Address
        await userSchema.findOne({ email }).then(async dub => {
            // Return Error When Dublicate 
            if (dub) return next(new ApiError("Anthor User Use This Email", 409))
            // Update Email
            await userSchema.findByIdAndUpdate(id, { email }, { new: true }).then((user) => {
                delete user._doc.password && delete user._doc.__v
                res.status(201).json({ user })
            })
        })
    }
    else if (phone) {
        // Check Dublicate Phone
        await userSchema.findOne({ phone }).then(async dub => {
            // Return Error When Dublicate 
            if (dub) return next(new ApiError("Anthor User Use This Phone", 409))
            // Update Phone
            await userSchema.findByIdAndUpdate(id, { phone }, { new: true }).then((user) => {
                delete user._doc.password && delete user._doc.__v
                res.status(201).json({ user })
            })
        })
    }
})

// Change Password To User

exports.changePassword = asyncHandler(async (req, res, next) => {
    // Retrive Required Data From Client
    const { id } = req.user
    const { oldPassword, newPassword } = req.body
    // Retrieve User Data from Database
    await userSchema.findById(id).then(async user => {
        if (!user) return next(new ApiError("User not found", 404))
        // Check Old Password Is Equal To User Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) return next(new ApiError("Old Password Not Match", 400))
        // Update Password
        await userSchema.findByIdAndUpdate(id, { password: await bcrypt.hash(newPassword, 10) }, { new: true }).then(async (user) => {
            delete user._doc.password && delete user._doc.__v
            res.status(201).json({ user })
        })
    })
})

// Get All Products

exports.getAllProducts = asyncHandler(async (req, res, next) => {
    // Retrive All Produsts From Database
    await productSchema.find({}).then((products) => {
        // Retrieve All Categories From Database
            res.status(200).json({ "Products": FilterProduct(products), categories: Array.from(new Set(products.map(product => product.category !== undefined && product.category))) })
    })
})

// Get Product

exports.getProduct = asyncHandler(async (req, res, next) => {
    // Retrive Product Id From Client
    const { productId } = req.params
    if (!productId) return next(new ApiError("Enter Valid Product Id"))
    // Find Product
    await productSchema.findById(productId).then((product) => {
        if (!product) return next(new ApiError("Product Not Found", 404))
        // Return Product Data
        res.status(200).json({
            product: {
                _id: product._id,
                name: product.name,
                nameAR: product.nameAR,
                flavor: product.flavor,
                flavorAR: product.flavorAR,
                img: product.img.imgURL,
                price: product.price,
                quantity: product.quantity,
                weight: product.weight,
                validDate: product.validDate,
                expDate: product.expDate,
                category: product.category,
                categoryAR: product.categoryAR,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            }
        })
    })
})

// Search Product

exports.searchProduct = asyncHandler(async (req, res, next) => {
    // Retrive Query Data From Client 
    const { name, nameAR, category, categoryAR } = req.query
    // Find Products
    await productSchema.find({
        $or:
            [
                { name: name && { $regex: new RegExp(name, 'i') } },
                { nameAR: nameAR && { $regex: new RegExp(nameAR, 'i') } },
                { category: category && { $regex: new RegExp(category, 'i') } },
                { categoryAR: categoryAR && { $regex: new RegExp(categoryAR, 'i') } }
            ]
    }).then((products, err) => {
        if (err) return next(new ApiError(err.message, 400))
        // Return Products To Client Side
        res.status(200).json({ "Products": FilterProduct(products) })
    })
})

// Make Report 
exports.ReportInAuth = asyncHandler(async (req, res) => {
    // Create Document For Report
    await reportSchema.create({ username: req.body.username, position: req.body.position, message: req.body.message, phone: req.body.phone }).then(report => res.status(201).json({ report }))
})

exports.getPrivacy = asyncHandler(async (req, res, next) => await Rules.findOne({ type: "privacy" }).then(rule => res.json({ privacy: rule, updatedAt: rule.updatedAt.toDateString() })))