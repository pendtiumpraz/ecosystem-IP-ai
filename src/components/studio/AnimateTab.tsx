import { useState } from 'react';
import { Play, Pause, ChevronDown, ChevronRight, Sparkles, Film, Camera } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface SceneCard {
  id: string;
  name: string;
  description: string;
  duration: string;
  style: string;
  mood: string;
  keyActions: string;
  characterImages: string[];
  generatedPrompt: string;
  generatedImage: string;
  status: 'draft' | 'review' | 'approved';
}

export const AnimateTab: React.FC = () => {
  const [scenes, setScenes] = useState<SceneCard[]>([
    {
      id: '1',
      name: 'Scene 1: Opening',
      description: '',
      duration: '30s',
      style: '2D Animation',
      mood: 'Excited',
      keyActions: '',
      characterImages: ['', '', ''],
      generatedPrompt: '',
      generatedImage: '',
      status: 'draft',
    },
  ]);

  const [selectedStyle, setSelectedStyle] = useState('2D Animation');
  const [selectedMood, setSelectedMood] = useState('Excited');

  const animationStyles = [
    '2D Animation',
    '3D Animation',
    'Stop Motion',
    'Motion Graphics',
    'Traditional Animation',
    'Modern Animation',
  ];

  const moods = [
    'Excited',
    'Dramatic',
    'Calm',
    'Action',
    'Comedic',
    'Romantic',
    'Suspenseful',
  ];

  const handleSceneChange = (sceneId: string, field: keyof SceneCard, value: string) => {
    setScenes(scenes.map(scene => 
      scene.id === sceneId ? { ...scene, [field]: value } : scene
    ));
  };

  const handleCharacterImageChange = (sceneId: string, index: number, value: string) => {
    setScenes(scenes.map(scene => 
      scene.id === sceneId 
        ? { ...scene, characterImages: scene.characterImages.map((img, i) => i === index ? value : img) }
        : scene
    ));
  };

  const handleGeneratePrompt = (sceneId: string) => {
    console.log('Generating prompt for scene:', sceneId);
  };

  const handleGenerateImage = (sceneId: string) => {
    console.log('Generating image for scene:', sceneId);
  };

  const handlePlayAnimation = (sceneId: string) => {
    console.log('Playing animation for scene:', sceneId);
  };

  const handlePauseAnimation = (sceneId: string) => {
    console.log('Pausing animation for scene:', sceneId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Animate</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={70} />

      {/* Animation Style Selection */}
      <Card header="Animation Style">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Select Animation Style</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {animationStyles.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  selectedStyle === style
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Mood Selection */}
      <Card header="Mood Selection">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Select Mood</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  selectedMood === mood
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Scene Cards */}
      <Card header="Scene Cards">
        <div className="space-y-4">
          {scenes.map((scene) => (
            <div key={scene.id} className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-700">{scene.name}</h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      scene.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      scene.status === 'review' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {scene.status}
                    </span>
                  </div>
                </div>

                {/* Scene Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CompactInput
                      label="Scene Description"
                      labelColor="text-orange-500"
                      type="textarea"
                      value={scene.description}
                      onChange={(e) => handleSceneChange(scene.id, 'description', e.target.value)}
                      placeholder="Enter scene description"
                      helperColor="text-orange-500"
                    />
                    <CompactInput
                      label="Duration"
                      labelColor="text-orange-500"
                      type="text"
                      value={scene.duration}
                      onChange={(e) => handleSceneChange(scene.id, 'duration', e.target.value)}
                      placeholder="e.g., 30s"
                      helperColor="text-orange-500"
                    />
                    <CompactInput
                      label="Key Actions"
                      labelColor="text-orange-500"
                      type="textarea"
                      value={scene.keyActions}
                      onChange={(e) => handleSceneChange(scene.id, 'keyActions', e.target.value)}
                      placeholder="Enter key actions"
                      helperColor="text-orange-500"
                    />
                  </div>

                  {/* Character Images */}
                  <div>
                    <h6 className="text-xs font-medium text-gray-600 mb-2">Character Images</h6>
                    <div className="grid grid-cols-3 gap-2">
                      {scene.characterImages.map((image, index) => (
                        <div key={index} className="space-y-1">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => handleCharacterImageChange(scene.id, index, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                            placeholder={`Character ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    label="Generate Prompt" 
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => handleGeneratePrompt(scene.id)}
                  />
                  <Button 
                    variant="secondary" 
                    label="Generate Image" 
                    icon={<Camera className="w-4 h-4" />}
                    onClick={() => handleGenerateImage(scene.id)}
                  />
                </div>

                {/* Generated Image Display */}
                {scene.generatedImage && (
                  <div className="mt-3">
                    <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                      <img 
                        src={scene.generatedImage} 
                        alt="Generated scene image" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Animation Controls */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <Button 
                    variant="secondary" 
                    label="Play" 
                    icon={<Play className="w-4 h-4" />}
                    onClick={() => handlePlayAnimation(scene.id)}
                  />
                  <Button 
                    variant="secondary" 
                    label="Pause" 
                    icon={<Pause className="w-4 h-4" />}
                    onClick={() => handlePauseAnimation(scene.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};