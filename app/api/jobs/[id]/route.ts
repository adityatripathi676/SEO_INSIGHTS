// app/api/jobs/[id]/route.ts
// GET /api/jobs/:id  — Poll a single job's status
// DELETE /api/jobs/:id — Delete a job
import { NextRequest, NextResponse } from "next/server";
import { getJobById, getJobBySnapshotId, deleteJob } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try by UUID first, then by snapshot_id (for backward compat with URL routing)
    let job = getJobById(id);
    if (!job) {
      job = getJobBySnapshotId(id);
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("[Jobs/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteJob(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Jobs/:id DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
