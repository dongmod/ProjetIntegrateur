// src/utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(email, verificationToken) {
  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirmation de compte",
    html: `
      <h2>Bienvenue</h2>
      <p>Clique pour confirmer :</p>
<a href="https://hydroptic-unimpeding-julissa.ngrok-free.dev/api/auth/verificationmail/${verificationToken}"> cliquez ici pour confirmer votre compte
      </a>
    `
  });
}