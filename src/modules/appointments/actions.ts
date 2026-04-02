'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BookingSchema } from './validators'

export type ActionResult = { success: boolean; error?: string }

export async function bookAppointment(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. Auth check — never trust client_id from the form
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in.' }

  // 2. Validate all fields with Zod
  const parsed = BookingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // 3. Insert — double-booking protection handled by DB trigger
  const { error } = await supabase.from('appointments').insert({
    ...parsed.data,
    client_id: user.id,  // always from session, never from form
  })

  if (error) {
    // Catch the double-booking trigger exception specifically
    if (error.message.includes('double_booking')) {
      return { success: false, error: 'This time slot is already taken. Please choose another.' }
    }
    return { success: false, error: 'Booking failed. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelAppointment(appointmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('client_id', user.id) // RLS also enforces this, but being explicit is good

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
