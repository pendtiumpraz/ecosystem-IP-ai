import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get investor documents
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

    const documents = [];

    // 1. Investment agreements (from investments)
    const investments = await sql`
      SELECT 
        i.id, i.invested_amount, i.tier_name, i.created_at,
        c.title as campaign_title
      FROM investments i
      JOIN investment_campaigns c ON i.campaign_id = c.id
      WHERE i.user_id = ${userId} AND i.status = 'confirmed'
      ORDER BY i.created_at DESC
    `;

    investments.forEach(inv => {
      documents.push({
        id: `agreement-${inv.id}`,
        name: `Investment Agreement - ${inv.campaign_title}`,
        type: "Contract",
        date: inv.created_at,
        status: "signed",
        downloadUrl: `/api/investor/documents/${inv.id}/agreement`,
      });
    });

    // 2. Add quarterly summaries (generated)
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    for (let q = 1; q < currentQuarter; q++) {
      documents.push({
        id: `report-${currentYear}-Q${q}`,
        name: `Q${q} ${currentYear} Investment Report`,
        type: "Report",
        date: new Date(currentYear, q * 3 - 1, 1).toISOString(),
        status: "available",
        downloadUrl: `/api/investor/documents/report/${currentYear}/Q${q}`,
      });
    }

    // 3. Tax document for previous year if user has investments
    if (investments.length > 0) {
      documents.push({
        id: `tax-${currentYear - 1}`,
        name: `Tax Summary ${currentYear - 1}`,
        type: "Tax",
        date: new Date(currentYear, 0, 31).toISOString(),
        status: "available",
        downloadUrl: `/api/investor/documents/tax/${currentYear - 1}`,
      });
    }

    return NextResponse.json({
      success: true,
      documents,
      categories: {
        contracts: documents.filter(d => d.type === "Contract").length,
        reports: documents.filter(d => d.type === "Report").length,
        tax: documents.filter(d => d.type === "Tax").length,
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
