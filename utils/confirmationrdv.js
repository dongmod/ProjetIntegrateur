//import nodemailer from "nodemailer";
import {sendEmail} from "./email.js"; 

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

export async function confirmationEmail(email, type_service, date_rendezvous) {
  // sendEmail gere les erreurs plus de crash 
  // return await transporter.sendMail({
try {
  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirmation de votre rendez-vous",
    html: `
      <h2>Confirmation de votre rendez-vous</h2>
      <p>Votre rendez-vous pour le service <strong>${type_service}</strong> est confirmé.</p>
      <p>Date : <strong>${date_rendezvous}</strong></p>
    `
  });
}catch (err) {
    console.error("Erreur envoi email confirmation:", err.message);
  }
}