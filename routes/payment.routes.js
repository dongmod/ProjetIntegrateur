import express from "express"
import Stripe from "stripe"
import supabase from "../config/supabaseClient.js"
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post("/creatiopayment", verifyToken, async (req, res) => {
  try {
    const { amount, rendezvous_id } = req.body
    const { data: facturerdv } = await supabase
      .from("factures")
      .select("*")
      .eq("rendezvous_id", rendezvous_id)
      .single()
    // retrouver  client_id dans factures
    const client_id = facturerdv.client_id
    console.log("client_id à notifier =", client_id)
    // retrouver  email du client dans utilisateurs
    const { data: client } = await supabase
      .from("utilisateurs")
      .select("email")
      .eq("user_id", client_id)
      .single()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Paiement service garage",
            },
            unit_amount: amount ,//* 100, // Stripe = cents
          },
          quantity: 1,
        },
      ],



      
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      //retrouver  rendesvous_id dans factures

      metadata: {
        id:facturerdv.id,
        user_id: req.user.id,
        user_email: client.email
      }
    })

    res.json({ url_de_payement: session.url })

  } catch (err) {
  console.error("Erreur Stripe :", err)
  res.status(500).json({ message: "Erreur paiement", error: err.message, stack: err.stack })
}
})

export default router