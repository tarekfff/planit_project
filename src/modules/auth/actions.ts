'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginSchema, RegisterSchema, ClientRegisterSchema, EstablishmentRegisterSchema } from './validators'
import { ROUTES } from '@/lib/constants/routes'

export type ActionResult = {
  success: boolean
  error?: string
  data?: any
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect(data.url)
}

export async function login(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { success: false, error: error.message }

  redirect(ROUTES.dashboard.root)
}

export async function register(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password, full_name, role } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
    },
  })

  if (error) return { success: false, error: error.message }

  return { success: true, data: { email } }
}

export async function registerClient(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = ClientRegisterSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { first_name, last_name, email, phone, password } = parsed.data
  const full_name = `${first_name} ${last_name}`
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role: 'client', phone },
    },
  })

  if (error) return { success: false, error: error.message }

  return { success: true, data: { email } }
}

export async function registerEstablishment(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = EstablishmentRegisterSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { establishment_name, ville, email, phone, password, category } = parsed.data
  const supabase = await createClient()

  // 1. Create the user account with manager role
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: establishment_name, role: 'manager', phone },
    },
  })

  if (authError) return { success: false, error: authError.message }

  // 2. Create the establishment record linked to the new manager
  if (authData.user) {
    const { error: estError } = await supabase
      .from('establishments')
      .insert({
        name: establishment_name,
        wilaya: ville,
        phone: phone || null,
        manager_id: authData.user.id,
        description: category,
      })

    if (estError) {
      // Non-blocking: establishment creation might fail due to RLS on unverified users
      // The establishment can be created after email verification in a later step
      console.error('Establishment creation deferred:', estError.message)
    }
  }

  return { success: true, data: { email } }
}

export async function verifyOtp(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const { VerifyOtpSchema } = await import('./validators')
  const parsed = VerifyOtpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, code } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  })

  if (error) return { success: false, error: error.message }

  redirect(ROUTES.dashboard.root)
}

export async function requestPasswordReset(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ResetPasswordRequestSchema } = await import('./validators')
  const parsed = ResetPasswordRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) return { success: false, error: error.message }

  return { success: true, data: { email } }
}

export async function resetPasswordWithOtp(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ResetPasswordVerifySchema } = await import('./validators')
  const parsed = ResetPasswordVerifySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, code, password } = parsed.data
  const supabase = await createClient()

  // 1. Verify the OTP code
  const { error: otpError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'recovery',
  })

  if (otpError) return { success: false, error: otpError.message }

  // 2. The OTP successfully established an encrypted session. We can securely update the password now.
  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) return { success: false, error: updateError.message }

  // 3. Password successfully reset. Redirect immediately into the private dashboard.
  redirect(ROUTES.dashboard.root)
}

export async function logout(formData?: FormData) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.auth.login)
}
