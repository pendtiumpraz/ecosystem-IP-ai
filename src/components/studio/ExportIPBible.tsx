'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

interface ExportIPBibleProps {
  projectId: string;
  userId: string;
  projectTitle: string;
}

export function ExportIPBible({ projectId, userId, projectTitle }: ExportIPBibleProps) {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleExportPDF = async () => {
    setExporting(true);
    setExportStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/projects/${projectId}/export-ip-bible?userId=${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export IP Bible');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectTitle.replace(/\s+/g, '_')}_IP_Bible.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      setExportStatus('success');
    } catch (error) {
      console.error('IP Bible export error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to export IP Bible');
      setExportStatus('error');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = () => {
    switch (exportStatus) {
      case 'success':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Exported Successfully
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Export Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Export IP Bible</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive PDF documentation
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            Export your complete IP documentation as a professional PDF document including:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-purple-700">
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Project Overview with genre, format, tone, and theme</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Story Formula with premise, synopsis, and structure</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Character Profiles with psychological details</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Universe & World-Building details</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Universe Formula with 13 key elements</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Strategic Plan with Business Model Canvas</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Visual Development (Moodboard & Animations)</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Project Team with roles and responsibilities</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Pre-existing Materials with references</span>
            </li>
          </ul>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export IP Bible (PDF)
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {exportStatus === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Export Failed</p>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {exportStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Export Successful!</p>
                <p className="text-sm text-green-600 mt-1">
                  Your IP Bible has been downloaded as a PDF file.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-2">Tips for Best Results:</p>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Ensure all sections are filled out before exporting</li>
            <li>• Add character images for better visual documentation</li>
            <li>• Include moodboard images for visual references</li>
            <li>• Complete the Strategic Plan for business documentation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
