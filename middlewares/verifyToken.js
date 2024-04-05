const jwt = require('jsonwebtoken')
const verifyToken = (req, res, next) => {
  const token =
  req.headers.authorization && req.headers.authorization.split(' ')[1]
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
      if (err) res.status(401).json({ 'message': 'UnAuthMessage' })
      else {
        req.user = decoded
        next()
      }
    })
  } else res.status(401).json({ 'message': 'UnAuth' })
}
module.exports = verifyToken
