import { NextResponse } from "next/server";
import { addPrescription, listPrescriptions } from "@/lib/db/prescriptionService";
import { prescriptionEntrySchema } from "@/lib/types/domain";
import { getMongoErrorMessage } from "@/lib/db/errorHandling";

export async function GET() {
  try {
    const prescriptions = await listPrescriptions();
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
          message: getMongoErrorMessage(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const created = await addPrescription(parsed.data);

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
          message: getMongoErrorMessage(error),
        },
      },
      { status: 500 }
    );
  }
}
