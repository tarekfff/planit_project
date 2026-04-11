'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { registerClient, registerEstablishment, verifyOtp, signInWithGoogle } from '@/modules/auth/actions';
import { Heart, Scissors, Dumbbell, GraduationCap, UtensilsCrossed, LayoutGrid, ChevronLeft, Camera } from 'lucide-react';

type UserRole = 'establishment' | 'client' | null;
type Step = 'role' | 'category' | 'form' | 'otp';

const CATEGORIES = [
  { id: 'medical', label: 'MÉDICAL', description: 'Cabinet médical, Dentiste, etc.', icon: Heart, color: '#E8F8F8' },
  { id: 'beaute', label: 'BEAUTÉ', description: 'Salon de coiffure, Esthétique, Spa', icon: Scissors, color: '#E8F8F8' },
  { id: 'sport', label: 'SPORT & BIEN-ÊTRE', description: 'Salle de sport, Coach, Yoga', icon: Dumbbell, color: '#FFF3E0' },
  { id: 'formation', label: 'FORMATION', description: 'Centre de formation, Cours', icon: GraduationCap, color: '#FFF3E0' },
  { id: 'restauration', label: 'RESTAURATION', description: 'Restaurant, Café, Traiteur', icon: UtensilsCrossed, color: '#FCE4EC' },
  { id: 'autre', label: 'AUTRE', description: 'Autre type d\'établissement', icon: LayoutGrid, color: '#FCE4EC' },
] as const;

export function RegisterForm() {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<UserRole>(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleRoleSelect(selectedRole: UserRole) {
    setRole(selectedRole);
    if (selectedRole === 'establishment') {
      setStep('category');
    } else {
      setStep('form');
    }
  }

  function handleCategorySelect(categoryId: string) {
    setCategory(categoryId);
    setStep('form');
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function goBack() {
    setError(null);
    if (step === 'category') {
      setStep('role');
      setRole(null);
    } else if (step === 'form') {
      if (role === 'establishment') {
        setStep('category');
      } else {
        setStep('role');
        setRole(null);
      }
    } else if (step === 'otp') {
      setStep('form');
    }
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Add category for establishment flow
    if (role === 'establishment') {
      formData.append('category', category);
    }

    // Confirm password check for client
    if (role === 'client') {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
    }

    try {
      const action = role === 'establishment' ? registerEstablishment : registerClient;
      const result = await action({ success: false }, formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        setTempEmail(formData.get('email') as string);
        setStep('otp');
        setLoading(false);
        setError(null);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('email', tempEmail);

    try {
      const result = await verifyOtp({ success: false }, formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      setError('La vérification a échoué. Veuillez réessayer.');
      setLoading(false);
    }
  }

  // ──────────────── STEP 1: Role Selection ────────────────
  if (step === 'role') {
    return (
      <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center">
          {/* Avatar illustration */}
          <div className="w-28 h-28 rounded-full overflow-hidden mb-6 bg-[var(--planit-cyan-light)] flex items-center justify-center">
            <Image
              src="/register-avatar.png"
              alt="Planit Avatar"
              width={112}
              height={112}
              className="object-cover"
              priority
            />
          </div>

          <h2 className="text-xl font-bold text-primary mb-6 text-center">
            Commencez en tant que
          </h2>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleRoleSelect('establishment')}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[var(--planit-cyan-light)] hover:bg-[var(--planit-cyan)]/20 border border-[var(--planit-cyan)]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14M9 9h1M9 13h1M9 17h1M17 9h1M17 13h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">Établissement</span>
            </button>

            <button
              onClick={() => handleRoleSelect('client')}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[var(--planit-cyan-light)] hover:bg-[var(--planit-cyan)]/20 border border-[var(--planit-cyan)]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">Client</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">Ou</span>
              </div>
            </div>

            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-medium text-gray-700">Continuer avec Google</span>
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline transition-colors">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ──────────────── STEP 2: Category Selection (Establishment only) ────────────────
  if (step === 'category') {
    return (
      <div className="w-full max-w-[480px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Back button */}
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </button>

          <h2 className="text-xl font-bold text-primary text-center mb-1">
            Nouveau établissement
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Quelle est votre catégorie ?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-[0.97] hover:border-primary/30 text-left"
                  style={{ backgroundColor: cat.color }}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs text-gray-800 uppercase tracking-wide">{cat.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 leading-tight">{cat.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── STEP 4: OTP Verification ────────────────
  if (step === 'otp') {
    return (
      <div className="w-full max-w-[440px] mx-auto animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-bold text-primary mb-2">Vérifiez votre email</h2>
          <p className="text-sm text-gray-500 mb-6">
            Nous avons envoyé un code de confirmation à{' '}
            <span className="font-semibold text-gray-800">{tempEmail}</span>
          </p>

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center pt-2 pb-4">
              <Label htmlFor="code" className="sr-only">Code de confirmation</Label>
              <InputOTP maxLength={8} name="code" id="code">
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-10 h-14 text-2xl" />
                  <InputOTPSlot index={1} className="w-10 h-14 text-2xl" />
                  <InputOTPSlot index={2} className="w-10 h-14 text-2xl" />
                  <InputOTPSlot index={3} className="w-10 h-14 text-2xl" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} className="w-10 h-14 text-2xl" />
                  <InputOTPSlot index={5} className="w-10 h-14 text-2xl" />
                  <InputOTPSlot index={6} className="w-10 h-14 text-2xl" />
                  <InputOTPSlot index={7} className="w-10 h-14 text-2xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 animate-in fade-in duration-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-semibold bg-primary hover:bg-[var(--planit-cyan-dark)] transition-all shadow-md"
              disabled={loading}
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ──────────────── STEP 3: Registration Form ────────────────
  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Back button */}
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Avatar upload */}
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-20 h-20 rounded-full bg-[var(--planit-cyan-light)] border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all overflow-hidden group"
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Camera className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <h2 className="text-xl font-bold text-primary text-center mb-6">
          {role === 'establishment' ? 'Nouveau établissement' : 'Nouveau client'}
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {role === 'establishment' ? (
            <>
              {/* Establishment fields */}
              <div className="space-y-1.5">
                <Label htmlFor="establishment_name" className="text-sm font-medium text-gray-700">
                  Nom d&apos;établissement
                </Label>
                <Input
                  id="establishment_name"
                  name="establishment_name"
                  placeholder="Mon établissement"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ville" className="text-sm font-medium text-gray-700">Ville</Label>
                <Input
                  id="ville"
                  name="ville"
                  placeholder="Alger"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@example.com"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">N° de téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0555 00 00 00"
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
            </>
          ) : (
            <>
              {/* Client fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Nom</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Doe"
                    required
                    className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">Prénom</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    required
                    className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">N° de téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0555 00 00 00"
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmer mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-base font-semibold bg-primary hover:bg-[var(--planit-cyan-dark)] transition-all shadow-md mt-2"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'Inscription'}
          </Button>
        </form>
      </div>
    </div>
  );
}
