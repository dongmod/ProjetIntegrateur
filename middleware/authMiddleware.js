import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]


// console.log("JWT_SECRET =", req.headers.authorization)
console.log("JWT_SECRET =", process.env.JWT_SECRET)
console.log ("TOKEN RECU:", token)
  if (!token) return res.status(401).json({ message: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.log("ERROR JWT:", error.message) // Log de l'erreur pour debug
    res.status(401).json({ message: 'Invalid token', error: error.message })
  }
}