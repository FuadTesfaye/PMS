import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAuditTrails } from "@/lib/store";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "distributor" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));
  const trails = await getAuditTrails(page * pageSize);
  const start = (page - 1) * pageSize;
  const paged = trails.slice(start, start + pageSize);
  return NextResponse.json({ page, pageSize, data: paged });
}
