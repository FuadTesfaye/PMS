'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/auth';
import { getUser } from '@/lib/store';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = getUser(email);

  if (!user || user.password !== password) {
    return { error: 'Invalid email or password' };
  }

  // Create session
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await encrypt({ id: user.id, name: user.name, role: user.role, expires });

  // Save session in cookie
  (await cookies()).set('session', session, { expires, httpOnly: true });

  // Redirect based on role
  if (user.role === 'admin') redirect('/admin/dashboard');
  if (user.role === 'pharmacist') redirect('/pharmacist/dashboard');
  redirect('/customer/dashboard');
}

export async function logout() {
  (await cookies()).delete('session');
  redirect('/login');
}
