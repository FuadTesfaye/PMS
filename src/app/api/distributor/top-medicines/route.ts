import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDistributorInsights } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "distributor" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insights = await getDistributorInsights();
  return NextResponse.json(insights.topMedicines);
}
