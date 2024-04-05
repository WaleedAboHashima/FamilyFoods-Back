const userSchema = require("../model/user.model")
const productSchema = require("../model/product.model")
const reportSchema = require("../model/report.model")
const orderSchema = require("../model/order.model")
const bcrypt = require("bcrypt")
const fs = require("fs")
const cloudinary = require("cloudinary").v2
const asyncHandler = require("express-async-handler")
const ApiError = require("../middlewares/apiError")
const Rules = require("../model/rules.model")

// Cloudinay Config Adapt

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});


// Get All Users Info

const getAllUsers = asyncHandler(async (req, res) => {
    // Retrieving All Users Information from DataBase And Retrive To Client Side
    res.status(200).json({
        "All_Users": (await userSchema.find({}).populate({ path: "SR" })).map((user) => {
            
            delete user._doc.password && delete user._doc.__v
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                phone:user.phone,
                role: user.role,
                remainAmount: user.remainAmount,
                paperVerification: user.paperVerification,
                SR_username:user.SR&& user.SR.username,
            }
        })
    });
})

// Add New Employee To System

const AddUser = asyncHandler(async (req, res, next) => {
    // Retrieve Data From Client Side
    const { username, phone, type, email, password } = req.body
    // Check Duplicate Email Or Phone In DataBase
    await userSchema.findOne({ $or: [{ email: email }, { phone: phone }] }).then(async dublicate => {
        // Return Error Message if Duplicate Email Or Phone In DataBase
        if (dublicate) return next(new ApiError("email Or Phone Already Found in Stock Keeper List Please Change The phone Or The Email", 409))
        // Create a new User Account According To User Type
        await userSchema.create({
            username, email, phone,
            role: type === "Admin" ? 5050 : type === "Accountant" ? 5000 : type === "SR" ? 2500 : null,
            password: await bcrypt.hash(password, 10)
        }).then((user) => res.status(201).json({ user }))
    })
})

// Delete User Form System

const deleteUser = asyncHandler(async (req, res) => await userSchema.findByIdAndDelete(req.params.userId).then(() => res.sendStatus(200)))

// Add New Product

const AddNewProduct = asyncHandler(async (req, res, next) => {
    // Retrive Data From Client Side  
    const { name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, category, categoryAR } = req.body
    // Check Duplicate Product
    await productSchema.findOne({ name: name, price: price, flavor: flavor, category: category, categoryAR: categoryAR }).then(async (duplicate) => {
        // Return ForBidden Response To Client Side With Product Id Of It 
        if (duplicate) return next(new ApiError("Duplicate Product Name", 409))
        // If An Img Recived From Client Side
        if (req.file) {
            // Upload Img To Cloudinary Storage
            const uploadImg = cloudinary.uploader.upload(req.file.path)
            // Creating New Product To DataBase
            await productSchema.create({ name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, img: { imgId: (await uploadImg).public_id, imgURL: (await uploadImg).secure_url, imgSrc: req.file.path }, category, categoryAR }).then((product, error) => {
                // Return Occuring Error
                if (error) return next(new ApiError(error.message, error.statusCode))
                // Return Success Response To Client Side
                res.status(201).json({ product })
            })
        }
        // If Not Recived Img From Client Side
        else {
            await productSchema.create({ name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, category, categoryAR }).then((product, error) => {
                // Return Occuring Error
                if (error) return next(new ApiError(error.message, error.statusCode))
                // Return Success Response To Client Side
                res.status(201).json({ product })
            })
        }
    })

})

// Update Product 

const updateProduct = asyncHandler(async (req, res) => {
    // Retrive Data From Client Side  
    const { productId } = req.params;
    const { name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, category, categoryAR } = req.body
    // Check Duplicate Product
    await productSchema.findOne({ name: name, price: price, flavor: flavor, category: category }).then(async duplicate => {
        // Return ForBidden Response To Client Side With Product Id Of It 
        if (duplicate) return next(new ApiError("Duplicate Product Name", 409))
        if (req.file) {
            // Retrieve Product Data from DataBase
            await productSchema.findById(productId).then(async product => {
                // Remove Old Product Img From Images Folder 
                fs.unlink(product.img.imgSrc, (error) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                })
                // Remove Old Img From Cloudinary Storge 
                await cloudinary.uploader.destroy(product.img.imgId, function (error, result) {
                    // Check if Error Occured
                    if (error || result.result === "not found") next(new ApiError("Can't Update Product Img ", 404))
                });
                // Upload New Product Image To Cloudinary Storge
                const uploadImg = await cloudinary.uploader.upload(req.file.path)
                // Update Product Data With New Information
                await productSchema.findByIdAndUpdate(productId, { name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, img: { imgId: (await uploadImg).public_id, imgURL: (await uploadImg).secure_url }, category, categoryAR }).then((product) => res.status(201).json({ product }));
            })
        }
        // If An Img Not Recived From Client Side
        else
            // Update The Product Data
            await productSchema.findByIdAndUpdate(productId, { name, nameAR, flavor, flavorAR, price, quantity, weight, validDate, expDate, category, categoryAR }).then((product) => res.status(201).json({ product }));
    })
}
)
// Delete Product 

