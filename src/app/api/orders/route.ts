import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      sessionId,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, customerEmail, sessionId" },
        { status: 400 }
      );
    }

    // Get cart with items
    const cart = await db.cart.findUnique({
      where: { id: sessionId },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty or not found" },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `DEV-${Date.now()}`;

    // Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: String(customerName),
          customerEmail: String(customerEmail),
          customerPhone: customerPhone ? String(customerPhone) : null,
          address: address ? String(address) : null,
          city: city ? String(city) : null,
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Deduct stock from products
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: sessionId },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
