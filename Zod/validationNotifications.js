import { z } from "zod";

export const schema = z
  .object({
    message: z.string().min(10, "Le message ne peut pas être vide. au moins 10 Cracteres"),


})


