# Universe Formula UI/UX Design

## Overview
The Universe Formula tab provides a comprehensive framework for defining the world, systems, and environments of the IP universe. The layout follows an opposing clockwise (berlawanan jarum jam) pattern starting from small private spaces (clock 3) to larger communal spaces (clock 4), then expanding to societal systems.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIVERSE & SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  WORKING OFFICE/SCHOOL  │  TOWN/DISTRICT/CITY  │  NEIGHBORHOOD/ENV  │
├───────────────────────────┼────────────────────────┼─────────────────────┤
│                           │                      │                     │
│  RULES OF WORK           │  NAME OF UNIVERSE    │  HOUSE/CASTLE      │
│                           │  PERIODE             │                     │
│  LABOR LAW               │                      │  ROOM/CAVE          │
│                           │  ENVIRONMENT/         │                     │
│  COUNTRY                 │  LANDSCAPE           │  FAMILY/INNER CIRCLE│
│                           │                      │                     │
│  GOVERNMENT SYSTEM        │  SOCIETY & SYSTEM     │  KINGDOM/TRIBE/     │
│                           │  PRIVATE/INTERIOR     │  COMMUNAL           │
│                           │                      │                     │
│                           │  SOCIO POLITIC &      │                     │
│                           │  ECONOMY             │                     │
│                           │                      │                     │
│                           │  SOCIOCULTURAL SYSTEM │                     │
└───────────────────────────┴────────────────────────┴─────────────────────┘
```

## Section Details

### Top Row: Locations
| Field | Type | Description |
|-------|------|-------------|
| Working Office/School | Textarea | Daily work/study environment |
| Town/District/City | Textarea | Urban setting description |
| Neighborhood/Environment | Textarea | Local vibe and surroundings |

### Left Column: Systems (Pink Theme)
| Field | Type | Description |
|-------|------|-------------|
| Rules of Work | Textarea | Employment and work regulations |
| Labor Law | Textarea | Legal framework for workers |
| Country | Textarea | Nation/country name and context |
| Government System | Textarea | Political system structure |

### Center Column: Identity & Visuals

#### Identity Section
| Field | Type | Description |
|-------|------|-------------|
| Name of Universe | Input | Universe name (e.g., "Neo-Tokyo 2099") |
| Periode | Input | Time period (e.g., "22nd Century") |

#### Visual Section
| Field | Type | Description |
|-------|------|-------------|
| Environment/Landscape | Image Upload (200px) | Main visual of the world/environment |
| Society & System | Image Upload (135px) | Visual representation of society |
| Private/Interior | Image Upload (135px) | Visual representation of private spaces |

#### Systems Section
| Field | Type | Description |
|-------|------|-------------|
| Socio Politic & Economy | Textarea | Political and economic systems |
| Sociocultural System | Textarea | Cultural and social systems |

### Right Column: Private Spaces (Blue Theme)
| Field | Type | Description |
|-------|------|-------------|
| House/Castle | Textarea | Character's primary residence |
| Room/Cave | Textarea | Private sanctuary space |
| Family/Inner Circle | Textarea | Close relationships |
| Kingdom/Tribe/Communal | Textarea | Broader community identity |

## Color Coding

- **Orange**: Locations (Top Row)
- **Pink**: Systems (Left Column)
- **Yellow**: Identity & Environment (Center)
- **Blue**: Private Spaces (Right Column)

## Opposing Clockwise Layout Concept

The layout follows the opposing clockwise (berlawanan jarum jam) pattern:

1. **Clock 3** (Right Column, bottom): Room/Cave - Smallest private space
2. Moving upward: Family/Inner Circle → House/Castle
3. **Clock 4** (Right Column, top): Kingdom/Tribe/Communal - Largest private space
4. Moving to Left Column: Government System → Country → Labor Law → Rules of Work
5. Top Row: Neighborhood/Environment → Town/District/City → Working Office/School
6. Center: Environment/Landscape (visual center) with Society & System and Private/Interior below

This represents the expansion from personal to communal, then to societal and environmental systems.

## State Management

```typescript
interface UniverseData {
  // Locations
  workingOffice: string;
  townDistrictCity: string;
  neighborhoodEnvironment: string;
  
  // Systems
  rulesOfWork: string;
  laborLaw: string;
  country: string;
  governmentSystem: string;
  
  // Identity
  nameOfUniverse: string;
  periode: string;
  
  // Visuals
  environmentLandscape: string; // Image URL
  societySystem: string; // Image URL
  privateInterior: string; // Image URL
  
  // Systems
  socioPoliticEconomy: string;
  socioculturalSystem: string;
  
  // Private Spaces
  houseCastle: string;
  roomCave: string;
  familyInnerCircle: string;
  kingdomTribeCommunal: string;
}
```

## API Integration

### Save Universe Bible
```typescript
POST /api/projects/:id/universe
{
  universeData: UniverseData
}
```

### Generate Environment Image
```typescript
POST /api/ai/generate-universe-environment
{
  universeName: string,
  periode: string,
  description: string,
  style: string
}
```

### Generate Society System Image
```typescript
POST /api/ai/generate-society-system
{
  governmentSystem: string,
  socioPoliticEconomy: string,
  socioculturalSystem: string
}
```

### Generate Private Interior Image
```typescript
POST /api/ai/generate-private-interior
{
  houseCastle: string,
  roomCave: string,
  familyInnerCircle: string
}
```

## Implementation Notes

1. **Image Uploads**: All visual sections support both upload and AI generation
2. **Auto-save**: Changes are automatically saved to the project
3. **AI Generation**: Each visual section can be generated using AI based on the text descriptions
4. **Responsive**: Grid adapts to screen size (3 columns on desktop, 1 on mobile)
5. **Asset Library**: Images can be selected from the asset library

## Reference Implementation

The Universe Formula tab is located at:
- **File**: `D:/AI/AI-Series-Studio/client/src/pages/studio.tsx`
- **Lines**: 2092-2218

Key implementation details:
- Uses `grid-cols-12` for main layout
- Left column: `md:col-span-3`
- Center column: `md:col-span-6`
- Right column: `md:col-span-3`
- Top row: `grid-cols-3`
