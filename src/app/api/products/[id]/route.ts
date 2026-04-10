import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET(
  _request: NextRequest,
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

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const parsedProduct = {
      ...product,
      images: parseJsonField<string[]>(product.images, [product.image]),
      tags: parseJsonField<string[]>(product.tags, []),
    };

    return NextResponse.json({
      product: parsedProduct,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
