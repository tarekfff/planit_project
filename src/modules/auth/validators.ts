import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const RegisterSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'manager']).default('client'),
})

export const ClientRegisterSchema = z.object({
  first_name: z.string().min(2, 'Le prénom est requis'),
  last_name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export const EstablishmentRegisterSchema = z.object({
  establishment_name: z.string().min(2, "Le nom de l'établissement est requis"),
  ville: z.string().min(2, 'La ville est requise'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
})

export const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().min(6, 'Verification code must be at least 6 characters'),
})

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const ResetPasswordVerifySchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().min(6, 'Verification code must be at least 6 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type ClientRegisterInput = z.infer<typeof ClientRegisterSchema>
export type EstablishmentRegisterInput = z.infer<typeof EstablishmentRegisterSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
export type ResetPasswordRequestInput = z.infer<typeof ResetPasswordRequestSchema>
export type ResetPasswordVerifyInput = z.infer<typeof ResetPasswordVerifySchema>


