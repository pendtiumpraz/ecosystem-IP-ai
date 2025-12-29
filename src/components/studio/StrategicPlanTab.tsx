import { useState } from 'react';
import { BarChart3, Share2, TrendingUp, Users, Target, Brain } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface PerformanceFactor {
  id: string;
  name: string;
  value: number;
  max: number;
}

interface BusinessModelSection {
  id: string;
  name: string;
  value: string;
}

export const StrategicPlanTab: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [performanceFactors, setPerformanceFactors] = useState<PerformanceFactor[]>([
    { id: '1', name: 'Cast', value: 75, max: 100 },
    { id: '2', name: 'Director', value: 85, max: 100 },
    { id: '3', name: 'Producer', value: 90, max: 100 },
    { id: '4', name: 'Screenplay', value: 80, max: 100 },
    { id: '5', name: 'Cinematography', value: 85, max: 100 },
    { id: '6', name: 'Editing', value: 82, max: 100 },
    { id: '7', name: 'Sound Design', value: 78, max: 100 },
    { id: '8', name: 'Music', value: 88, max: 100 },
    { id: '9', name: 'Visual Effects', value: 70, max: 100 },
    { id: '10', name: 'Marketing', value: 92, max: 100 },
    { id: '11', name: 'Distribution', value: 85, max: 100 },
    { id: '12', name: 'Reception', value: 88, max: 100 },
    { id: '13', name: 'Awards', value: 75, max: 100 },
    { id: '14', name: 'Box Office', value: 90, max: 100 },
    { id: '15', name: 'Critical Acclaim', value: 85, max: 100 },
  ]);

  const [businessModelSections, setBusinessModelSections] = useState<BusinessModelSection[]>([
    { id: '1', name: 'Customer Segments', value: 'Target audience demographics' },
    { id: '2', name: 'Value Propositions', value: 'Unique selling points' },
    { id: '3', name: 'Channels', value: 'Distribution methods' },
    { id: '4', name: 'Customer Relationships', value: 'Engagement strategies' },
    { id: '5', name: 'Revenue Streams', value: 'Monetization models' },
    { id: '6', name: 'Key Resources', value: 'Essential assets' },
    { id: '7', name: 'Key Activities', value: 'Core operations' },
    { id: '8', name: 'Key Partnerships', value: 'Collaborations' },
    { id: '9', name: 'Cost Structure', value: 'Expense breakdown' },
  ]);

  const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Documentary'];

  const handlePerformanceFactorChange = (id: string, value: number) => {
    setPerformanceFactors(performanceFactors.map(factor => 
      factor.id === id ? { ...factor, value } : factor
    ));
  };

  const handleBusinessModelSectionChange = (id: string, value: string) => {
    setBusinessModelSections(businessModelSections.map(section => 
      section.id === id ? { ...section, value } : section
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Strategic Plan</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Brain className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={45} />

      {/* Performance Analysis */}
      <Card header="Performance Analysis (15 Factors)">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceFactors.map((factor) => (
              <div key={factor.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                  <span className="text-xs text-orange-600 font-bold">{factor.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(factor.value / factor.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Bar Chart Placeholder */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Project vs Competitor Comparison</span>
            </div>
            <div className="h-32 bg-white rounded border border-gray-200 flex items-end justify-center">
              <div className="text-center text-gray-400 text-sm">
                Bar chart visualization will appear here
              </div>
            </div>
          </div>

          {/* Predicted Audience Display */}
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Predicted Audience Display</span>
            </div>
            <p className="text-sm text-gray-600">
              Based on current performance factors, the predicted audience engagement is estimated at 78% with a potential reach of 2.5M viewers.
            </p>
          </div>
        </div>
      </Card>

      {/* IP Business Model Canvas */}
      <Card header="IP Business Model Canvas (9 Sections)">
        <div className="grid grid-cols-3 gap-4">
          {businessModelSections.map((section) => (
            <div key={section.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <label className="text-xs font-medium text-gray-500 block mb-1">{section.name}</label>
              <input
                type="text"
                value={section.value}
                onChange={(e) => handleBusinessModelSectionChange(section.id, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                placeholder="Enter value..."
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Genre Input and AI Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card header="Genre Input">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Select Genre</label>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedGenre === genre 
                      ? 'bg-orange-500 text-white border-orange-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card header="AI Suggestions">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">AI-Generated Recommendations</label>
            <textarea
              value={aiSuggestions}
              onChange={(e) => setAiSuggestions(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              rows={4}
              placeholder="AI suggestions will appear here..."
            />
            <Button variant="secondary" label="Generate Suggestions" icon={<Brain className="w-4 h-4" />} />
          </div>
        </Card>
      </div>
    </div>
  );
};