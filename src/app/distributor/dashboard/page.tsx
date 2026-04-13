import DashboardLayout from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getDistributorInsights, getPharmacies, getFieldReports } from "@/lib/store";
import { redirect } from "next/navigation";
import DistributorDashboardClient from "./DistributorDashboardClient";

export const metadata = {
  title: "Dashboard | Distributor - ZPIN",
  description: "National visibility across pharmacies and demand signals.",
};

export default async function DistributorDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "distributor") redirect("/login");

  const [insights, pharmacies, reports] = await Promise.all([
    getDistributorInsights(),
    getPharmacies(),
    getFieldReports(),
  ]);

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <DistributorDashboardClient insights={insights} pharmacies={pharmacies} reports={reports} />
    </DashboardLayout>
  );
}
