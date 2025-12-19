import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

    let query = sql`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        COUNT(DISTINCT oi.id) as item_count,
        SUM(oi.price * oi.quantity) as total_amount
      FROM license_orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN license_order_items oi ON o.id = oi.order_id
      WHERE o.deleted_at IS NULL
    `;

    // Apply filters
    if (userId) {
      query = sql`${query} AND o.user_id = ${userId}`;
    }

    if (status !== "all") {
      query = sql`${query} AND o.status = ${status}`;
    }

    query = sql`${query}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalQuery = sql`
      SELECT COUNT(*) as count FROM license_orders WHERE deleted_at IS NULL
    `;

    const [orders, totalResult] = await Promise.all([query, totalQuery]);
    const total = Number(totalResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      orders: orders.map(o => ({
        id: o.id,
        userId: o.user_id,
        userName: o.user_name,
        userEmail: o.user_email,
        status: o.status,
        totalAmount: Number(o.total_amount || 0),
        itemCount: Number(o.item_count || 0),
        shippingAddress: o.shipping_address,
        paymentMethod: o.payment_method,
        trackingNumber: o.tracking_number,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List license orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch license orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, cartItems, shippingAddress, paymentMethod } = body;

    if (!userId || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "User ID and cart items required" },
        { status: 400 }
      );
    }

    // Create order
    const newOrder = await sql`
      INSERT INTO license_orders (
        user_id, shipping_address, payment_method, status
      )
      VALUES (
        ${userId}, ${shippingAddress || null}, ${paymentMethod || 'credit_card'}, 'pending'
      )
      RETURNING *
    `;

    // Create order items
    await Promise.all(cartItems.map(async (item: any) => {
      await sql`
        INSERT INTO license_order_items (
          order_id, product_id, variant_id, quantity, price
        )
        VALUES (
          ${newOrder[0].id}, ${item.productId}, ${item.variantId || null}, ${item.quantity}, ${item.price}
        )
      `;
    }));

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder[0].id,
        userId: newOrder[0].user_id,
        status: newOrder[0].status,
        shippingAddress: newOrder[0].shipping_address,
        paymentMethod: newOrder[0].payment_method,
        createdAt: newOrder[0].created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create license order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create license order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, trackingNumber } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE license_orders
      SET 
        status = ${status},
        tracking_number = COALESCE(${trackingNumber}, tracking_number),
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updated[0].id,
        status: updated[0].status,
        trackingNumber: updated[0].tracking_number,
        updatedAt: updated[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Update license order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update license order" },
      { status: 500 }
    );
  }
}