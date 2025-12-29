import { useState } from 'react';
import { Globe, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface UniverseNode {
  id: string;
  name: string;
  value: string;
  position: { x: number; y: number };
  color: string;
}

export const UniverseFormulaTab: React.FC = () => {
  const [universeName, setUniverseName] = useState('');
  const [period, setPeriod] = useState('');
  const [era, setEra] = useState('');
  const [location, setLocation] = useState('');
  const [worldType, setWorldType] = useState('');
  const [technologyLevel, setTechnologyLevel] = useState('');
  const [magicSystem, setMagicSystem] = useState('');
  const [environment, setEnvironment] = useState('');
  const [society, setSociety] = useState('');
  const [privateLife, setPrivateLife] = useState('');
  const [government, setGovernment] = useState('');
  const [economy, setEconomy] = useState('');
  const [culture, setCulture] = useState('');

  const universeNodes: UniverseNode[] = [
    { id: '1', name: 'Town', value: '', position: { x: 50, y: 20 }, color: 'bg-orange-500' },
    { id: '2', name: 'Neighborhood', value: '', position: { x: 70, y: 30 }, color: 'bg-orange-400' },
    { id: '3', name: 'House', value: '', position: { x: 80, y: 50 }, color: 'bg-orange-300' },
    { id: '4', name: 'Room', value: '', position: { x: 70, y: 70 }, color: 'bg-orange-200' },
    { id: '5', name: 'Sociopolitic', value: '', position: { x: 50, y: 80 }, color: 'bg-orange-500' },
    { id: '6', name: 'Private', value: '', position: { x: 30, y: 70 }, color: 'bg-orange-400' },
    { id: '7', name: 'Society', value: '', position: { x: 20, y: 50 }, color: 'bg-orange-300' },
    { id: '8', name: 'Environment', value: '', position: { x: 30, y: 30 }, color: 'bg-orange-200' },
    { id: '9', name: 'Country', value: '', position: { x: 50, y: 50 }, color: 'bg-orange-100' },
    { id: '10', name: 'Labor Law', value: '', position: { x: 20, y: 20 }, color: 'bg-orange-500' },
    { id: '11', name: 'Rules of Work', value: '', position: { x: 30, y: 10 }, color: 'bg-orange-400' },
    { id: '12', name: 'Working Office', value: '', position: { x: 50, y: 10 }, color: 'bg-orange-300' },
    { id: '13', name: 'Center', value: '', position: { x: 50, y: 50 }, color: 'bg-orange-100' },
  ];

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Universe Formula</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={40} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Universe Form Inputs */}
        <div>
          <Card header="Universe Details">
            <div className="space-y-4">
              <CompactInput
                label="Universe Name"
                labelColor="text-orange-500"
                type="text"
                value={universeName}
                onChange={(e) => setUniverseName(e.target.value)}
                placeholder="Enter universe name"
              />
              <CompactInput
                label="Period"
                labelColor="text-orange-500"
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g., Medieval, Futuristic"
              />
              <CompactInput
                label="Era"
                labelColor="text-orange-500"
                type="text"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="e.g., Renaissance, Space Age"
              />
              <CompactInput
                label="Location"
                labelColor="text-orange-500"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Earth, Mars, Fantasy Realm"
              />
              <CompactInput
                label="World Type"
                labelColor="text-orange-500"
                type="select"
                value={worldType}
                onChange={(e) => setWorldType(e.target.value)}
                placeholder="Select world type"
              >
                <option value="">Select world type</option>
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="modern">Modern</option>
                <option value="historical">Historical</option>
                <option value="apocalyptic">Apocalyptic</option>
              </CompactInput>
              <CompactInput
                label="Technology Level"
                labelColor="text-orange-500"
                type="select"
                value={technologyLevel}
                onChange={(e) => setTechnologyLevel(e.target.value)}
                placeholder="Select technology level"
              >
                <option value="">Select technology level</option>
                <option value="primitive">Primitive</option>
                <option value="medieval">Medieval</option>
                <option value="industrial">Industrial</option>
                <option value="modern">Modern</option>
                <option value="futuristic">Futuristic</option>
                <option value="advanced">Advanced</option>
              </CompactInput>
              <CompactInput
                label="Magic System"
                labelColor="text-orange-500"
                type="select"
                value={magicSystem}
                onChange={(e) => setMagicSystem(e.target.value)}
                placeholder="Select magic system"
              >
                <option value="">Select magic system</option>
                <option value="elemental">Elemental</option>
                <option value="divine">Divine</option>
                <option value="arcane">Arcane</option>
                <option value="psionic">Psionic</option>
                <option value="none">None</option>
              </CompactInput>
              <CompactInput
                label="Environment"
                labelColor="text-orange-500"
                type="textarea"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Describe the environment..."
                rows={3}
              />
              <CompactInput
                label="Society"
                labelColor="text-orange-500"
                type="textarea"
                value={society}
                onChange={(e) => setSociety(e.target.value)}
                placeholder="Describe society structure..."
                rows={3}
              />
              <CompactInput
                label="Private Life"
                labelColor="text-orange-500"
                type="textarea"
                value={privateLife}
                onChange={(e) => setPrivateLife(e.target.value)}
                placeholder="Describe private life aspects..."
                rows={3}
              />
              <CompactInput
                label="Government"
                labelColor="text-orange-500"
                type="textarea"
                value={government}
                onChange={(e) => setGovernment(e.target.value)}
                placeholder="Describe government structure..."
                rows={3}
              />
              <CompactInput
                label="Economy"
                labelColor="text-orange-500"
                type="textarea"
                value={economy}
                onChange={(e) => setEconomy(e.target.value)}
                placeholder="Describe economic system..."
                rows={3}
              />
              <CompactInput
                label="Culture"
                labelColor="text-orange-500"
                type="textarea"
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                placeholder="Describe cultural aspects..."
                rows={3}
              />
            </div>
          </Card>
        </div>

        {/* Clock Layout */}
        <div>
          <Card header="Clock Layout (Opposing Clockwise)">
            <div className="relative w-full h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              {/* Clock Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* Center Circle */}
                <circle cx="50" cy="50" r="8" fill="#FED7AA" stroke="#FB923C" strokeWidth="2" />
                
                {/* Clock Lines */}
                <line x1="50" y1="50" x2="50" y2="10" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="85" y2="15" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="90" y2="50" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="85" y2="85" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="90" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="15" y2="85" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="10" y2="50" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="15" y2="15" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="10" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="30" y2="15" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="20" y2="30" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="15" y2="50" stroke="#FED7AA" strokeWidth="1" />
                <line x1="50" y1="50" x2="20" y2="70" stroke="#FED7AA" strokeWidth="1" />
                
                {/* Clock Nodes */}
                {universeNodes.map((node) => (
                  <g key={node.id} onClick={() => handleNodeClick(node.id)}>
                    <circle
                      cx={node.position.x}
                      cy={node.position.y}
                      r="6"
                      className={`cursor-pointer ${node.color} hover:opacity-80 transition-opacity`}
                    />
                    <text
                      x={node.position.x}
                      y={node.position.y - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {node.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <h3 className="text-sm font-bold text-orange-600">{universeName || 'Universe Name'}</h3>
                <p className="text-xs text-orange-500">{period || 'Period'}</p>
              </div>

              {/* Legend */}
              <div className="absolute bottom-2 left-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Primary</span>
                  <div className="w-3 h-3 bg-orange-400 rounded-full ml-2"></div>
                  <span className="text-gray-600">Secondary</span>
                  <div className="w-3 h-3 bg-orange-300 rounded-full ml-2"></div>
                  <span className="text-gray-600">Tertiary</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};