import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'admin') {
    redirect('/admin/dashboard');
  } else if (session.role === 'distributor') {
    redirect('/distributor/dashboard');
  } else if (session.role === 'sales_rep') {
    redirect('/sales-rep/dashboard');
  } else if (session.role === 'pharmacist') {
    redirect('/pharmacist/dashboard');
  } else {
    redirect('/pharmacy/dashboard');
  }

  return null;
}
