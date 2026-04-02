import { z } from 'zod'

export const BookingSchema = z.object({
  professional_id:  z.string().uuid(),
  service_id:       z.string().uuid(),
  establishment_id: z.string().uuid(),
  start_time:       z.string().datetime(),
  end_time:         z.string().datetime(),
  client_notes:     z.string().max(500).optional(),
})

export type BookingInput = z.infer<typeof BookingSchema>
