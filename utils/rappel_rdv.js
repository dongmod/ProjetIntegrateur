import supabase from '../config/supabaseClient.js';
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function rappelrdv(vehicule_marque, vehicule_plaque, type_service, client_id) {
    // retrouver l'email du client dans la table utilisateurs
    const user = client_id;
    console.log(`Rappel de rendez-vous pour le client_id: ${user}, type_service: ${type_service}, véhicule: ${vehicule_marque} (${vehicule_plaque})`);
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
    subject: "Rappel de votre rendez-vous",
    html: `
      <h2>ceci est un rappel</h2>
      <p>Votre rendez-vous pour le service <strong>${type_service}</strong> de votre ${vehicule_marque} (${vehicule_plaque}) est pour demain. Pensez y</p>
    `
  });
}