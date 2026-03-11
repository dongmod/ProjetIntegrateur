import nodemailer from "nodemailer";
import { genererRecuPDF } from "./recu_paiement.js";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



export async function confirmationpaiement(email, factureid) {
  const pdfBuffer = await genererRecuPDF(factureid);
  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "confirmation de paiement",
    html: `
      <h2>Votre paiement a été confirmé</h2>
      <p>merci de votre confiance.</p>
    `,
     attachments: [
      {
        filename: "votre facture.pdf",
        content: pdfBuffer
      }
    ]
  });
}
