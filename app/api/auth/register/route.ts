import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { userProfileSchema } from "@/lib/types/domain";

export const runtime = "nodejs";

const mockUsers: Map<string, any> = new Map();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validation = userProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid user data", details: validation.error.issues } },
        { status: 400 }
      );
    }

    const { userId, age, city, allergies, sleepHours, dietType, activityLevel } = validation.data;

    // With Prisma, we rely on the DB to be available. Mock fallback is removed for Prisma MVP migrations.
    const existingUser = await prisma.user.findUnique({ where: { userId } });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "USER_EXISTS", message: "User ID already taken" } },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        userId,
        age,
        city,
        allergies,
        sleepHours,
        dietType,
        activityLevel,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        age: user.age,
        city: user.city,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Better error surfacing for debugging
    let errorMessage = "Failed to register user";
    if (error.code === 'P1001' || error.message?.includes('ECONNREFUSED')) {
      errorMessage = "Database connection failed. Please ensure PostgreSQL is running or your POSTGRES_URL is correct.";
    } else if (error.message) {
      errorMessage = `Failed to register user: ${error.message}`;
    }

    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: errorMessage } },
      { status: 500 }
    );
  }
}