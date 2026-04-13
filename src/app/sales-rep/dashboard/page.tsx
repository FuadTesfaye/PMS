import DashboardLayout from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getFieldReports, getPharmacies } from "@/lib/store";
import { redirect } from "next/navigation";
import SalesRepDashboardClient from "./SalesRepDashboardClient";

export const metadata = {
  title: "Dashboard | Sales Rep - ZPIN",
  description: "Submit competitor and stock intelligence from the field.",
};

export default async function SalesRepDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "sales_rep") redirect("/login");

  const [reports, pharmacies] = await Promise.all([getFieldReports(session.id), getPharmacies()]);

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <SalesRepDashboardClient reports={reports} pharmacies={pharmacies} />
    </DashboardLayout>
  );
}
