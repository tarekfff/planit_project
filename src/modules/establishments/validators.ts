import { z } from 'zod';

export const establishmentSchema = z.object({
  name: z.string().min(2),
  wilaya: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  address: z.string().min(5),
});

export type EstablishmentInput = z.infer<typeof establishmentSchema>;
