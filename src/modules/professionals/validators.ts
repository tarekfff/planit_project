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

export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;
