# 👥 PROJECT TEAM, MATERIALS & ROLES
## Complete Implementation Requirements

**Date:** December 2025  
**Features:** Project Team, Pre-existing Materials, Custom Roles  
**Goal:** Full team management with Modo Community integration and asset management

---

# 📊 EXECUTIVE SUMMARY

ecosystem-IP-ai needs to implement:

| Feature | Current Status | Target Status |
|----------|---------------|--------------|
| **Project Team** | Partial | Full Modo Community integration |
| **Pre-existing Materials** | 0% | Full asset upload system |
| **Custom Roles** | 0% | Dynamic role management |

---

# 👥 PROJECT TEAM WITH MODO COMMUNITY

## Overview

Project team should:
- ✅ Invite members from Modo Community
- ✅ Invite external users via email
- ✅ Assign predefined roles (IP Producer, Head of Creative, etc.)
- ✅ Add custom roles dynamically
- ✅ Set permission levels per member
- ✅ Track member activity and contributions
- ✅ Manage team invitations and access

## Database Schema

```sql
-- Project team members
CREATE TABLE project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  modo_user_id VARCHAR(100), -- Modo Community user ID
  role_id UUID REFERENCES project_roles(id),
  permission_level VARCHAR(50) NOT NULL, -- 'view', 'edit', 'admin'
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  joined_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  last_active_at TIMESTAMP,
  contribution_count INTEGER DEFAULT 0,
  UNIQUE(project_id, user_id),
  UNIQUE(project_id, modo_user_id)
);

-- Custom project roles
CREATE TABLE project_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  is_custom BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Team invitations
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  modo_user_id VARCHAR(100),
  role_id UUID REFERENCES project_roles(id),
  invited_by UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Team activity log
CREATE TABLE team_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'joined', 'left', 'role_changed', 'permission_changed'
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Team Management

```typescript
// src/app/api/projects/[projectId]/team/route.ts

import { NextRequest, NextResponse } from 'next/server';

// GET - List all team members
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const teamMembers = await db.query.project_team_members.findMany({
      where: { project_id: params.projectId },
      include: {
        user: true,
        role: true,
      },
      orderBy: { joined_at: 'asc' },
    });

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Team members fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST - Invite team member
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { email, modoUserId, roleId } = await req.json();
    
    if (!email && !modoUserId) {
      return NextResponse.json({ error: 'Email or modoUserId is required' }, { status: 400 });
    }

    // Check if user already in team
    const existingMember = await db.query.project_team_members.findFirst({
      where: {
        project_id: params.projectId,
        OR: [
          { user_id: modoUserId },
          { modo_user_id: modoUserId },
        ],
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User already in team' }, { status: 400 });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (modoUserId) {
      // Modo Community invitation
      const invitation = await db.query.team_invitations.create({
        data: {
          project_id: params.projectId,
          modo_user_id: modoUserId,
          role_id: roleId,
          invited_by: req.user?.id,
          token,
          expires_at: expiresAt,
        },
      });

      // Send notification to Modo Community
      await sendModoNotification(modoUserId, {
        type: 'project_invitation',
        project_id: params.projectId,
        invitation_id: invitation.id,
      });

      return NextResponse.json({ invitationId: invitation.id, modoUserId });
    } else {
      // Email invitation
      const invitation = await db.query.team_invitations.create({
        data: {
          project_id: params.projectId,
          email,
          role_id: roleId,
          invited_by: req.user?.id,
          token,
          expires_at: expiresAt,
        },
      });

      // Send email
      await sendInvitationEmail(email, {
        project_id: params.projectId,
        token,
        expires_at: expiresAt,
      });

      return NextResponse.json({ invitationId: invitation.id, email });
    }
  } catch (error) {
    console.error('Team invitation error:', error);
    return NextResponse.json({ error: 'Failed to invite team member' }, { status: 500 });
  }
}

