'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signInWithGoogle } from '@/modules/auth/actions';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

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
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border-muted/40 shadow-xl backdrop-blur-sm bg-background/95">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form action={signInWithGoogle} className="w-full mb-6">
          <Button variant="outline" type="submit" className="w-full h-11 text-base font-medium shadow-sm hover:bg-muted/50 transition-colors">
            <svg className="w-5 h-5 mr-2 -ml-1" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              className="h-11 transition-all focus:ring-2 focus:-translate-y-0.5"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link href={ROUTES.auth.forgotPassword} className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="h-11 transition-all focus:ring-2 focus:-translate-y-0.5"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg mt-6"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
