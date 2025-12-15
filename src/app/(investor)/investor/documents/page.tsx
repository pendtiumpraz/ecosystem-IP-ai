"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, Eye, Search, Filter, Folder
} from "lucide-react";
import { Input } from "@/components/ui/input";

const DOCUMENTS = [
  { id: 1, name: "Investment Agreement - Project Alpha", type: "Contract", date: "2024-12-15", status: "signed" },
  { id: 2, name: "Q4 2024 Report - Project Beta", type: "Report", date: "2024-12-10", status: "new" },
  { id: 3, name: "ROI Summary - All Projects", type: "Summary", date: "2024-12-01", status: "viewed" },
  { id: 4, name: "Tax Document 2024", type: "Tax", date: "2024-11-30", status: "new" },
];

export default function InvestorDocumentsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-green-600" />
            Documents
          </h1>
          <p className="text-gray-500">Investment agreements and reports</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search documents..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Document Categories */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {["Contracts", "Reports", "Tax", "Other"].map((cat) => (
          <button key={cat} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-center transition-colors">
            <Folder className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-900">{cat}</p>
          </button>
        ))}
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DOCUMENTS.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.type} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "new" && (
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">New</span>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
