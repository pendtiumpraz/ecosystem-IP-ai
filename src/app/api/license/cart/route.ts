import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItems = await sql`
      SELECT 
        ci.*,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image_url as product_image,
        v.name as variant_name,
        v.price as variant_price,
        v.sku as variant_sku
      FROM license_cart_items ci
      JOIN license_products p ON ci.product_id = p.id
      LEFT JOIN license_product_variants v ON ci.variant_id = v.id
      WHERE ci.user_id = ${userId} AND ci.deleted_at IS NULL
    `;

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.variant_price || item.product_price), 0);
    const tax = subtotal * 0.11; // 11% PPN
    const total = subtotal + tax;

    return NextResponse.json({
      success: true,
      cart: {
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productDescription: item.product_description,
          productImage: item.product_image,
          variantId: item.variant_id,
          variantName: item.variant_name,
          variantPrice: item.variant_price,
          variantSku: item.variant_sku,
          quantity: item.quantity,
          createdAt: item.created_at,
        })),
        subtotal,
        tax,
        total,
        itemCount: cartItems.length,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, variantId, quantity } = body;

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, error: "User ID, product ID, and quantity required" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await sql`
      SELECT id FROM license_cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId} AND variant_id = ${variantId || null} AND deleted_at IS NULL
    `;

    let result;
    if (existingItem.length > 0) {
      // Update existing item
      result = await sql`
        UPDATE license_cart_items
        SET quantity = quantity + ${quantity}, updated_at = NOW()
        WHERE id = ${existingItem[0].id}
        RETURNING *
      `;
    } else {
      // Create new item
      result = await sql`
        INSERT INTO license_cart_items (
          user_id, product_id, variant_id, quantity
        )
        VALUES (
          ${userId}, ${productId}, ${variantId || null}, ${quantity}
        )
        RETURNING *
      `;
    }

    return NextResponse.json({
      success: true,
      cartItem: {
        id: result[0].id,
        userId: result[0].user_id,
        productId: result[0].product_id,
        variantId: result[0].variant_id,
        quantity: result[0].quantity,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, quantity } = body;

    if (!id || !quantity) {
      return NextResponse.json(
        { success: false, error: "Item ID and quantity required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE license_cart_items
      SET quantity = ${quantity}, updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cartItem: {
        id: updated[0].id,
        quantity: updated[0].quantity,
        updatedAt: updated[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID required" },
        { status: 400 }
      );
    }

    // Soft delete cart item
    await sql`
      UPDATE license_cart_items 
      SET deleted_at = NOW(), updated_at = NOW() 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    return NextResponse.json({
      success: true,
      message: "Cart item removed",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}