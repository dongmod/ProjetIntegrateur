import nodemailer from "nodemailer";
<<<<<<< HEAD
import {sendEmail} from "./email.js"; 

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

export async function confirmationpaiement(email) {
  return await sendEmail({ 
=======
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
>>>>>>> origin/feature/backend
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "confirmation de paiement",
    html: `
      <h2>Votre paiement a été confirmé</h2>
<<<<<<< HEAD
      <p>Merci de votre confiance.</p>
    `
=======
      <p>merci de votre confiance.</p>
    `,
     attachments: [
      {
        filename: "votre facture.pdf",
        content: pdfBuffer
      }
    ]
>>>>>>> origin/feature/backend
  });
}
