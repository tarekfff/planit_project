import { RegisterForm } from '@/components/features/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="absolute h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[100px] duration-10000 delay-500" style={{ top: '-10%', right: '-10%' }} />
        <div className="absolute h-[600px] w-[600px] animate-pulse rounded-full bg-primary/20 blur-[100px] duration-10000" style={{ bottom: '-10%', left: '-10%' }} />
      </div>

      <div className="z-10 mx-auto flex w-full max-w-[500px] flex-col items-center space-y-8">
        {/* Branding Logo Placeholer */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <span className="text-2xl font-bold">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Planit</span>
        </div>

        <RegisterForm />

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
