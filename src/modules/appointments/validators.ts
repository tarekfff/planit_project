import { z } from 'zod';

export const appointmentSchema = z.object({
  professionalId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  serviceId: z.string().uuid().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
