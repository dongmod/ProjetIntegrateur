import nodemailer from "nodemailer"
import supabase from "../config/supabaseClient.js"
import { io } from "../server.js";
import { generateInvoicePDFBuffer } from "../utils/facturemail.js"

export const sendFactureByEmail = async (req, res) => {

  try {

    const { id } = req.params

    // Récupérer facture
    const { data: facture } = await supabase
      .from("factures")
      .select("*")
      .eq("id", id)
      .single()

    const { data: items } = await supabase
      .from("facture_items")
      .select("*")
      .eq("facture_id", id)

    const { data: client } = await supabase
      .from("utilisateurs")
      .select("email")
      .eq("user_id", facture.client_id)
      .single()

    //  Générer PDF en mémoire
    const pdfBuffer = await generateInvoicePDFBuffer(facture, items)

    //  Config email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject: "Votre facture Smart Garage",
      html: `
        <h2>Votre facture</h2>
        <p>Bonjour,</p>
        <p>Veuillez trouver votre facture en pièce jointe.</p>
      `,
      attachments: [
        {
          filename: `facture-${facture.id}.pdf`,
          content: pdfBuffer
        }
      ]
    })

    res.json({ message: "Facture envoyée par email " })

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" })
  }
}
