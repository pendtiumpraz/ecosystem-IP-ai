import { useState } from 'react';
import { LayoutTemplate, Camera, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface BeatStep {
  id: string;
  name: string;
  description: string;
  keyActions: string;
  characterImages: string[];
  generatedPrompt: string;
  generatedImage: string;
}

interface StoryStructure {
  id: string;
  name: string;
  beats: BeatStep[];
}

export const MoodboardTab: React.FC = () => {
  const [selectedStructure, setSelectedStructure] = useState('hero-journey');
  const [storyStructure, setStoryStructure] = useState<StoryStructure[]>([
    {
      id: '1',
      name: 'Act 1: Setup',
      beats: [
        {
          id: '1-1',
          name: 'Beat 1: Introduction',
          description: '',
          keyActions: '',
          characterImages: ['', '', '', ''],
          generatedPrompt: '',
          generatedImage: '',
        },
      ],
    },
  ]);

  const structures = [
    { id: 'hero-journey', name: "Hero's Journey" },
    { id: 'save-cat', name: 'Save the Cat' },
    { id: 'dan-harmon', name: 'Dan Harmon Circle' },
  ];

  const handleBeatChange = (beatId: string, field: keyof BeatStep, value: string) => {
    setStoryStructure(prevStructure => 
      prevStructure.map(structure => ({
        ...structure,
        beats: structure.beats.map(beat => 
          beat.id === beatId ? { ...beat, [field]: value } : beat
        ),
      }))
    );
  };

  const handleCharacterImageChange = (beatId: string, index: number, value: string) => {
    setStoryStructure(prevStructure => 
      prevStructure.map(structure => ({
        ...structure,
        beats: structure.beats.map(beat => 
          beat.id === beatId 
            ? { ...beat, characterImages: beat.characterImages.map((img, i) => i === index ? value : img) }
            : beat
        ),
      }))
    );
  };

  const handleGeneratePrompt = (beatId: string) => {
    console.log('Generating prompt for beat:', beatId);
  };

  const handleGenerateImage = (beatId: string) => {
    console.log('Generating image for beat:', beatId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Moodboard</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={55} />

      {/* Structure Select */}
      <Card header="Structure Select">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Select Story Structure</label>
          <div className="flex gap-2">
            {structures.map((structure) => (
              <button
                key={structure.id}
                onClick={() => setSelectedStructure(structure.id)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedStructure === structure.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                {structure.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Story Structure Steps */}
      <Card header="Story Structure Steps">
        <div className="space-y-6">
          {storyStructure.map((structure) => (
            <div key={structure.id} className="space-y-4">
              <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider">{structure.name}</h4>
              
              {structure.beats.map((beat) => (
                <div key={beat.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">{beat.name}</h5>
                      <CompactInput
                        label="Beat Description"
                        labelColor="text-orange-500"
                        type="textarea"
                        value={beat.description}
                        onChange={(e) => handleBeatChange(beat.id, 'description', e.target.value)}
                        placeholder="Enter beat description"
                        helperColor="text-orange-500"
                      />
                      <CompactInput
                        label="Key Actions"
                        labelColor="text-orange-500"
                        type="textarea"
                        value={beat.keyActions}
                        onChange={(e) => handleBeatChange(beat.id, 'keyActions', e.target.value)}
                        placeholder="Enter key actions"
                        helperColor="text-orange-500"
                      />
                    </div>

                    {/* Character Images */}
                    <div>
                      <h6 className="text-xs font-medium text-gray-600 mb-2">Character Images for Key Actions</h6>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {beat.characterImages.map((image, index) => (
                          <div key={index} className="space-y-1">
                            <input
                              type="text"
                              value={image}
                              onChange={(e) => handleCharacterImageChange(beat.id, index, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                              placeholder={`Character ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Generate Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        label="Generate Prompt" 
                        icon={<Sparkles className="w-4 h-4" />}
                        onClick={() => handleGeneratePrompt(beat.id)}
                      />
                      <Button 
                        variant="secondary" 
                        label="Generate Image" 
                        icon={<Camera className="w-4 h-4" />}
                        onClick={() => handleGenerateImage(beat.id)}
                      />
                    </div>

                    {/* Generated Image Display */}
                    {beat.generatedImage && (
                      <div className="mt-3">
                        <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                          <img 
                            src={beat.generatedImage} 
                            alt="Generated mood image" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};