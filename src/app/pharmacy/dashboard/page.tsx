import { getMedicines, getOrdersByUser } from "@/lib/store";
import { getSession } from "@/lib/auth";
import CustomerDashboardClient from "@/app/customer/dashboard/CustomerDashboardClient";
import DashboardLayout from "@/components/DashboardLayout";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Pharmacy - ZPIN",
  description: "Manage orders and prescription-backed medicine requests.",
};

export default async function PharmacyDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "pharmacy") {
    redirect("/login");
  }

  const medicines = await getMedicines();
  const orders = await getOrdersByUser(session.id);

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <CustomerDashboardClient initialMedicines={medicines} initialOrders={orders} />
    </DashboardLayout>
  );
}
