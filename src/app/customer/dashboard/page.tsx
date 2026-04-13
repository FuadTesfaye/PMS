import { getMedicines, getOrdersByUser } from '@/lib/store';
import { getSession } from '@/lib/auth';
import CustomerDashboardClient from './CustomerDashboardClient';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Customer - PharmaCare',
  description: 'Browse medicines and manage your health orders.',
};

export default async function CustomerDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'pharmacy') {
    redirect('/login');
  }

  const medicines = await getMedicines();
  const orders = await getOrdersByUser(session.id);

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <CustomerDashboardClient 
        initialMedicines={medicines} 
        initialOrders={orders} 
      />
    </DashboardLayout>
  );
}
