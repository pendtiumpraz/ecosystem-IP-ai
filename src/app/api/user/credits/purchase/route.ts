import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, packageId, credits, amount } = body;

    if (!userId || !credits || !amount) {
      return NextResponse.json(
        { success: false, error: "userId, credits, and amount required" },
        { status: 400 }
      );
    }

    // Create pending payment record
    const payment = await sql`
      INSERT INTO payments (user_id, amount, status, payment_method, description)
      VALUES (${userId}, ${amount}, 'pending', 'transfer', ${'Credit purchase: ' + credits + ' credits'})
      RETURNING *
    `;

    // Note: Credits will be added after payment is verified by admin
    // For now just create the payment record

    return NextResponse.json({
      success: true,
      payment: {
        id: payment[0].id,
        amount: payment[0].amount,
        status: payment[0].status,
        credits,
        message: "Payment created. Please transfer and wait for admin verification.",
      },
    });
  } catch (error) {
    console.error("Create purchase error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
