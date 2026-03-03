import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function notificatiordvtermine(email) {
  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Votre rendez-vous est terminé",
    html: `
      <h2>Votre rendez-vous est terminé</h2>
      <p>Vous êtes priés de venir récupérer votre véhicule.</p>
    `
  });
}