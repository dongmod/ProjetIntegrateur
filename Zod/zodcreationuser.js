import { z } from "zod";

export const schema = z
  .object({
    email: z.string().email("Email invalide"),

    mot_de_passe: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&/.])[A-Za-z\d#@$!%*?&/.]{8,}$/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
      ),

    confirmation_mot_de_passe: z
      .string()
      .min(8, "La confirmation du mot de passe doit contenir au moins 8 caractères"),
  })

  // Vérification que les deux mots de passe correspondent
  .refine(
    (data) => data.mot_de_passe === data.confirmation_mot_de_passe,
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmation_mot_de_passe"],
    }
  );