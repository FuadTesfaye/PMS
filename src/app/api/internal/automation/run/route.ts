import { NextRequest, NextResponse } from "next/server";
import { generateComplianceExpiryAlerts, generateLowStockAlerts, getSystemSettingValue } from "@/lib/store";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-automation-key");
  if (!process.env.AUTOMATION_SECRET || secret !== process.env.AUTOMATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lowStockThreshold = Number(await getSystemSettingValue("threshold.low_stock", "10"));
  const expiryDays = Number(await getSystemSettingValue("threshold.compliance_expiry_days", "30"));
  const [lowStock, compliance] = await Promise.all([
    generateLowStockAlerts(Number.isFinite(lowStockThreshold) ? lowStockThreshold : 10),
    generateComplianceExpiryAlerts(Number.isFinite(expiryDays) ? expiryDays : 30),
  ]);

  return NextResponse.json({
    success: true,
    lowStockGenerated: lowStock.length,
    complianceGenerated: compliance.length,
  });
}
