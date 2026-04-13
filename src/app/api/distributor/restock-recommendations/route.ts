import { NextRequest, NextResponse } from "next/server";
import { getDistributorInsights } from "@/lib/store";
import { authorizeInternalOrPartner } from "@/lib/partnerAuth";

export async function GET(request: NextRequest) {
  const auth = await authorizeInternalOrPartner(request, "distributor:restock:read");
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 401 });

  const url = new URL(request.url);
  const supplier = url.searchParams.get("supplier") ?? undefined;
  const insights = await getDistributorInsights({
    days: 30,
    supplier: supplier && supplier !== "all" ? supplier : undefined,
  });
  return NextResponse.json(insights.restockRecommendations);
}
