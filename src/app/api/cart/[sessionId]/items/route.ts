import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Valid productId and quantity (>= 1) are required" },
        { status: 400 }
      );
    }

    const productIdNum = parseInt(productId, 10);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(productIdNum) || isNaN(quantityNum)) {
      return NextResponse.json(
        { error: "Invalid productId or quantity" },
        { status: 400 }
      );
    }

    // Check product exists and get info
    const product = await db.product.findUnique({
      where: { id: productIdNum },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stock < quantityNum) {
      return NextResponse.json(
        { error: `Insufficient stock. Only ${product.stock} available.` },
        { status: 400 }
      );
    }

    // Ensure cart exists
    let cart = await db.cart.findUnique({
      where: { id: sessionId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { id: sessionId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: sessionId,
        productId: productIdNum,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantityNum;

      // Re-check stock with existing quantity
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${product.stock} available. You already have ${existingItem.quantity} in your cart.` },
          { status: 400 }
        );
      }

      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await db.cartItem.create({
        data: {
          cartId: sessionId,
          productId: productIdNum,
          quantity: quantityNum,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
        },
      });
    }

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
