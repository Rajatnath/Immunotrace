import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const p = await prisma.prescription.deleteMany({
      where: { userId: session.user.id }
    });
    // User record is kept to maintain session, but clinical data is purged
    return NextResponse.json({ 
      success: true, 
      wiped: { prescriptions: p.count } 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
