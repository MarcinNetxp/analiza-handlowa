import { NextResponse } from "next/server";
import { probeActivitiesModule } from "@/lib/crm/suitecrmClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await probeActivitiesModule();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Probe failed",
      },
      { status: 500 },
    );
  }
}
