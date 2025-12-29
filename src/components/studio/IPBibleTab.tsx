import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, Download, FileText, Book, Globe, Users, Calendar, Share2, CheckCircle, Clock } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface IPBibleSection {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'approved';
  lastModified: string;
}

interface ExportOption {
  id: string;
  name: string;
  format: string;
  description: string;
  size: string;
}

export const IPBibleTab: React.FC = () => {
  const [sections, setSections] = useState<IPBibleSection[]>([
    {
      id: '1',
      title: 'Introduction',
      content: '',
      status: 'draft',
      lastModified: new Date().toLocaleDateString(),
    },
    {
      id: '2',
      title: 'Characters',
      content: '',
      status: 'review',
      lastModified: new Date().toLocaleDateString(),
    },
    {
      id: '3',
      title: 'World Building',
      content: '',
      status: 'approved',
      lastModified: new Date().toLocaleDateString(),
    },
    {
      id: '4',
      title: 'Story Structure',
      content: '',
      status: 'draft',
      lastModified: new Date().toLocaleDateString(),
    },
    {
      id: '5',
      title: 'Themes',
      content: '',
      status: 'review',
      lastModified: new Date().toLocaleDateString(),
    },
  ]);

  const [selectedExportFormat, setSelectedExportFormat] = useState('pdf');
  const [generatedScript, setGeneratedScript] = useState('');

  const exportOptions: ExportOption[] = [
    { id: 'pdf', name: 'PDF Document', format: 'PDF', description: 'Professional document format', size: '2.5 MB' },
    { id: 'docx', name: 'Word Document', format: 'DOCX', description: 'Editable document format', size: '1.8 MB' },
    { id: 'epub', name: 'eBook', format: 'EPUB', description: 'Digital book format', size: '1.2 MB' },
    { id: 'html', name: 'Web Page', format: 'HTML', description: 'Web browser format', size: '3.0 MB' },
    { id: 'json', name: 'JSON Data', format: 'JSON', description: 'Structured data format', size: '800 KB' },
  ];

  const handleSectionChange = (sectionId: string, field: keyof IPBibleSection, value: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const handleContentChange = (sectionId: string, content: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));
  };

  const handleExport = (format: string) => {
    console.log('Exporting IP Bible as:', format);
    setSelectedExportFormat(format);
  };

  const handleGenerateScript = () => {
    console.log('Generating script from IP Bible');
    setGeneratedScript('Generated script content will appear here...');
  };

  const handleShare = () => {
    console.log('Sharing IP Bible');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">IP Bible</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={95} />

      {/* Export Options */}
      <Card header="Export Options">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Select Export Format</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  selectedExportFormat === option.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs opacity-80">{option.description}</div>
                  </div>
                  <div className="text-xs opacity-80">{option.size}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* IP Bible Sections */}
      <Card header="IP Bible Sections">
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h5 className="text-sm font-medium text-gray-700">{section.title}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      section.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      section.status === 'review' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {section.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{section.lastModified}</span>
                  </div>
                </div>

                {/* Section Content */}
                <textarea
                  value={section.content}
                  onChange={(e) => handleContentChange(section.id, e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none"
                  placeholder="Enter section content..."
                />

                {/* Status Actions */}
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs text-orange-600 hover:text-orange-700 transition-colors">
                    Mark as Draft
                  </button>
                  <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                    Mark as Review
                  </button>
                  <button className="px-3 py-1 text-xs text-green-600 hover:text-green-700 transition-colors">
                    Mark as Approved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Generated Script */}
      <Card header="Generated Script">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h6 className="text-sm font-medium text-gray-700">AI-Generated Script</h6>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                label="Generate" 
                icon={<Sparkles className="w-4 h-4" />}
                onClick={handleGenerateScript}
              />
              <Button 
                variant="secondary" 
                label="Share" 
                icon={<Share2 className="w-4 h-4" />}
                onClick={handleShare}
              />
            </div>
          </div>
          
          {generatedScript ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generatedScript}</pre>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Generated script will appear here</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="secondary" label="Export" icon={<Download className="w-4 h-4" />} />
        <Button variant="secondary" label="Share" icon={<Share2 className="w-4 h-4" />} />
        <Button variant="primary" label="Publish" />
      </div>
    </div>
  );
};