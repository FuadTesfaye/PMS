import { redirect } from "next/navigation";

export const metadata = {
  title: 'Dashboard | Customer - PharmaCare',
  description: 'Browse medicines and manage your health orders.',
};

export default async function CustomerDashboardPage() {
  redirect("/pharmacy/dashboard");
}
