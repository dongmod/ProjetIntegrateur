import { z } from "zod";

export const schema1 = z
  .object({
    email: z.string().email("Email invalide"),

    mot_de_passe: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&/.])[A-Za-z\d#@$!%*?&/.]{8,}$/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
      ),

})


