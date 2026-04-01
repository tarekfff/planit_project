'use server';

import { loginSchema, registerSchema, LoginInput, RegisterInput } from './validators';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/manager');
}

export async function register(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        name: result.data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/manager');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
