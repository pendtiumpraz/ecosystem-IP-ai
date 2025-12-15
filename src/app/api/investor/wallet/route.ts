import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get wallet balance and transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      );
    }

    // Get investor balance
    const user = await sql`
      SELECT investor_balance FROM users WHERE id = ${userId}
    `;

    const balance = user.length > 0 ? Number(user[0].investor_balance || 0) : 0;

    // Get recent transactions
    const transactions = await sql`
      SELECT 
        id, type, amount, description, status, created_at
      FROM investor_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Calculate stats
    const statsResult = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'topup' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_topup,
        COALESCE(SUM(CASE WHEN type = 'withdraw' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_withdraw,
        COALESCE(SUM(CASE WHEN type = 'invest' THEN ABS(amount) ELSE 0 END), 0) as total_invested,
        COALESCE(SUM(CASE WHEN type = 'return' THEN amount ELSE 0 END), 0) as total_returns
      FROM investor_transactions
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      balance,
      stats: {
        totalTopup: Number(statsResult[0]?.total_topup || 0),
        totalWithdraw: Number(statsResult[0]?.total_withdraw || 0),
        totalInvested: Number(statsResult[0]?.total_invested || 0),
        totalReturns: Number(statsResult[0]?.total_returns || 0),
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

// POST - Top up or withdraw
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, amount, bankAccount, bankName } = body;

    if (!userId || !type || !amount) {
      return NextResponse.json(
        { success: false, error: "userId, type, and amount required" },
        { status: 400 }
      );
    }

    if (!["topup", "withdraw"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    // For withdraw, check balance
    if (type === "withdraw") {
      const user = await sql`
        SELECT investor_balance FROM users WHERE id = ${userId}
      `;
      
      if (user.length === 0 || Number(user[0].investor_balance || 0) < amount) {
        return NextResponse.json(
          { success: false, error: "Insufficient balance" },
          { status: 400 }
        );
      }
    }

    // Create transaction (pending status)
    const transaction = await sql`
      INSERT INTO investor_transactions (user_id, type, amount, description, status)
      VALUES (
        ${userId}, 
        ${type}, 
        ${type === "withdraw" ? -amount : amount},
        ${type === "topup" ? "Top up request" : `Withdraw to ${bankName} - ${bankAccount}`},
        'pending'
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      transaction: transaction[0],
      message: type === "topup" 
        ? "Please transfer to complete top up"
        : "Withdraw request submitted for review",
    });
  } catch (error) {
    console.error("Wallet transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
