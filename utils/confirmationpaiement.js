import nodemailer from "nodemailer";
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
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "confirmation de paiement",
    html: `
      <h2>Votre paiement a été confirmé</h2>
      <p>Merci de votre confiance.</p>
    `
  });
}