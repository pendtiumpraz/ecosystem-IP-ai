import { useState } from 'react';
import { Upload, User, Briefcase } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar } from './StudioUIComponents';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  isModoHolder: boolean;
}

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange }) => {
  return (
    <div 
      className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-orange-400 transition-colors"
      style={{ backgroundColor: color }}
      onClick={() => onColorChange(color)}
    />
  );
};

export const IPProjectTab: React.FC = () => {
  const [studioName, setStudioName] = useState('');
  const [ipOwner, setIpOwner] = useState('');
  const [ipTitle, setIpTitle] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B35');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', role: 'IP Producer', isModoHolder: true },
    { id: '2', name: 'Jane Smith', role: 'Head of Creative', isModoHolder: true },
    { id: '3', name: 'Mike Johnson', role: 'Head of Production', isModoHolder: false },
  ]);

  const colors = ['#FF6B35', '#FF8C42', '#FFA559', '#FFBD70', '#FFE099'];

  const handleAddTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Member',
      role: 'Other Role',
      isModoHolder: false,
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, role: newRole } : member
    ));
  };

  const handleModoHolderToggle = (id: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, isModoHolder: !member.isModoHolder } : member
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">IP Project</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Auto-saved</span>
          <Button variant="secondary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={65} />

      {/* Studio Logo and Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Studio Logo Upload */}
        <Card header="Studio Logo">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload logo</p>
              <p className="text-xs text-gray-400">or drag and drop</p>
            </div>
            <div className="flex gap-2">
              {colors.map((color) => (
                <ColorPicker 
                  key={color} 
                  color={color} 
                  onColorChange={setSelectedColor} 
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Studio Information */}
        <Card header="Studio Information">
          <div className="space-y-4">
            <CompactInput
              label="Studio Name"
              labelColor="text-orange-500"
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              placeholder="Enter studio name"
              helperText="This will be displayed in your IP project"
              helperColor="text-gray-400"
            />
            <CompactInput
              label="IP Owner"
              labelColor="text-orange-500"
              type="text"
              value={ipOwner}
              onChange={(e) => setIpOwner(e.target.value)}
              placeholder="Enter IP owner name"
            />
            <CompactInput
              label="IP Title"
              labelColor="text-orange-500"
              type="text"
              value={ipTitle}
              onChange={(e) => setIpTitle(e.target.value)}
              placeholder="Enter IP title"
            />
            <CompactInput
              label="Production Date"
              labelColor="text-orange-500"
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
            />
            <CompactInput
              label="Description"
              labelColor="text-orange-500"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
            />
          </div>
        </Card>
      </div>

      {/* Brand Identity */}
      <Card header="Brand Identity">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Logos</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">Primary Logo</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">Secondary Logo</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">Tertiary Logo</p>
            </div>
          </div>
          <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Color Palette</h4>
          <div className="flex gap-2">
            {colors.map((color) => (
              <div key={color} className="w-12 h-12 rounded-lg border-2 border-gray-200" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </Card>

      {/* Project Team */}
      <Card header="Project Team (Modo Token Holders Only)">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Team Members</h4>
            <Button 
              variant="secondary" 
              label="Add Member" 
              icon={<User className="w-4 h-4" />}
              onClick={handleAddTeamMember}
            />
          </div>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  {member.isModoHolder && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                      Modo Holder
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  >
                    <option value="IP Producer">IP Producer</option>
                    <option value="Head of Creative">Head of Creative</option>
                    <option value="Head of Production">Head of Production</option>
                    <option value="Head of Business & Strategic">Head of Business & Strategic</option>
                    <option value="Story Supervisor">Story Supervisor</option>
                    <option value="Character Supervisor">Character Supervisor</option>
                    <option value="Other Role">Other Role</option>
                  </select>
                  <button 
                    onClick={() => handleModoHolderToggle(member.id)}
                    className={`px-2 py-1 text-xs rounded ${member.isModoHolder ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {member.isModoHolder ? 'Holder' : 'Not Holder'}
                  </button>
                  <button 
                    onClick={() => handleDeleteTeamMember(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};