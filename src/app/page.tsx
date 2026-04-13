import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'admin') {
    redirect('/admin/dashboard');
  } else if (session.role === 'pharmacist') {
    redirect('/pharmacist/dashboard');
  } else {
    redirect('/customer/dashboard');
  }

  return null;
}
