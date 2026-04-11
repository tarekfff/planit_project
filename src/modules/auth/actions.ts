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

/**
 * Helper: creates the establishment for a manager via the SECURITY DEFINER RPC.
 * Idempotent — returns the existing ID if one already exists.
 */
async function ensureEstablishment(supabase: Awaited<ReturnType<typeof createClient>>, user: any) {
  if (user?.user_metadata?.role !== 'manager') return

  const estName = user.user_metadata?.establishment_name || user.user_metadata?.full_name || 'Mon Établissement'
  const { error } = await supabase.rpc('create_manager_establishment', {
    p_name: estName,
    p_wilaya: user.user_metadata?.wilaya || 'Non défini',
    p_phone: user.user_metadata?.phone || '',
    p_description: user.user_metadata?.category || '',
  })

  if (error) {
    console.error('Failed to create establishment via RPC:', error.message)
  }
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
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { success: false, error: error.message }

  // Create establishment if this is a manager without one
  if (data?.user) {
    await ensureEstablishment(supabase, data.user)
  }

  redirect(ROUTES.dashboard.root)
}

export async function register(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password, full_name, role } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
    },
  })

  // Check if email already exists (Supabase returns a user with 0 identities)
  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    return { success: false, error: 'Cet email est déjà utilisé. Veuillez vous connecter.' }
  }

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role: 'client', phone },
    },
  })

  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    return { success: false, error: 'Cet email est déjà utilisé. Veuillez vous connecter.' }
  }

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

  // signUp creates the auth user → trigger creates the profile.
  // Establishment is created later via RPC after OTP verification.
  // We store all the details in user_metadata so verifyOtp can read them.
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: establishment_name, 
        role: 'manager', 
        phone,
        establishment_name,
        wilaya: ville,
        category
      },
    },
  })

  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    return { success: false, error: 'Cet email est déjà utilisé. Veuillez vous connecter.' }
  }

  if (authError) {
    console.error('Signup error:', authError.message)
    return { success: false, error: authError.message }
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

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  })

  if (error) return { success: false, error: error.message }

  // OTP verified → user is now authenticated → create the establishment
  if (data?.user) {
    await ensureEstablishment(supabase, data.user)
  }

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

  const { error: otpError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'recovery',
  })

  if (otpError) return { success: false, error: otpError.message }

  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) return { success: false, error: updateError.message }

  redirect(ROUTES.dashboard.root)
}

export async function logout(formData?: FormData) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.auth.login)
}
