import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Fix credit system: ensure column exists + sync balance
export async function POST(request: Request) {
  const results: string[] = [];
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // 1. Ensure credit_balance column exists
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 100`;
      results.push("Column credit_balance ensured");
    } catch (e: any) {
      results.push("Column check: " + e.message);
    }

    // 2. If userId provided, sync that user's balance
    if (userId) {
      // Get last transaction balance
      const lastTx = await sql`
        SELECT balance_after FROM credit_transactions 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      // Get current user balance
      const userBefore = await sql`
        SELECT credit_balance FROM users WHERE id = ${userId}
      `;

      const txBalance = lastTx[0]?.balance_after;
      const currentBalance = userBefore[0]?.credit_balance;

      results.push(`User ${userId}: DB balance=${currentBalance}, TX balance=${txBalance}`);

      if (txBalance !== undefined && txBalance !== null) {
        // Force update to transaction balance
        await sql`
          UPDATE users SET credit_balance = ${txBalance}, updated_at = NOW()
          WHERE id = ${userId}
        `;
        results.push(`Updated user balance to ${txBalance}`);
        
        // Verify update
        const userAfter = await sql`
          SELECT credit_balance FROM users WHERE id = ${userId}
        `;
        results.push(`Verified: balance now ${userAfter[0]?.credit_balance}`);
      }
    } else {
      // 3. Sync ALL users with transactions
      const usersWithTx = await sql`
        SELECT DISTINCT user_id FROM credit_transactions
      `;
      
      for (const row of usersWithTx) {
        const lastTx = await sql`
          SELECT balance_after FROM credit_transactions 
          WHERE user_id = ${row.user_id} 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        
        if (lastTx[0]?.balance_after !== undefined) {
          await sql`
            UPDATE users SET credit_balance = ${lastTx[0].balance_after}, updated_at = NOW()
            WHERE id = ${row.user_id}
          `;
          results.push(`Synced user ${row.user_id} to ${lastTx[0].balance_after}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Credits fixed",
      results 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      results 
    }, { status: 500 });
  }
}

// GET - Check balance discrepancy
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      // Return all users with mismatched balances
      const mismatches = await sql`
        SELECT u.id, u.email, u.credit_balance as db_balance,
          (SELECT balance_after FROM credit_transactions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as tx_balance
        FROM users u
        WHERE u.deleted_at IS NULL
      `;
      
      const issues = mismatches.filter(m => m.db_balance !== m.tx_balance && m.tx_balance !== null);
      
      return NextResponse.json({
        totalUsers: mismatches.length,
        usersWithMismatch: issues.length,
        mismatches: issues
      });
    }

    const lastTx = await sql`
      SELECT balance_after, created_at, description FROM credit_transactions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const userBalance = await sql`
      SELECT credit_balance, deleted_at FROM users WHERE id = ${userId}
    `;

    return NextResponse.json({
      userId,
      userTableBalance: userBalance[0]?.credit_balance,
      lastTransactionBalance: lastTx[0]?.balance_after,
      lastTransactionDate: lastTx[0]?.created_at,
      lastTransactionDesc: lastTx[0]?.description,
      isDeleted: userBalance[0]?.deleted_at !== null,
      isSynced: userBalance[0]?.credit_balance === lastTx[0]?.balance_after
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
