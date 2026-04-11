import { z } from 'zod';

export const professionalSchema = z.object({
  userId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  title: z.string().min(2),
  bio: z.string().optional(),
});

export const workingHoursSchema = z.object({
  professionalId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(), // Format HH:mm
  endTime: z.string(),   // Format HH:mm
});

export const addStaffSchema = z.object({
  full_name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email Invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().optional(), // Used as "Spécialité"
  password: z.string().min(6, '6 caractères minimum').optional().or(z.literal('')),
  is_active: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).default(true)
});

export const editStaffSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email Invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().optional(),
  password: z.string().optional(), // only provided if changing
  is_active: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).default(true)
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;
export type AddStaffInput = z.infer<typeof addStaffSchema>;
export type EditStaffInput = z.infer<typeof editStaffSchema>;
