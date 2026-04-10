import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH: Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
  try {
    const { sessionId, id } = await params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: "Quantity is required" },
        { status: 400 }
      );
    }

    const quantityNum = parseInt(quantity, 10);

    if (isNaN(quantityNum) || quantityNum < 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    // Verify the cart item belongs to this cart session
    const cartItem = await db.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: sessionId,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // If quantity is 0, remove the item
    if (quantityNum === 0) {
      await db.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Check stock availability
      const product = await db.product.findUnique({
        where: { id: cartItem.productId },
      });

      if (product && product.stock < quantityNum) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${product.stock} available.` },
          { status: 400 }
        );
      }

      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity: quantityNum },
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
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a cart item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
  try {
    const { sessionId, id } = await params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    // Verify the cart item belongs to this cart session
    const cartItem = await db.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: sessionId,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await db.cartItem.delete({
      where: { id: itemId },
    });

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
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    );
  }
}
