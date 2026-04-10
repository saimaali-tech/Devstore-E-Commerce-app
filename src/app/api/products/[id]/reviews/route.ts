import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userName, rating, title, comment } = body;

    // Validate required fields
    if (!userName || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: userName, rating, title, comment" },
        { status: 400 }
      );
    }

    // Validate rating range
    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        productId,
        userName: String(userName),
        rating: ratingValue,
        title: String(title),
        comment: String(comment),
      },
    });

    // Recalculate product rating and review count
    const allReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / allReviews.length).toFixed(1));

    await db.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
