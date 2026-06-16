import { z } from "zod";

export const collectionFormSchema = z.object({
  client_id: z.string().uuid("Selecione um cliente"),
  collection_address: z
    .string()
    .max(500, "Máximo de 500 caracteres")
    .optional(),
  quantity: z.string().optional(),
  weight: z.string().optional(),
  description: z.string().max(500, "Máximo de 500 caracteres").optional(),
  scheduled_date: z.string().optional(),
});

export type CollectionFormInput = z.input<typeof collectionFormSchema>;
export type CollectionFormType = z.infer<typeof collectionFormSchema>;
