import nodemailer from "nodemailer";
import {sendEmail} from "./email.js"; 

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

export async function notificatiordvtermine(email) {
  //sendEmail gere les erreurs plus de crash 
return await sendEmail({ 
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Votre rendez-vous est terminé",
    html: `
      <h2>Votre rendez-vous est terminé</h2>
      <p>Vous êtes priés de venir récupérer votre véhicule.</p>
    `
  });
}