import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function mailcapteurinactif(email, capteur) {
  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Capteur inactif détecté",
    html: `
      <h2>Capteur inactif détecté</h2>
      <p>Un capteur est inactif depuis plus de 5 minutes.</p>
      <p>identifiant : <strong>${capteur}</strong></p>
    `
  });
}