import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.product.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    const result = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
