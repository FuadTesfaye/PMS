import { getMedicines, getOrders, getStatistics, getComplianceRecords, getPharmacyScores, getPharmacies } from '@/lib/store';
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

  const [medicines, orders, stats, complianceRecords, pharmacyScores, pharmacies] = await Promise.all([
    getMedicines(),
    getOrders(),
    getStatistics(),
    getComplianceRecords(),
    getPharmacyScores(),
    getPharmacies(),
  ]);

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <AdminDashboardClient 
        initialMedicines={medicines} 
        initialOrders={orders} 
        stats={stats}
        complianceRecords={complianceRecords}
        pharmacyScores={pharmacyScores}
        pharmacies={pharmacies}
      />
    </DashboardLayout>
  );
}
