export const roleFiltre = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Accès interdit" })
      console.log("LOGIN BODY:", req.user);
    }
    next()
  }
}
