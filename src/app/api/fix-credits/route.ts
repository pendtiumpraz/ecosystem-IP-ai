import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Sync credit balance from transaction history
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Get last transaction balance
    const lastTx = await sql`
      SELECT balance_after FROM credit_transactions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    // Get current user balance
    const userBalance = await sql`
      SELECT credit_balance FROM users WHERE id = ${userId}
    `;

    const txBalance = lastTx[0]?.balance_after;
    const currentBalance = userBalance[0]?.credit_balance;

    if (txBalance === undefined || txBalance === null) {
      return NextResponse.json({ 
        message: "No transactions found",
        currentBalance 
      });
    }

    // If mismatch, update user balance
    if (txBalance !== currentBalance) {
      await sql`
        UPDATE users SET credit_balance = ${txBalance}, updated_at = NOW()
        WHERE id = ${userId}
      `;
      
      return NextResponse.json({
        success: true,
        message: "Balance synced",
        oldBalance: currentBalance,
        newBalance: txBalance
      });
    }

    return NextResponse.json({
      success: true,
      message: "Balance already correct",
      balance: currentBalance
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Check balance discrepancy
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const lastTx = await sql`
      SELECT balance_after, created_at, description FROM credit_transactions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const userBalance = await sql`
      SELECT credit_balance FROM users WHERE id = ${userId}
    `;

    return NextResponse.json({
      userTableBalance: userBalance[0]?.credit_balance,
      lastTransactionBalance: lastTx[0]?.balance_after,
      lastTransactionDate: lastTx[0]?.created_at,
      lastTransactionDesc: lastTx[0]?.description,
      isSynced: userBalance[0]?.credit_balance === lastTx[0]?.balance_after
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
