import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDistributorInsights } from "@/lib/store";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "distributor" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? "30");
  const supplier = url.searchParams.get("supplier") ?? undefined;
  const insights = await getDistributorInsights({
    days: Number.isFinite(days) ? days : 30,
    supplier: supplier && supplier !== "all" ? supplier : undefined,
  });
  return NextResponse.json(insights);
}
