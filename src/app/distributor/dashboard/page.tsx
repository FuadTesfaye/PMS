import DashboardLayout from "@/components/DashboardLayout";
import { getSession } from "@/lib/auth";
import { getDistributorInsights, getPharmacies, getFieldReports, getOpenAlerts, getAuditTrails } from "@/lib/store";
import { redirect } from "next/navigation";
import DistributorDashboardClient from "./DistributorDashboardClient";

export const metadata = {
  title: "Dashboard | Distributor - ZPIN",
  description: "National visibility across pharmacies and demand signals.",
};

export default async function DistributorDashboardPage({
  searchParams,
}: {
  searchParams?: { days?: string; supplier?: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "distributor") redirect("/login");

  const days = searchParams?.days ? Number(searchParams.days) : 30;
  const supplier = searchParams?.supplier && searchParams.supplier !== "all" ? searchParams.supplier : undefined;

  const [insights, pharmacies, reports, alerts, auditTrails] = await Promise.all([
    getDistributorInsights({ days, supplier }),
    getPharmacies(),
    getFieldReports(),
    getOpenAlerts(),
    getAuditTrails(30),
  ]);

  return (
    <DashboardLayout user={{ name: session.name, role: session.role }}>
      <DistributorDashboardClient
        insights={insights}
        pharmacies={pharmacies}
        reports={reports}
        alerts={alerts}
        auditTrails={auditTrails}
      />
    </DashboardLayout>
  );
}