const deleteProduct = asyncHandler(async (req, res) => {
    // Retrive Data From Client Side
    const { productId } = req.params;
    // Making Try Catch Statment

    // Retrieve Product Data From Database
    await productSchema.findById(productId).then(async product => {
        // Check if Product Exists In Database
        if (!product) return next(new ApiError("Product not found", 404))
        // Remove Product Image From Images Folder
        fs.unlink(product.img.imgSrc, (error) => {
            if (error) {
                console.error(error);
                return;
            }
        })
        // Remove The Product Image From Cloudinary Storage
        await cloudinary.uploader.destroy(product.img.imgId, function (error, result) {
            if (error || result.result === "not found") res.status(500).json({ message: "Can't Delete  Product Img " })
        })
        // Remove Product From DataBase
        await productSchema.findByIdAndRemove({ _id: productId }).then(() => res.sendStatus(200))
    })
})

// Get All Reportts

const getAllReports = asyncHandler(async (req, res) => {
    // Return Success Response To Client Side With All Reports 
    res.status(200).json({ Reports: await reportSchema.find({}) });
})

// Delete Report
const deleteReport = asyncHandler(async (req, res, next) => {
    // Retirve Data From Client Side
    const { report_id } = req.params;
    // Check If Report Exists In DataBase
    const report = await reportSchema.findById(report_id)
    // Retrun Error When Report Not Exists
    if (!report) return next(new ApiError("Report Not Exists", 404))
    // Remove Report From DataBase
    await reportSchema.findByIdAndDelete(report_id).then(() => res.sendStatus(200))

})

// Get All Orders

const getOrders = asyncHandler(async (req, res) => {
    // Return Success Response To Client Side With Orders Data
    res.status(200).json({ orders: await orderSchema.find({}).populate("user") })
})

// Archive Order

const archivedOrder = asyncHandler(async (req, res) => {
    // Retrieve Data From CLient Side
    const { order_id } = req.params
    // Retrieve Order Data From DataBase
    const order = await orderSchema.findById(order_id)
    // Return Error IF Order Not Found
    if (!order) return res.status(404).json({ "message": "Order not found" })
    // Update The Archive Value Of Order
    await orderSchema.findByIdAndUpdate(order_id, { archived: !order.archived })
    // Return  Success Response To Client Side
    res.sendStatus(200)
})

// Add Privacy , Security

const addPrivacy = asyncHandler(async (req, res, next) => {
    const { textBody } = req.body
    await Rules.findOne({ type: "privacy" }).then(async (rule) => {
        if (rule) await Rules.findOneAndUpdate({ type: "privacy" },{textBody}).then(() => res.sendStatus(201))
        else Rules.create({type:"privacy",textBody}).then(()=>res.sendStatus(201))
    })
})


const charts = asyncHandler(async (req, res, next) => {
    const { type } = req.query
    if (type === "bar") {
        await productSchema.find({}).then(async(products) => {
            let categories = Array.from(new Set(products.map(product => product.category !== undefined && product.category)))
            const final = await Promise.all(categories.map(async(category) => {
                const productsMatch = await productSchema.find({ category }).select("name nameAR quantity") 
                return { [category]: productsMatch }
            }))
            res.json({ final })
        })
    }
})


const top3 = asyncHandler(async (req, res, next) => {
    await orderSchema.aggregate([
        { $match: { archived: false } }, // Match only non-archived orders
        {
            $group: {
                _id: '$user',
                orderCount: { $sum: 1 },
                user: { $first: '$$ROOT.user' } // Include the user field in the result
            }
        },
        {
            $lookup: {
                from: 'users', // Assuming the user collection is named 'users'
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $project: {
                _id: 0,
                user: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    // Exclude the password field
                },
                orderCount: 1
            }
        },
        { $sort: { orderCount: -1 } }, // Sort in descending order of order count
        { $limit: 3 } // Limit the result to 3 documents
    ]).then((orders) => res.json({ orders }))


})


module.exports = { AddUser, getAllUsers, deleteUser, AddNewProduct, updateProduct, deleteProduct, getAllReports, deleteReport, getOrders, archivedOrder, addPrivacy, charts, top3 }