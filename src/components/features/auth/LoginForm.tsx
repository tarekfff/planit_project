'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signInWithGoogle } from '@/modules/auth/actions';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login({ success: false }, formData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-[520px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Avatar overlapping left */}
      <div className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <div className="w-44 h-44 rounded-full overflow-hidden bg-gradient-to-br from-[var(--planit-cyan)] to-[var(--planit-cyan-dark)] shadow-xl">
          <Image
            src="/login-avatar.png"
            alt="Planit"
            width={176}
            height={176}
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:pl-28">
        {/* Mobile avatar */}
        <div className="flex justify-center mb-6 md:hidden">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[var(--planit-cyan)] to-[var(--planit-cyan-dark)] shadow-lg">
            <Image
              src="/login-avatar.png"
              alt="Planit"
              width={112}
              height={112}
              className="object-cover"
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-1">
          Connectez-vous
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Connectez-vous pour accéder à votre espace
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nom@exemple.com"
              required
              className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mot de passe
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </div>

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
            {loading ? 'Connexion...' : 'Connexion'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => signInWithGoogle()}
            className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
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
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Vous n&apos;avez pas de compte ?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
