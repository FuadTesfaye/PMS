'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/auth';
import { getUser } from '@/lib/store';
import bcrypt from "bcryptjs";

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = await getUser(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Invalid email or password' };
  }

  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const session = await encrypt({
    id: user.id,
    name: user.name,
    role: user.role,
    pharmacyId: user.pharmacyId,
  });

  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  if (user.role === 'admin') redirect('/admin/dashboard');
  if (user.role === 'distributor') redirect('/distributor/dashboard');
  if (user.role === 'sales_rep') redirect('/sales-rep/dashboard');
  if (user.role === 'pharmacist') redirect('/pharmacist/dashboard');
  redirect('/pharmacy/dashboard');
}

export async function logout() {
  (await cookies()).delete('session');
  redirect('/login');
}
