import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
console.log("AUTH HEADERsssssssssssssssssssss =", req.headers.authorization)
  if (!token) return res.status(401).json({ message: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message })
  }
}
