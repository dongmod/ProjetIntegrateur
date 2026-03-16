import express from "express";
import jwt from "jsonwebtoken";
import supabase from '../config/supabaseClient.js'

const router = express.Router();

router.get('/verificationmail/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET
    );
    const token = req.params.token;
    await supabase
      .from('utilisateurs')
      .update({ verifie: true, verification_token: token })
      .eq('email', decoded.email);

    res.send("Compte confirmé ");
  } catch (err) {
    res.send("Lien invalide ou expiré ");
  }
});

export default router;