import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // MOCK FOR DEMO: Instantly return success without touching Prisma
    return NextResponse.json({ message: "Mock user securely registered" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
  }
}