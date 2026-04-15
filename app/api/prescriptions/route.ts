import { NextResponse } from "next/server";
import { addPrescription, listPrescriptions, deletePrescription } from "@/lib/db/prescriptionService";
import { prescriptionEntrySchema } from "@/lib/types/domain";
import { getDbErrorMessage } from "@/lib/db/errorHandling";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const prescriptions = await listPrescriptions(session.user.id);
    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: getDbErrorMessage(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = prescriptionEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid prescription payload.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  try {
    const created = await addPrescription(parsed.data, session.user.id);

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: getDbErrorMessage(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "Missing record ID" }, { status: 400 });

    const deleted = await deletePrescription(id);
    if (!deleted) return NextResponse.json({ success: false, error: "Record not found or already deleted" }, { status: 404 });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json({ success: false, error: { message: "Failed to delete" } }, { status: 500 });
  }
}
