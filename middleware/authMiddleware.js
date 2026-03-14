import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] 
console.log("TOKEN RECU DANS LE MIDDLEWARE AUTH =", token) //connecté au backend, token reçu dans le middleware auth === Nouveau 👈
console.log("JWT_SECRET DANS LE MIDDLEWARE AUTH =", process.env.JWT_SECRET) //👈 Nouveau 




  console.log("TOKEN RECU DANS LE MIDDLEWARE AUTH =", token) //connecté au backend, token reçu dans le middleware auth =
//console.log("JWT_SECRET DANS LE MIDDLEWARE AUTH =", process.env.JWT_SECRET) //vérifier que la variable d'environnement est bien accessible dans le middleware auth

  if (!token) return res.status(401).json({ message: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) //👈 Nouveau 
    console.log("TOKEN DECODED DANS LE MIDDLEWARE AUTH =", decoded) // Nouveau 👈
    req.user = decoded
    next()

  } catch (error) {
    console.log("Erreur de décodage du token:", error.message) // Nouveau 👈
    res.status(401).json({ message: 'Invalid token',error:error.message })
  }
}

