import { useState } from 'react';
import { Wand2, Camera, ChevronDown, ChevronRight, Sparkles, FileText } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface Beat {
  id: string;
  name: string;
  description: string;
  keyActions: string;
  generatedScript: string;
}

interface StoryStructure {
  id: string;
  name: string;
  beats: Beat[];
}

export const StoryFormulaTab: React.FC = () => {
  const [storyTitle, setStoryTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [globalSynopsis, setGlobalSynopsis] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('hero-journey');
  const [generatedScript, setGeneratedScript] = useState('');

  const [storyStructure, setStoryStructure] = useState<StoryStructure[]>([
    {
      id: '1',
      name: 'Act 1: Setup',
      beats: [
        { id: '1-1', name: 'Beat 1: Introduction', description: '', keyActions: '', generatedScript: '' },
        { id: '1-2', name: 'Beat 2: Inciting Incident', description: '', keyActions: '', generatedScript: '' },
        { id: '1-3', name: 'Beat 3: Rising Action', description: '', keyActions: '', generatedScript: '' },
      ],
    },
  ]);

  const structures = [
    { id: 'hero-journey', name: "Hero's Journey" },
    { id: 'save-cat', name: 'Save the Cat' },
    { id: 'dan-harmon', name: 'Dan Harmon Circle' },
  ];

  const handleBeatChange = (beatId: string, field: keyof Beat, value: string) => {
    setStoryStructure(storyStructure.map(structure => ({
      ...structure,
      beats: structure.beats.map(beat =>
        beat.id === beatId ? { ...beat, [field]: value } : beat
      ),
    })));
  };

  const handleGenerateStructure = () => {
    // Generate structure based on selected type
    console.log('Generating structure for:', selectedStructure);
  };

  const handleGenerateScript = () => {
    setGeneratedScript('Generated script content will appear here...');
  };

  const handleSaveStoryBible = () => {
    console.log('Saving story bible...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Story Formula</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={60} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thumbnail */}
        <div className="lg:col-span-1">
          <Card header="Thumbnail">
            <div className="space-y-4">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center border-2 border-dashed border-orange-300">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                    <p className="text-sm text-orange-600">Mood visual placeholder</p>
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition-colors">
                  Generate Mood Visual
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Story Info */}
        <div className="lg:col-span-2">
          <Card header="Story Information">
            <div className="space-y-4">
              <CompactInput
                label="Title"
                labelColor="text-orange-500"
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Enter story title"
              />
              <CompactInput
                label="Premise"
                labelColor="text-orange-500"
                type="textarea"
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="Enter story premise"
                rows={3}
              />
              <div className="flex gap-3">
                <CompactInput
                  label="Synopsis"
                  labelColor="text-orange-500"
                  type="textarea"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Enter synopsis"
                  rows={3}
                />
                <Button variant="secondary" label="Generate" icon={<Sparkles className="w-4 h-4" />} />
              </div>
              <CompactInput
                label="Global Synopsis"
                labelColor="text-orange-500"
                type="textarea"
                value={globalSynopsis}
                onChange={(e) => setGlobalSynopsis(e.target.value)}
                placeholder="Enter global synopsis"
                rows={3}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Metadata Grid */}
      <Card header="Metadata">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <CompactInput
            label="Duration"
            labelColor="text-orange-500"
            type="text"
            value=""
            onChange={() => { }}
            placeholder="e.g., 90 min"
          />
          <CompactInput
            label="Format"
            labelColor="text-orange-500"
            type="select"
            value=""
            onChange={() => { }}
            placeholder="Select format"
          >
            <option value="feature">Feature Film</option>
            <option value="short">Short Film</option>
            <option value="series">TV Series</option>
            <option value="web">Web Series</option>
          </CompactInput>
          <CompactInput
            label="Genre"
            labelColor="text-orange-500"
            type="select"
            value=""
            onChange={() => { }}
            placeholder="Select genre"
          >
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="horror">Horror</option>
          </CompactInput>
          <CompactInput
            label="Sub Genre"
            labelColor="text-orange-500"
            type="text"
            value=""
            onChange={() => { }}
            placeholder="e.g., Superhero, Romantic Comedy"
          />
          <CompactInput
            label="Tone"
            labelColor="text-orange-500"
            type="select"
            value=""
            onChange={() => { }}
            placeholder="Select tone"
          >
            <option value="serious">Serious</option>
            <option value="humorous">Humorous</option>
            <option value="suspenseful">Suspenseful</option>
            <option value="emotional">Emotional</option>
          </CompactInput>
          <CompactInput
            label="Theme"
            labelColor="text-orange-500"
            type="text"
            value=""
            onChange={() => { }}
            placeholder="e.g., Love, Redemption, Justice"
          />
        </div>
      </Card>

      {/* Want/Need Matrix */}
      <Card header="Want/Need Matrix">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Want: External, Known, Specific, Achieved</h4>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                rows={3}
                placeholder="Enter want details..."
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Need: Internal, Unknown, Universal, Achieved</h4>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                rows={3}
                placeholder="Enter need details..."
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ending Type</h4>
            <div className="flex gap-2">
              {['Happy', 'Tragic', 'Open'].map((ending) => (
                <button
                  key={ending}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-orange-400 transition-colors"
                >
                  {ending}
                </button>
              ))}
            </div>
          </div>
          <Button variant="secondary" label="Generate from Protagonist" icon={<Sparkles className="w-4 h-4" />} />
        </div>
      </Card>

      {/* Story Structure */}
      <Card header="Story Structure">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">Structure Select</label>
            <select
              value={selectedStructure}
              onChange={(e) => setSelectedStructure(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            >
              {structures.map(structure => (
                <option key={structure.id} value={structure.id}>{structure.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {storyStructure.map((structure) => (
              <div key={structure.id} className="border border-gray-200 rounded-lg">
                <div className="p-3 bg-orange-50 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">{structure.name}</h4>
                </div>
                <div className="p-4 space-y-3">
                  {structure.beats.map((beat) => (
                    <div key={beat.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700">{beat.name}</h5>
                      </div>
                      <CompactInput
                        label="Beat Description"
                        labelColor="text-orange-500"
                        type="textarea"
                        value={beat.description}
                        onChange={(e) => handleBeatChange(beat.id, 'description', e.target.value)}
                        placeholder="Enter beat description"
                        rows={2}
                      />
                      <CompactInput
                        label="Key Actions"
                        labelColor="text-orange-500"
                        type="textarea"
                        value={beat.keyActions}
                        onChange={(e) => handleBeatChange(beat.id, 'keyActions', e.target.value)}
                        placeholder="Enter key actions"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" label="Generate Structure" icon={<Sparkles className="w-4 h-4" />} onClick={handleGenerateStructure} />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" label="Auto-Fill with AI" icon={<Sparkles className="w-4 h-4" />} />
        <Button variant="secondary" label="Generate Script" icon={<FileText className="w-4 h-4" />} onClick={handleGenerateScript} />
        <Button variant="primary" label="Save Story Bible" onClick={handleSaveStoryBible} />
      </div>

      {/* Generated Script Display */}
      {generatedScript && (
        <Card header="Generated Script">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generatedScript}</pre>
          </div>
        </Card>
      )}
    </div>
  );
};