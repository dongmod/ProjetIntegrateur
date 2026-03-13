// src/utils/email.js
import nodemailer from "nodemailer";
//import { success } from "zod";

// -----Creation du transporteur ---- 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//-----Verification de la connexion au demarrage ----- NOUVEAU 
transporter.verify((error, success) => {
  if (error) {
    console.error("Erreur de connexion SMTP:", error.message);
  } else {
    console.log(" Serveur SMTP prêt à envoyer des emails");
  }
});

// ======= Fonction d'envoi générique avec gestion d'erreurs ===== New 
export const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${mailOptions.to} - ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    // Limite quotidienne Gmail dépassée
    if (error.responseCode === 550 && error.code === "EENVELOPE") {
      console.error("Limite Gmail atteinte - Email non envoyé à:", mailOptions.to);
      return { success: false, reason: "LIMIT_EXCEEDED" };
    }

    // Authentification échouée
    if (error.code === "EAUTH") {
      console.error(" Erreur d'authentification Gmail - Vérifiez EMAIL_USER et EMAIL_PASS");
      return { success: false, reason: "AUTH_FAILED" };
    }

    // Connexion impossible
    if (error.code === "ECONNECTION") {
      console.error(" Impossible de se connecter au serveur SMTP");
      return { success: false, reason: "CONNECTION_FAILED" };
    }

    // Autres erreurs
    console.error("Erreur d'envoi d'email:", error.message);
    return { success: false, reason: error.message };
  }
};


// =======Email de verification de compte =====
// export async function sendVerificationEmail(email, verificationToken) {
//   await transporter.sendMail({
//     from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Confirmation de compte",
//     html: `
//       <h2>Bienvenue</h2>
//       <p>Clique pour confirmer :</p>
// <a href="https://hydroptic-unimpeding-julissa.ngrok-free.dev/api/auth/verificationmail/${verificationToken}"> cliquez ici pour confirmer votre compte
//       </a>
//     `
//   });
// }


// ─── Email de vérification de compte ────────────────────────────────────────
export async function sendVerificationEmail(email, verificationToken) {
  const verificationUrl = `https://hydroptic-unimpeding-julissa.ngrok-free.dev/api/auth/verificationmail/${verificationToken}`;

  const result = await sendEmail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Confirmation de votre compte Smart Garage",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background-color: #1a1a2e; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="color: #ffffff;">🚗 Smart Garage</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333;">Bienvenue !</h2>
            <p style="color: #666; font-size: 16px;">
              Merci de vous être inscrit. Cliquez sur le bouton ci-dessous 
              pour confirmer votre compte.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 16px;
                        font-weight: bold;">
                ✅ Confirmer mon compte
              </a>
            </div>

            <p style="color: #999; font-size: 12px;">
              Ce lien expire dans 24 heures.<br>
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>

        </body>
      </html>
    `
  });

  return result;
}

// ─── Email de rappel de rendez-vous ─────────────────────────────────────────
export async function sendRappelEmail(email, { nom, typeService, date, heure }) {
  const result = await sendEmail({
    from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔔 Rappel de votre rendez-vous Smart Garage",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background-color: #1a1a2e; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="color: #ffffff;">🚗 Smart Garage</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333;">Rappel de rendez-vous</h2>
            <p style="color: #666;">Bonjour <strong>${nom}</strong>,</p>
            <p style="color: #666;">Voici les détails de votre prochain rendez-vous :</p>

            <div style="background: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <p>🔧 <strong>Service :</strong> ${typeService}</p>
              <p>📅 <strong>Date :</strong> ${date}</p>
              <p>🕐 <strong>Heure :</strong> ${heure}</p>
            </div>

            <p style="color: #999; font-size: 12px;">
              Smart Garage - Votre garage intelligent
            </p>
          </div>

        </body>
      </html>
    `
  });

  return result;
// }catch (err) {
//     console.error("Erreur envoi email confirmation:", err.message);
  }

// }