// app/api/report/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { getJobById, failJob } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const job = getJobById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Mark as failed with "Cancelled by user" message
    failJob(id, "Cancelled by user");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Cancel] Error:", error);
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 });
  }
}
