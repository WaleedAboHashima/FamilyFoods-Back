const route = require("express").Router();

const { getUserInfo, editUserInfo, getAllProducts, getProduct, searchProduct, changePassword, ReportInAuth, getPrivacy } = require("../controllers/user.controller");
const { editUserInfoValidator, changePasswordValidator, getProductValidator, ReportInAuthValidator } = require("../utils/vaildators/user.validator")

route.get("/", getUserInfo)
route.put("/", editUserInfoValidator, editUserInfo)
route.put("/password", changePasswordValidator, changePassword)
route.post("/report", ReportInAuthValidator,ReportInAuth)
route.get("/products", getAllProducts)
route.get('/products/search', searchProduct)
route.get("/products/:productId", getProductValidator, getProduct)
route.get("/privacy", getPrivacy)

module.exports = route