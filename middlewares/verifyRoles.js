const jwt = require('jsonwebtoken')
const userSchema = require("../model/user.model")
const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN,async (err, decoded) => {
        if (err) res.status(401).json({ 'message': 'UnAuthMessage' })
        else {
          if (allowedRoles.includes(decoded.role)) {
            if (decoded.role === 2001) {
              try {
                const customer = await userSchema.findOne({ email: decoded.email })
                if (!customer) res.status(401).json({ "message": " Cannot Find This User" })
                if (!(customer.email === decoded.email)) res.status(401).json({ "message": "You Cannot Access This Page" })
                req.user = decoded
                next()
              } catch (error) {
                res.status(500).json({"message":error.message})
              }
            }
            else {
              req.user = decoded
              next()
            }
          }
          else res.status(401).json({ 'message': `User Did not have Permissions To see This Page User Role is ${decoded.role}` })
        }
      })
    } else res.status(401).json({ 'message': 'UnAuth' })
  }
}
module.exports = verifyRoles;