// PATCH - Update member role or permissions
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { memberId, roleId, permissionLevel } = await req.json();

    const updatedMember = await db.query.project_team_members.update({
      where: { id: memberId },
      data: {
        role_id: roleId,
        permission_level: permissionLevel,
      },
    });

    // Log activity
    await db.query.team_activity_log.create({
      data: {
        project_id: params.projectId,
        user_id: req.user?.id,
        action: 'role_changed',
        details: { memberId, roleId, permissionLevel },
      },
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Team member update error:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE - Remove team member
export async function DELETE(
  req: NextRequest,
  { params: { params: { projectId: string, memberId: string } }
) {
  try {
    await db.query.project_team_members.delete({
      where: { id: params.memberId },
    });

    // Log activity
    await db.query.team_activity_log.create({
      data: {
        project_id: params.projectId,
        user_id: req.user?.id,
        action: 'left',
        details: { memberId: params.memberId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team member removal error:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}
```

### Role Management

```typescript
// src/app/api/projects/[projectId]/roles/route.ts

// GET - List all roles
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const roles = await db.query.project_roles.findMany({
      where: { project_id: params.projectId },
      orderBy: { display_order: 'asc' },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Roles fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

// POST - Create custom role
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { name, description, icon, color } = await req.json();

    // Get max display order
    const maxOrder = await db.query.project_roles.findFirst({
      where: { project_id: params.projectId },
      orderBy: { display_order: 'desc' },
    });

    const role = await db.query.project_roles.create({
      data: {
        project_id: params.projectId,
        name,
        description,
        icon: icon || 'User',
        color: color || '#3b82f6',
        is_custom: true,
        display_order: (maxOrder?.display_order || 0) + 1,
      },
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Role creation error:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

// DELETE - Delete custom role
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string, roleId: string } }
) {
  try {
    // Check if role is custom
    const role = await db.query.project_roles.findFirst({
      where: { id: params.roleId },
    });

    if (!role?.is_custom) {
      return NextResponse.json({ error: 'Cannot delete predefined role' }, { status: 400 });
    }

    await db.query.project_roles.delete({
      where: { id: params.roleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Role deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
```

### Modo Community Integration

```typescript
// src/app/api/modo/users/route.ts

// GET - Search Modo Community users
export async function GET(req: NextRequest) {
  try {
    const { query, role, tokensMin } = Object.fromEntries(req.nextUrl.searchParams);

    // Search Modo Community API
    const modoResponse = await fetch('https://api.modo.community/v1/users/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        filters: {
          role,
          tokens_min: tokensMin,
        },
      }),
    });

    const modoUsers = await modoResponse.json();

    return NextResponse.json({ users: modoUsers.data });
  } catch (error) {
    console.error('Modo user search error:', error);
    return NextResponse.json({ error: 'Failed to search Modo users' }, { status: 500 });
  }
}

// GET - Get Modo user profile
export async function GET(
  req: NextRequest,
  { params }: { params: { modoUserId: string } }
) {
  try {
    const modoResponse = await fetch(`https://api.modo.community/v1/users/${params.modoUserId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MODO_API_KEY}`,
      },
    });

    const modoUser = await modoResponse.json();

    return NextResponse.json({ user: modoUser.data });
  } catch (error) {
    console.error('Modo user fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch Modo user' }, { status: 500 });
  }
}
```

## Frontend Components

### Team Management UI

```tsx
// src/components/project-team.tsx

interface TeamMember {
  id: string;
  userId?: string;
  modoUserId?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  modoUser?: {
    name: string;
    username: string;
    avatar?: string;
    tokens: number;
    badges: string[];
  };
  role: {
    name: string;
    icon: string;
    color: string;
  };
  permissionLevel: 'view' | 'edit' | 'admin';
  status: 'pending' | 'accepted';
  joinedAt?: Date;
  lastActiveAt?: Date;
  contributionCount: number;
}

export function ProjectTeam({ projectId }: { projectId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [inviteMode, setInviteMode] = useState<'modo' | 'email'>('modo');
  const [searchQuery, setSearchQuery] = useState('');
  const [modoUsers, setModoUsers] = useState<any[]>([]);
  const [selectedModoUser, setSelectedModoUser] = useState<string | null>(null);

  // Fetch team members
  useEffect(() => {
    fetchTeamMembers();
    fetchRoles();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    const response = await fetch(`/api/projects/${projectId}/team`);
    const data = await response.json();
    setTeamMembers(data.teamMembers);
  };

  const fetchRoles = async () => {
    const response = await fetch(`/api/projects/${projectId}/roles`);
    const data = await response.json();
    setRoles(data.roles);
  };

  // Search Modo users
  const searchModoUsers = async (query: string) => {
    if (!query) {
      setModoUsers([]);
      return;
    }

    const response = await fetch(`/api/modo/users?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    setModoUsers(data.users);
  };

  // Invite member
  const inviteMember = async () => {
    const response = await fetch(`/api/projects/${projectId}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modoUserId: selectedModoUser,
        roleId: 'default-role-id',
      }),
    });

    if (response.ok) {
      setShowInviteDialog(false);
      setSelectedModoUser(null);
      fetchTeamMembers();
    }
  };

  return (
    <div className="project-team-section">
      {/* Header */}
      <div className="team-header">
        <div className="team-info">
          <h2>Project Team</h2>
          <p className="team-count">
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Members List */}
      <div className="team-members-list">
        {teamMembers.map(member => (
          <div key={member.id} className="team-member-card">
            <div className="member-avatar">
              {member.user?.avatar || member.modoUser?.avatar ? (
                <img 
                  src={member.user?.avatar || member.modoUser?.avatar}
                  alt={member.user?.name || member.modoUser?.name}
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {(member.user?.name || member.modoUser?.name)?.charAt(0)}
                </div>
              )}
            </div>
            <div className="member-info">
              <div className="member-header">
                <h3 className="member-name">
                  {member.user?.name || member.modoUser?.name}
                </h3>
                {member.modoUser && (
                  <Badge className="modo-badge" variant="outline">
                    <Star className="h-3 w-3 mr-1" />
                    Modo Member
                  </Badge>
                )}
              </div>
              <p className="member-role">
                <span 
                  className="role-badge"
                  style={{ backgroundColor: member.role.color }}
                >
                  <getIconByName(member.role.icon)} className="h-3 w-3 mr-1" />
                  {member.role.name}
                </span>
              </p>
              {member.modoUser && (
                <div className="modo-stats">
                  <Badge variant="outline" className="tokens-badge">
                    <Coins className="h-3 w-3 mr-1" />
                    {member.modoUser.tokens.toLocaleString()} MODO
                  </Badge>
                  {member.modoUser.badges.map(badge => (
                    <Badge key={badge} variant="outline" className="badge-item">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="member-actions">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeMemberRole(member.id)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePermissions(member.id)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Permissions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => removeMember(member.id)}
                    className="text-red-600"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Invite members from Modo Community or via email
            </DialogDescription>
          </DialogHeader>
          
          {/* Invite Mode Tabs */}
          <Tabs value={inviteMode} onValueChange={setInviteMode}>
            <TabsList>
              <TabsTrigger value="modo">
                <Users className="h-4 w-4 mr-2" />
                Modo Community
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>
            
            {/* Modo Community Tab */}
            <TabsContent value="modo">
              <div className="modo-invite-content">
                <div className="search-section">
                  <div className="search-input-wrapper">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search Modo Community..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchModoUsers(e.target.value);
                      }}
                    />
                  </div>
                  <div className="search-filters">
                    <Select>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="creator">Creators</SelectItem>
                        <SelectItem value="artist">Artists</SelectItem>
                        <SelectItem value="writer">Writers</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Min Tokens" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All</SelectItem>
                        <SelectItem value="1000">1,000+</SelectItem>
                        <SelectItem value="5000">5,000+</SelectItem>
                        <SelectItem value="10000">10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Modo Users Results */}
                <div className="modo-users-results">
                  {modoUsers.map(user => (
                    <div 
                      key={user.id}
                      className={`modo-user-card ${selectedModoUser === user.id ? 'selected' : ''}`}
                      onClick={() => setSelectedModoUser(user.id)}
                    >
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <h4 className="user-name">{user.name}</h4>
                        <p className="user-username">@{user.username}</p>
                        <div className="user-stats">
                          <Badge variant="outline" className="tokens-badge">
                            <Coins className="h-3 w-3 mr-1" />
                            {user.tokens.toLocaleString()} MODO
                          </Badge>
                          {user.badges.slice(0, 3).map(badge => (
                            <Badge key={badge} variant="outline" className="badge-item">
                              {badge}
                            </Badge>
                          ))}
                          {user.badges.length > 3 && (
                            <Badge variant="outline" className="badge-item">
                              +{user.badges.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {selectedModoUser === user.id && (
                        <CheckCircle className="check-icon text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Email Tab */}
            <TabsContent value="email">
              <div className="email-invite-content">
                <div className="form-field">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="member@example.com"
                  />
                </div>
                <div className="form-field">
                  <Label>Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-field">
                  <Label>Personal Message (Optional)</Label>
                  <Textarea 
                    placeholder="Add a personal message..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={inviteMember}
              disabled={!selectedModoUser && inviteMode === 'modo'}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

# 📁 PRE-EXISTING MATERIALS

## Overview

Pre-existing materials feature should:
- ✅ Upload visual assets for characters
- ✅ Upload visual assets for universe/environment
- ✅ Organize assets by type (base, pose, emotion, location, etc.)
- ✅ Preview assets in gallery
- ✅ Use assets as reference for AI generation
- ✅ Manage asset versions
- ✅ Delete unused assets

## Database Schema

```sql
-- Pre-existing materials
CREATE TABLE pre_existing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'character', 'universe', 'location', 'prop'
  reference_type VARCHAR(50) NOT NULL, -- 'base', 'front', 'side', 'action', 'emotion', 'environment'
  reference_id VARCHAR(100), -- character_id or universe_id
  name VARCHAR(255),
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'model'
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for video
  tags TEXT[], -- array of tags
  metadata JSONB, -- additional metadata
  version INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT FALSE, -- mark as primary reference
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset versions
CREATE TABLE asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES pre_existing_materials(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  version INTEGER NOT NULL,
  change_description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

```typescript
// src/app/api/projects/[projectId]/materials/route.ts

// GET - List all materials
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { type, referenceId, referenceType } = Object.fromEntries(req.nextUrl.searchParams);

    const materials = await db.query.pre_existing_materials.findMany({
      where: {
        project_id: params.projectId,
        ...(type && { type }),
        ...(referenceId && { reference_id: referenceId }),
        ...(referenceType && { reference_type: referenceType }),
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Materials fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

// POST - Upload material
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const referenceType = formData.get('referenceType') as string;
    const referenceId = formData.get('referenceId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Upload file to storage
    const fileUrl = await uploadFile(file, projectId);

    // Get image dimensions
    let width, height;
    if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file);
      width = dimensions.width;
      height = dimensions.height;
    }

    // Create material record
    const material = await db.query.pre_existing_materials.create({
      data: {
        project_id: params.projectId,
        type,
        reference_type: referenceType,
        reference_id: referenceId,
        name: name || file.name,
        description,
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type.startsWith('image/') ? 'image' : 'video',
        width,
        height,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        uploaded_by: req.user?.id,
      },
    });

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Material upload error:', error);
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 500 });
  }
}

// PATCH - Update material
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string, materialId: string } }
) {
  try {
    const { name, description, isPrimary } = await req.json();

    const material = await db.query.pre_existing_materials.update({
      where: { id: params.materialId },
      data: {
        name,
        description,
        is_primary: isPrimary,
      },
    });

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Material update error:', error);
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
  }
}

// DELETE - Delete material
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string, materialId: string } }
) {
  try {
    await db.query.pre_existing_materials.delete({
      where: { id: params.materialId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Material deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
```

## Frontend Components

### Materials Gallery UI

```tsx
// src/components/pre-existing-materials.tsx

export function PreExistingMaterials({ projectId }: { projectId: string }) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [projectId, selectedType]);

  const fetchMaterials = async () => {
    const response = await fetch(`/api/projects/${projectId}/materials?type=${selectedType}`);
    const data = await response.json();
    setMaterials(data.materials);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', selectedType);
    formData.append('name', file.name);
    
    const response = await fetch(`/api/projects/${projectId}/materials`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      fetchMaterials();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileUpload(file));
  };

  return (
    <div className="materials-section">
      {/* Header */}
      <div className="materials-header">
        <div className="header-info">
          <h2>Pre-existing Materials</h2>
          <p className="materials-count">
            {materials.length} asset{materials.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="header-actions">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="character">Characters</SelectItem>
              <SelectItem value="universe">Universe</SelectItem>
              <SelectItem value="location">Locations</SelectItem>
              <SelectItem value="prop">Props</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        className={`upload-zone ${dragOver ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {dragOver ? (
          <div className="drag-over-content">
            <Upload className="h-12 w-12 text-primary" />
            <p className="drag-message">Drop files here to upload</p>
          </div>
        ) : (
          <div className="upload-content">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="upload-text">
              Drag & drop files here or{' '}
              <Button variant="ghost" size="sm" onClick={() => setShowUploadDialog(true)}>
                browse
              </Button>
            </p>
          </div>
        )}
      </div>

      {/* Materials Grid */}
      <div className="materials-grid">
        {materials.map(material => (
          <div key={material.id} className="material-card">
            <div className="material-preview">
              {material.file_type === 'image' ? (
                <img 
                  src={material.file_url} 
                  alt={material.name}
                  className="material-image"
                />
              ) : (
                <video 
                  src={material.file_url} 
                  className="material-video"
                  controls
                />
              )}
              {material.is_primary && (
                <Badge className="primary-badge" variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              )}
            </div>
            <div className="material-info">
              <h3 className="material-name">{material.name}</h3>
              <p className="material-description">{material.description}</p>
              <div className="material-meta">
                <span className="material-type">
                  {material.type}
                </span>
                <span className="material-reference">
                  {material.reference_type}
                </span>
                <span className="material-size">
                  {formatFileSize(material.file_size)}
                </span>
              </div>
              {material.tags && material.tags.length > 0 && (
                <div className="material-tags">
                  {material.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="tag-item">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="material-actions">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAsPrimary(material.id)}
              >
                <Star className="h-4 w-4 mr-1" />
                Set Primary
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => downloadMaterial(material.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editMaterial(material.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => deleteMaterial(material.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 🎭 CUSTOM ROLES

## Overview

Custom roles feature should:
- ✅ Create unlimited custom roles
- ✅ Set role icons and colors
- ✅ Define role descriptions
- ✅ Set display order
- ✅ Assign roles to team members
- ✅ Delete custom roles (not predefined)

## Predefined Roles

```typescript
const PREDEFINED_ROLES = [
  {
    id: 'ip-producer',
    name: 'IP Producer',
    description: 'Overall project management and IP strategy',
    icon: 'Crown',
    color: '#8b5cf6',
    is_custom: false,
    display_order: 1,
  },
  {
    id: 'head-of-creative',
    name: 'Head of Creative',
    description: 'Leads creative direction and artistic vision',
    icon: 'Palette',
    color: '#ec4899',
    is_custom: false,
    display_order: 2,
  },
  {
    id: 'head-of-production',
    name: 'Head of Production',
    description: 'Manages production workflow and resources',
    icon: 'Wrench',
    color: '#f59e0b',
    is_custom: false,
    display_order: 3,
  },
  {
    id: 'head-of-business',
    name: 'Head of Business & Strategic',
    description: 'Handles business development and partnerships',
    icon: 'Briefcase',
    color: '#10b981',
    is_custom: false,
    display_order: 4,
  },
  {
    id: 'story-supervisor',
    name: 'Story Supervisor',
    description: 'Oversees story development and narrative',
    icon: 'BookOpen',
    color: '#6366f1',
    is_custom: false,
    display_order: 5,
  },
  {
    id: 'character-supervisor',
    name: 'Character Supervisor',
    description: 'Manages character design and consistency',
    icon: 'User',
    color: '#8b5cf6',
    is_custom: false,
    display_order: 6,
  },
];
```

## Role Management UI

```tsx
// src/components/role-management.tsx

export function RoleManagement({ projectId }: { projectId: string }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    icon: 'User',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchRoles();
  }, [projectId]);

  const fetchRoles = async () => {
    const response = await fetch(`/api/projects/${projectId}/roles`);
    const data = await response.json();
    setRoles(data.roles);
  };

  const createRole = async () => {
    const response = await fetch(`/api/projects/${projectId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRole),
    });

    if (response.ok) {
      setShowCreateDialog(false);
      setNewRole({
        name: '',
        description: '',
        icon: 'User',
        color: '#3b82f6',
      });
      fetchRoles();
    }
  };

  const deleteRole = async (roleId: string) => {
    const response = await fetch(`/api/projects/${projectId}/roles/${roleId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchRoles();
    }
  };

  const ROLE_ICONS = [
    { name: 'User', icon: User },
    { name: 'Crown', icon: Crown },
    { name: 'Palette', icon: Palette },
    { name: 'Wrench', icon: Wrench },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Shield', icon: Shield },
    { name: 'Zap', icon: Zap },
    { name: 'Star', icon: Star },
    { name: 'Target', icon: Target },
  ];

  const ROLE_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#64748b', '#06b6d4', '#84cc16',
  ];

  return (
    <div className="roles-section">
      {/* Header */}
      <div className="roles-header">
        <div className="header-info">
          <h2>Team Roles</h2>
          <p className="roles-count">
            {roles.length} role{roles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <div 
              className="role-icon"
              style={{ backgroundColor: role.color }}
            >
              <getIconByName(role.icon)} className="h-6 w-6 text-white" />
            </div>
            <div className="role-content">
              <h3 className="role-name">{role.name}</h3>
              <p className="role-description">{role.description}</p>
              <div className="role-meta">
                {role.is_custom && (
                  <Badge variant="outline">Custom</Badge>
                )}
                <Badge variant="outline">
                  Predefined
                </Badge>
              </div>
            </div>
            {!role.is_custom && (
              <div className="role-actions">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editRole(role.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {role.is_custom && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => deleteRole(role.id)}
                className="delete-button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Define a new custom role for your project team
            </DialogDescription>
          </DialogHeader>
          <div className="role-form">
            <div className="form-field">
              <Label>Role Name</Label>
              <Input 
                placeholder="e.g., Concept Artist"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe the role responsibilities..."
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-field">
              <Label>Icon</Label>
              <div className="icon-grid">
                {ROLE_ICONS.map(iconOption => (
                  <div 
                    key={iconOption.name}
                    className={`icon-option ${newRole.icon === iconOption.name ? 'selected' : ''}`}
                    onClick={() => setNewRole({ ...newRole, icon: iconOption.name })}
                  >
                    <iconOption.icon className="h-6 w-6" />
                  </div>
                ))}
              </div>
            </div>
            <div className="form-field">
              <Label>Color</Label>
              <div className="color-grid">
                {ROLE_COLORS.map(color => (
                  <div 
                    key={color}
                    className={`color-option ${newRole.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewRole({ ...newRole, color })}
                  >
                    {newRole.color === color && (
                      <CheckCircle className="check-icon text-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createRole}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

# 📋 IMPLEMENTATION CHECKLIST

## Phase 1: Project Team
- [ ] Create project_team_members table
- [ ] Create project_roles table
- [ ] Create team_invitations table
- [ ] Create team_activity_log table
- [ ] Implement team management API endpoints
- [ ] Implement role management API endpoints
- [ ] Create Modo Community integration
- [ ] Build team management UI component
- [ ] Build role management UI component
- [ ] Add invite dialog with Modo search
- [ ] Add email invitation flow

## Phase 2: Pre-existing Materials
- [ ] Create pre_existing_materials table
- [ ] Create asset_versions table
- [ ] Implement materials API endpoints
- [ ] Implement file upload handler
- [ ] Build materials gallery UI component
- [ ] Add drag & drop upload
- [ ] Add asset preview
- [ ] Add asset management actions
- [ ] Integrate with character consistency system

## Phase 3: Custom Roles
- [ ] Define predefined roles
- [ ] Implement custom role creation
- [ ] Build role management UI
- [ ] Add role icon selector
- [ ] Add role color picker
- [ ] Implement role deletion
- [ ] Add role assignment to team members

## Phase 4: Integration
- [ ] Integrate team with IP Project tab
- [ ] Integrate materials with Character Formula
- [ ] Integrate materials with Universe Formula
- [ ] Add permission checks for actions
- [ ] Add activity tracking
- [ ] Add notifications for team events

---

# 📅 DOCUMENT INFO

**Created:** December 2025  
**Version:** 1.0  
**Features:** Project Team, Pre-existing Materials, Custom Roles  
**Author:** Architecture Analysis  
**Status:** Ready for Implementation
