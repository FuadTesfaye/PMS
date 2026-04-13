import { getMedicines, getOrders, getStatistics } from '@/lib/store';
import { getSession } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Admin - PharmaCare',
  description: 'Manage inventory and view pharmacy reports.',
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const medicines = await getMedicines();
  const orders = await getOrders();
  const stats = await getStatistics();

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <AdminDashboardClient 
        initialMedicines={medicines} 
        initialOrders={orders} 
        stats={stats}
      />
    </DashboardLayout>
  );
}
