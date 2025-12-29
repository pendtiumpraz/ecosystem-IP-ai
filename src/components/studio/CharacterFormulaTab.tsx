import { useState } from 'react';
import { User, Camera, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface Character {
  id: string;
  name: string;
  type: string;
  age: string;
  castReference: string;
  image: string;
  poses: {
    portrait: string;
    action: string;
    emotional: string;
    fullBody: string;
  };
}

interface CharacterAspect {
  id: string;
  name: string;
  content: string;
  isOpen: boolean;
}

export const CharacterFormulaTab: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: '1',
      name: 'Alex Chen',
      type: 'Protagonist',
      age: '28',
      castReference: 'Main character',
      image: '',
      poses: {
        portrait: '',
        action: '',
        emotional: '',
        fullBody: '',
      },
    },
  ]);

  const [characterAspects, setCharacterAspects] = useState<CharacterAspect[]>([
    { id: '1', name: 'Physiological', content: '', isOpen: false },
    { id: '2', name: 'Psychological', content: '', isOpen: false },
    { id: '3', name: 'Emotional', content: '', isOpen: false },
    { id: '4', name: 'Family', content: '', isOpen: false },
    { id: '5', name: 'Sociocultural', content: '', isOpen: false },
    { id: '6', name: 'Core Beliefs', content: '', isOpen: false },
    { id: '7', name: 'Educational', content: '', isOpen: false },
    { id: '8', name: 'Sociopolitics', content: '', isOpen: false },
    { id: '9', name: 'SWOT', content: '', isOpen: false },
  ]);

  const handleAddCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: 'New Character',
      type: 'Supporting',
      age: '',
      castReference: '',
      image: '',
      poses: {
        portrait: '',
        action: '',
        emotional: '',
        fullBody: '',
      },
    };
    setCharacters([...characters, newCharacter]);
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const handleCharacterChange = (id: string, field: keyof Character, value: string) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  const handlePoseImageChange = (characterId: string, poseType: keyof Character['poses'], value: string) => {
    setCharacters(characters.map(char => 
      char.id === characterId ? { 
        ...char, 
        poses: { ...char.poses, [poseType]: value } 
      } : char
    ));
  };

  const toggleAspect = (id: string) => {
    setCharacterAspects(characterAspects.map(aspect => 
      aspect.id === id ? { ...aspect, isOpen: !aspect.isOpen } : aspect
    ));
  };

  const handleAspectContentChange = (id: string, content: string) => {
    setCharacterAspects(characterAspects.map(aspect => 
      aspect.id === id ? { ...aspect, content } : aspect
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Character Formula</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={30} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character List */}
        <div className="lg:col-span-1">
          <Card header="Character List">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Characters</h4>
                <Button 
                  variant="secondary" 
                  label="New Char" 
                  icon={<User className="w-4 h-4" />}
                  onClick={handleAddCharacter}
                />
              </div>
              {characters.map((character) => (
                <div 
                  key={character.id} 
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{character.name}</p>
                        <p className="text-xs text-gray-500">{character.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCharacter(character.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Character Detail */}
        <div className="lg:col-span-2">
          {characters.length > 0 && (
            <Card header="Character Detail">
              <div className="space-y-4">
                {/* Character Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CompactInput
                    label="Name"
                    labelColor="text-orange-500"
                    type="text"
                    value={characters[0].name}
                    onChange={(e) => handleCharacterChange(characters[0].id, 'name', e.target.value)}
                    placeholder="Enter character name"
                  />
                  <CompactInput
                    label="Type"
                    labelColor="text-orange-500"
                    type="select"
                    value={characters[0].type}
                    onChange={(e) => handleCharacterChange(characters[0].id, 'type', e.target.value)}
                    placeholder="Select character type"
                  >
                    <option value="Protagonist">Protagonist</option>
                    <option value="Antagonist">Antagonist</option>
                    <option value="Supporting">Supporting</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Comic Relief">Comic Relief</option>
                  </CompactInput>
                  <CompactInput
                    label="Age"
                    labelColor="text-orange-500"
                    type="number"
                    value={characters[0].age}
                    onChange={(e) => handleCharacterChange(characters[0].id, 'age', e.target.value)}
                    placeholder="Enter age"
                  />
                  <CompactInput
                    label="Cast Reference"
                    labelColor="text-orange-500"
                    type="text"
                    value={characters[0].castReference}
                    onChange={(e) => handleCharacterChange(characters[0].id, 'castReference', e.target.value)}
                    placeholder="Enter cast reference"
                  />
                </div>

                {/* 4 Pose Image Generation */}
                <div>
                  <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">4 Pose Image Generation</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Portrait</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={characters[0].poses.portrait}
                          onChange={(e) => handlePoseImageChange(characters[0].id, 'portrait', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          placeholder="Image URL or description"
                        />
                        <Camera className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Action</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={characters[0].poses.action}
                          onChange={(e) => handlePoseImageChange(characters[0].id, 'action', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          placeholder="Image URL or description"
                        />
                        <Camera className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Emotional</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={characters[0].poses.emotional}
                          onChange={(e) => handlePoseImageChange(characters[0].id, 'emotional', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          placeholder="Image URL or description"
                        />
                        <Camera className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Full Body</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={characters[0].poses.fullBody}
                          onChange={(e) => handlePoseImageChange(characters[0].id, 'fullBody', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          placeholder="Image URL or description"
                        />
                        <Camera className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Sections */}
                <div className="space-y-3">
                  {characterAspects.map((aspect) => (
                    <CollapsibleSection
                      key={aspect.id}
                      title={aspect.name}
                      icon={<User className="w-4 h-4" />}
                      isOpen={aspect.isOpen}
                      onToggle={() => toggleAspect(aspect.id)}
                      color="bg-orange-500"
                    >
                      <textarea
                        value={aspect.content}
                        onChange={(e) => handleAspectContentChange(aspect.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                        rows={4}
                        placeholder={`Enter ${aspect.name.toLowerCase()} details...`}
                      />
                    </CollapsibleSection>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};