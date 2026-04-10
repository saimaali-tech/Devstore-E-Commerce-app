import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    let cart = await db.cart.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await db.cart.create({
        data: { id: sessionId },
        include: {
          items: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
