import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List payments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let payments;
    if (status && status !== "all") {
      payments = await sql`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      payments = await sql`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM payments p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM payments`;
    const pendingCount = await sql`SELECT COUNT(*) as count FROM payments WHERE status = 'pending'`;

    return NextResponse.json({
      success: true,
      payments: payments.map(p => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        userEmail: p.user_email,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.payment_method,
        paymentProof: p.payment_proof,
        notes: p.notes,
        verifiedAt: p.verified_at,
        createdAt: p.created_at,
      })),
      total: Number(countResult[0]?.count || 0),
      pendingCount: Number(pendingCount[0]?.count || 0),
    });
  } catch (error) {
    console.error("List payments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// PUT - Verify/Reject payment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, verifiedBy, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Payment ID and status required" },
        { status: 400 }
      );
    }

    if (!["verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE payments 
      SET 
        status = ${status},
        verified_by = ${verifiedBy},
        verified_at = NOW(),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // If verified, update user subscription
    if (status === "verified") {
      const payment = updated[0];
      // Update user credit balance or subscription based on payment
      await sql`
        UPDATE users 
        SET credit_balance = credit_balance + 500,
            subscription_tier = 'creator'
        WHERE id = ${payment.user_id}
      `;
    }

    return NextResponse.json({
      success: true,
      payment: updated[0],
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
