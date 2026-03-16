import supabase from '../config/supabaseClient.js';
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function debutreparation(email, vin) {

    // retrouver l'email du client dans la table utilisateurs
   /* const { data: client } = await supabase
      .from("utilisateurs")
      .select("email")
      .eq("user_id", user)
      .single();
  if (!client) {
    console.error(` Aucun utilisateur trouvé avec user_id = ${user}`);
    return;
  }

 if (!client.email) {
    console.error(` L'utilisateur ${user} n'a pas d'email enregistré`);
    return;
  }*/
try {
  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Debut de réparation",
    html: `
      <h2> Début de réparation</h2>
      <p>Votre véhicule <strong>${vin}</strong> est en cours de réparation.</p>
    `
  });
}catch (err) {
    console.error("Erreur envoi email maintenance:", err.message);
  }
}