import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalProducts, totalOrders, categoriesResult, ratingResult] =
      await Promise.all([
        db.product.count(),
        db.order.count(),
        db.product.groupBy({
          by: ["category"],
        }),
        db.product.aggregate({
          _avg: { rating: true },
        }),
      ]);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      categoriesCount: categoriesResult.length,
      averageRating: Number((ratingResult._avg.rating || 0).toFixed(1)),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
