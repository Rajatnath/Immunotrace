import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { userProfileSchema } from "@/lib/types/domain";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        age: user.age,
        city: user.city,
        allergies: user.allergies,
        sleepHours: user.sleepHours,
        dietType: user.dietType,
        activityLevel: user.activityLevel,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = userProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid data", details: validation.error.issues } },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.update({
      where: { userId },
      data: validation.data
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        age: user.age,
        city: user.city,
        allergies: user.allergies,
        sleepHours: user.sleepHours,
        dietType: user.dietType,
        activityLevel: user.activityLevel,
      },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}