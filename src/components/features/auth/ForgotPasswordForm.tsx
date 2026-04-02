'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requestPasswordReset, resetPasswordWithOtp } from '@/modules/auth/actions';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  async function handleRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const result = await requestPasswordReset({ success: false }, formData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        setTempEmail(email);
        setStep(2); // Move to OTP + Password Verify step
        setLoading(false);
        setError(null);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) throw err;
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    formData.append('email', tempEmail);

    try {
      const result = await resetPasswordWithOtp({ success: false }, formData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) throw err;
      setError('Failed to reset password. Please verify your code and try again.');
      setLoading(false);
    }
  }

  if (step === 2) {
    return (
      <Card className="w-full border-muted/40 shadow-xl backdrop-blur-sm bg-background/95 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Secure Reset</CardTitle>
          <CardDescription className="text-base text-balance">
            We've sent a recovery code to <span className="font-semibold text-foreground">{tempEmail}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="space-y-4 flex flex-col items-center justify-center pt-2 pb-4">
              <Label htmlFor="code" className="sr-only">Recovery Code</Label>
              <InputOTP maxLength={8} name="code" id="code" autoFocus>
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-11 transition-all focus:ring-2 focus:-translate-y-0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
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
              {loading ? 'Authenticating & Saving...' : 'Reset My Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-muted/40 shadow-xl backdrop-blur-sm bg-background/95">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary">Forgot Password</CardTitle>
        <CardDescription className="text-base">
          Enter your email address and we'll send you an 8-digit recovery code.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleRequestSubmit} className="space-y-4">
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

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg mt-8"
            disabled={loading}
          >
            {loading ? 'Requesting Code...' : 'Send Recovery Code'}
          </Button>

          <div className="pt-4 text-center">
            <Link href={ROUTES.auth.login} className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors">
              Wait, I remember my password!
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
