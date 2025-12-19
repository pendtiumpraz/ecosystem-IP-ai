import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");

    const offset = (page - 1) * limit;

    let query = sql`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM license_product_variants WHERE product_id = p.id AND is_active = TRUE) as variants_count,
        (SELECT COUNT(*) FROM license_orders WHERE product_id = p.id AND status = 'completed') as sales_count
      FROM license_products p
      WHERE p.deleted_at IS NULL
    `;

    // Apply filters
    if (search) {
      query = sql`${query} AND (p.name ILIKE ${'%' + search + '%'} OR p.description ILIKE ${'%' + search + '%'})`;
    }

    if (category) {
      query = sql`${query} AND p.category = ${category}`;
    }

    if (minPrice > 0) {
      query = sql`${query} AND p.price >= ${minPrice}`;
    }

    if (maxPrice < 1000000) {
      query = sql`${query} AND p.price <= ${maxPrice}`;
    }

    query = sql`${query}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalQuery = sql`
      SELECT COUNT(*) as count FROM license_products WHERE deleted_at IS NULL
    `;

    const [products, totalResult] = await Promise.all([query, totalQuery]);
    const total = Number(totalResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.image_url,
        variantsCount: Number(p.variants_count || 0),
        salesCount: Number(p.sales_count || 0),
        isAvailable: p.is_active ?? true,
        createdAt: p.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List license products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch license products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageUrl, variants } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category required" },
        { status: 400 }
      );
    }

    const product = await sql`
      INSERT INTO license_products (
        name, description, price, category, image_url, is_active
      )
      VALUES (
        ${name}, ${description || null}, ${price}, ${category}, ${imageUrl || null}, true
      )
      RETURNING *
    `;

    // Create variants if provided
    if (variants && variants.length > 0) {
      await Promise.all(variants.map(async (variant: any) => {
        await sql`
          INSERT INTO license_product_variants (
            product_id, name, price, stock, sku, is_active
          )
          VALUES (
            ${product[0].id}, ${variant.name}, ${variant.price}, ${variant.stock || 0}, 
            ${variant.sku || null}, ${variant.isActive ?? true}
          )
        `;
      }));
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product[0].id,
        name: product[0].name,
        description: product[0].description,
        price: product[0].price,
        category: product[0].category,
        imageUrl: product[0].image_url,
        isAvailable: product[0].is_active,
        createdAt: product[0].created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create license product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create license product" },
      { status: 500 }
    );
  }
}