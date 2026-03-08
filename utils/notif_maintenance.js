import supabase from '../config/supabaseClient.js';
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function maintenacenitifEmail(user, type_service) {

    // retrouver l'email du client dans la table utilisateurs
    const { data: client } = await supabase
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
  }

  await transporter.sendMail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: client.email,
    subject: "Rendez-vous de maintenance à venir",
    html: `
      <h2>Rendez-vous de maintenance à venir</h2>
      <p>Votre rendez-vous pour le service <strong>${type_service}</strong> est a venir. Pensez y</p>
    `
  });
}