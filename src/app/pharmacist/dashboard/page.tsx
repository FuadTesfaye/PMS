import { getOrders } from '@/lib/store';
import { getSession } from '@/lib/auth';
import PharmacistDashboardClient from './PharmacistDashboardClient';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Pharmacist - PharmaCare',
  description: 'Review prescriptions and manage order fulfillment.',
};

export default async function PharmacistDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'pharmacist') {
    redirect('/login');
  }

  const orders = getOrders();

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <PharmacistDashboardClient 
        initialOrders={orders} 
      />
    </DashboardLayout>
  );
}
