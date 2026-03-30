import { getMedicines, getOrdersByUser } from '@/lib/store';
import { getSession } from '@/lib/auth';
import CustomerDashboardClient from './CustomerDashboardClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Customer - PharmaCare',
  description: 'Browse medicines and manage your health orders.',
};

export default async function CustomerDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'customer') {
    redirect('/login');
  }

  const medicines = getMedicines();
  const orders = getOrdersByUser(session.id);

  return (
    <CustomerDashboardClient 
      initialMedicines={medicines} 
      initialOrders={orders} 
    />
  );
}
