import { z } from 'zod';

export const establishmentSchema = z.object({
  name: z.string().min(2),
  wilaya: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  address: z.string().min(5),
});

export type EstablishmentInput = z.infer<typeof establishmentSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  contact_email: z.string().email("Email invalide").or(z.literal("")).optional(),
});

export const workingHourSchema = z.object({
  day: z.string(),
  time: z.string(),
  closed: z.boolean(),
});

export const workingHoursSchema = z.array(workingHourSchema);

export const addServiceSchema = z.object({
  name: z.string().min(2, "Le nom du service est trop court"),
  duration_minutes: z.coerce.number().min(5, "La durée minimum est de 5 minutes").max(480),
  description: z.string().optional(),
  is_active: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).default(true),
});

export const editServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Le nom du service est trop court"),
  duration_minutes: z.coerce.number().min(5, "La durée minimum est de 5 minutes").max(480),
  description: z.string().optional(),
  is_active: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).default(true),
});
