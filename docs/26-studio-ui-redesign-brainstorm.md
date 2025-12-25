# Studio UI Redesign - Comprehensive Brainstorming

## Overview

This document provides comprehensive UI design brainstorming for all 9 studio tabs in the ecosystem-IP-ai project. The design focuses on **white theme with orange accents**, consistent patterns, and professional appearance.

## Design Principles

### 1. Theme & Colors
- **Primary Background**: White (`bg-white`)
- **Secondary Background**: Light Gray (`bg-gray-50`, `bg-gray-100`)
- **Primary Accent**: Orange (`orange-500`, `orange-400`, `orange-300`)
- **Text Colors**: 
  - Primary: `text-gray-900`
  - Secondary: `text-gray-600`
  - Tertiary: `text-gray-400`
  - On Orange: `text-white`
- **Borders**: `border-gray-200`, `border-orange-200`, `border-orange-300`
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`

### 2. Typography Scale
- **Page Titles**: `text-xl` or `text-2xl`, `font-bold`
- **Section Headers**: `text-sm`, `font-bold`, `uppercase`, `tracking-wider`
- **Card Titles**: `text-base`, `font-semibold`
- **Labels**: `text-xs`, `uppercase`, `tracking-wider`, `font-medium`
- **Input Text**: `text-sm`
- **Helper Text**: `text-[10px]` or `text-[11px]`
- **Button Text**: `text-xs` or `text-sm`, `font-medium`

### 3. Spacing System
- **Page Padding**: `p-6` or `p-8`
- **Section Gap**: `space-y-4` or `space-y-6`
- **Card Padding**: `p-4` or `p-6`
- **Input Padding**: `px-3 py-2` or `px-4 py-2`
- **Button Padding**: `px-4 py-2` (sm), `px-6 py-2` (md)

### 4. Component Sizes
- **Buttons**: 
  - Small: `h-8`, `text-xs`
  - Medium: `h-10`, `text-sm`
  - Large: `h-12`, `text-base`
- **Inputs**: `h-9` or `h-10`
- **Icons**: `h-4 w-4`, `h-5 w-5`
- **Cards**: `rounded-xl` or `rounded-lg`
- **Progress Bars**: `h-2`

### 5. Interactive States
- **Hover**: `hover:bg-gray-100`, `hover:shadow-md`
- **Focus**: `focus:ring-2`, `focus:ring-orange-400`, `focus:ring-offset-2`
- **Active**: `bg-orange-500`, `text-white`
- **Disabled**: `opacity-50`, `cursor-not-allowed`

---

## Tab 1: IP Project (Briefcase Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Project Title + Auto-save + Actions              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────────────────┐ │
│ │ Studio Logo     │  │ Studio Information           │ │
│ │ Upload          │  │ - Studio Name              │ │
│ │                 │  │ - IP Owner                 │ │
│ │                 │  │ - IP Title                 │ │
│ │                 │  │ - Production Date          │ │
│ │                 │  │ - Description              │ │
│ └─────────────────┘  └─────────────────────────────┘ │
│                                                          │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Brand Identity                                      │   │
│ │ - Logos (3 slots)                                 │   │
│ │ - Color Palette (5 colors)                           │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Project Team (Modo Token Holders Only)             │   │
│ │ - IP Producer                                       │   │
│ │ - Head of Creative                                   │   │
│ │ - Head of Production                                 │   │
│ │ - Head of Business & Strategic                       │   │
│ │ - Story Supervisor                                   │   │
│ │ - Character Supervisor                               │   │
│ │ - Other Role (custom)                               │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Studio Logo**: Orange-500
- **Studio Information**: Orange-400
- **Brand Identity**: Orange-300
- **Project Team**: Orange-500

### Key Components
1. **Logo Upload Area**: Drag & drop zone with dashed border
2. **Form Inputs**: Clean white inputs with orange focus
3. **Color Palette**: 5 color pickers in a row
4. **Team Members**: List with Modo token holder badge
5. **Progress Indicator**: Overall completion percentage

---

## Tab 2: Strategic Plan (Share2 Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Strategic Plan + AI Generate + Save              │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Completion                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Performance Analysis (15 Factors)                  │    │
│ │ ┌──────────────────────────────────────────────┐  │    │
│ │ │ Factor 1: Cast                           │  │    │
│ │ │ Factor 2: Director                        │  │    │
│ │ │ Factor 3: Producer                        │  │    │
│ │ │ ... (all 15 factors)                      │  │    │
│ │ └──────────────────────────────────────────────┘  │    │
│ │ Bar Chart: Project vs Competitor Comparison      │    │
│ │ Predicted Audience Display                     │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ IP Business Model Canvas (9 Sections)            │    │
│ │ ┌─────┬─────┬─────┐                          │    │
│ │ │     │     │     │                          │    │
│ │ ├─────┼─────┼─────┤  3x3 Grid Layout        │    │
│ │ │     │     │     │                          │    │
│ │ ├─────┼─────┼─────┤                          │    │
│ │ │     │     │     │                          │    │
│ │ └─────┴─────┴─────┘                          │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Genre Input                                         │    │
│ │ AI Suggestions                                      │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Performance Analysis**: Orange-500
- **IP Business Model Canvas**: Orange-400
- **Genre & AI Suggestions**: Orange-300

### Key Components
1. **Performance Factors**: 15 factors with sliders or inputs
2. **Bar Chart**: Visual comparison (Project vs Competitor)
3. **Business Model Canvas**: 3x3 grid with 9 sections
4. **Genre Selector**: Dropdown or radio buttons
5. **AI Suggestions**: Collapsible panel with AI-generated content

---

## Tab 3: Character Formula (User Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Character Formula + AI Generate + Save            │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Character Progress                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌───────────────────────────────────┐ │
│ │ Character   │  │ Character Detail                  │ │
│ │ List        │  │                                 │ │
│ │             │  │ Name: [Input]                  │ │
│ │ + New Char  │  │ Type: [Select]                  │ │
│ │             │  │ Age: [Input]                    │ │
│ │ ┌─────────┐│  │ Cast Reference: [Input]          │ │
│ │ │Char 1   ││  │                                 │ │
│ │ │Image     ││  │ 4 Pose Image Generation:         │ │
│ │ │Name      ││  │ ┌─────┬─────┬─────┬─────┐ │ │
│ │ │Role      ││  │ │Portrait│Action│Emotional│Full │ │ │
│ │ │Delete    ││  │ │      │      │        │Body  │ │ │
│ │ └─────────┘│  │ └─────┴─────┴─────┴─────┘ │ │
│ │             │  │                                 │ │
│ │ ┌─────────┐│  │ Accordion Sections:             │ │
│ │ │Char 2   ││  │ ▼ Physiological               │ │
│ │ │Image     ││  │ ▼ Psychological              │ │
│ │ │Name      ││  │ ▼ Emotional                  │ │
│ │ │Role      ││  │ ▼ Family                    │ │
│ │ │Delete    ││  │ ▼ Sociocultural              │ │
│ │ └─────────┘│  │ ▼ Core Beliefs               │ │
│ │ ...        │  │ ▼ Educational                │ │
│ │             │  │ ▼ Sociopolitics              │ │
│ │             │  │ ▼ SWOT                      │ │
│ │             │  │                                 │ │
│ └─────────────┘  └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Character List**: Orange-500
- **Character Detail**: Orange-400
- **4 Pose Images**: Orange-300
- **Accordion Sections**: Orange-500 (header), white (content)

### Key Components
1. **Character List Sidebar**: Scrollable list with character cards
2. **Character Detail Form**: Main form on the right
3. **4 Pose Image Generation**: 4 image upload/generate slots
4. **Accordion Sections**: Collapsible sections for each character aspect
5. **Progress Indicator**: Per-character completion

---

## Tab 4: Story Formula (Wand2 Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Story Formula + AI Generate + Save               │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Story Progress                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Thumbnail (Left)                                │    │
│ │ - Mood visual with hero background                 │    │
│ │ - Generate Mood Visual button                    │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Title Input                                      │    │
│ │ Premise Textarea                               │    │
│ │ Synopsis Textarea + Generate button               │    │
│ │ Global Synopsis Textarea                         │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Metadata Grid (2 columns)                       │    │
│ │ Duration | Format | Genre | Sub Genre         │    │
│ │ Tone | Theme                                  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Want/Need Matrix (12 columns)                  │    │
│ │ ┌──────────────────────────────────────────────┐  │    │
│ │ │ Want: External, Known, Specific, Achieved │  │    │
│ │ │ Need: Internal, Unknown, Universal, Achieved│  │    │
│ │ │ Ending Type: Happy/Tragic/Open           │  │    │
│ │ │ Generate from Protagonist button           │  │    │
│ │ └──────────────────────────────────────────────┘  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Story Structure                                 │    │
│ │ - Structure Select (Hero's Journey/Save Cat/    │    │
│ │   Dan Harmon Circle)                            │    │
│ │ - Dynamic Beat Table (based on structure)         │    │
│ │ - Beat Description Textarea per beat             │    │
│ │ - Key Actions Textarea per beat                 │    │
│ │ - Generate Structure button                       │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Actions                                        │    │
│ │ - Auto-Fill with AI button                      │    │
│ │ - Generate Script button                          │    │
│ │ - Save Story Bible button                         │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Generated Script Display (if available)            │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Thumbnail**: Orange-500
- **Story Info**: Orange-400
- **Metadata Grid**: Orange-300
- **Want/Need Matrix**: Orange-500
- **Story Structure**: Orange-400
- **Actions**: Orange-300

### Key Components
1. **Thumbnail**: Hero image with generate button
2. **Story Inputs**: Title, Premise, Synopsis, Global Synopsis
3. **Metadata Grid**: 2-column grid for metadata
4. **Want/Need Matrix**: 12-column grid for wants/needs
5. **Story Structure**: Dynamic beat table based on selected structure
6. **Action Buttons**: AI generate, script generate, save

---

## Tab 5: Universe Formula (Globe Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Universe Formula + AI Generate + Save            │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Universe Progress                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Universe Name Input                             │    │
│ │ Period Input                                     │    │
│ │ Era Input                                       │    │
│ │ Location Input                                   │    │
│ │ World Type Input                                 │    │
│ │ Technology Level Input                           │    │
│ │ Magic System Input                               │    │
│ │ Environment Textarea                            │    │
│ │ Society Textarea                                │    │
│ │ Private Life Textarea                           │    │
│ │ Government Textarea                             │    │
│ │ Economy Textarea                                │    │
│ │ Culture Textarea                                │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Clock Layout (Opposing Clockwise)                │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │         12 (Working Office)           │   │    │
│ │ │    11 (Rules of Work)   1 (Town)  │   │    │
│ │ │ 10 (Labor Law)      2 (Neighborhood)│   │    │
│ │ │ 9 (Country)                      │   │    │
│ │ │    8 (Environment)      3 (House)   │   │    │
│ │ │ 7 (Society)         4 (Room)     │   │    │
│ │ │ 6 (Private)                      │   │    │
│ │ │         5 (Sociopolitic)            │   │    │
│ │ │         Center: Universe Name + Period │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Clock Nodes**: Orange-500 (primary), Orange-400 (secondary), Orange-300 (tertiary)
- **Clock Lines**: Orange-200
- **Clock Numbers**: Gray-400
- **Center Circle**: Orange-100 with Orange-300 border

### Key Components
1. **Clock Layout**: Visual clock with 13 positioned nodes
2. **Interactive Nodes**: Click to expand and edit
3. **Smart Panel Positioning**: Panels appear in optimal direction
4. **Progress Indicators**: Per-node completion status
5. **Legend**: Color-coded legend at bottom

---

## Tab 6: Moodboard (LayoutTemplate Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Moodboard + AI Generate + Save                  │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Moodboard Progress                  │
├─────────────────────────────────────────────────────────────┤
│ Structure Select: Hero's Journey / Save Cat / Dan Harmon  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Story Structure Steps (based on structure)         │    │
│ │ ┌───────────────────────────────────────────────┐  │    │
│ │ │ Step 1: [Beat Name]                      │  │    │
│ │ │ ┌─────────────────────────────────────────┐   │  │    │
│ │ │ │ Beat Description Textarea            │   │  │    │
│ │ │ │ Key Actions Textarea               │   │  │    │
│ │ │ │ Character Images for Key Actions    │   │  │    │
│ │ │ │ ┌─────┬─────┬─────┬─────┐   │  │    │
│ │ │ │Char1 │Char2 │Char3 │Char4 │   │  │    │
│ │ │ └─────┴─────┴─────┴─────┘   │  │    │
│ │ │ │ Generate Prompt Button          │   │  │    │
│ │ │ │ Generate Image Button          │   │  │    │
│ │ │ │ Generated Image Display       │   │  │    │
│ │ │ └─────────────────────────────────┘   │  │    │
│ │ └───────────────────────────────────────────────┘  │    │
│ │                                                  │    │
│ │ Step 2: [Beat Name]                            │    │
│ │ ... (repeat for all steps)                         │    │
│ │                                                  │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Structure Select**: Orange-500
- **Story Steps**: Orange-400
- **Beat Cards**: Orange-300
- **Character Images**: Orange-200
- **Generated Images**: Orange-500

### Key Components
1. **Structure Select**: Dropdown for story structure type
2. **Story Steps**: Dynamic list based on selected structure
3. **Beat Cards**: Each beat has description, actions, character images
4. **Generate Buttons**: Prompt and Image generation
5. **Character Image Slots**: 4 slots per beat for character images

---

## Tab 7: Animate (Video Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Animate + AI Generate + Save                     │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Animation Progress                   │
├─────────────────────────────────────────────────────────────┤
│ Animation Style Select: 3D / Sketch / Vector /          │
│ Realistic / Anime                                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Story Structure Steps (based on structure)         │    │
│ │ ┌───────────────────────────────────────────────┐  │    │
│ │ │ Scene 1: [Scene Name]                    │  │    │
│ │ │ ┌─────────────────────────────────────────┐   │  │    │
│ │ │ │ Scene Description Textarea           │   │  │    │
│ │ │ │ Key Actions Textarea              │   │  │    │
│ │ │ │ Character Images for Key Actions  │   │  │    │
│ │ │ │ ┌─────┬─────┬─────┬─────┐   │  │    │
│ │ │ │Char1 │Char2 │Char3 │Char4 │   │  │    │
│ │ │ └─────┴─────┴─────┴─────┘   │  │    │
│ │ │ │ Generate Prompt Button          │   │  │    │
│ │ │ │ Generate Preview Button         │   │  │    │
│ │ │ │ Generated Preview Display     │   │  │    │
│ │ │ └─────────────────────────────────┘   │  │    │
│ │ │ [Move Up] [Move Down]               │  │    │
│ │ └───────────────────────────────────────────────┘  │    │
│ │                                                  │    │
│ │ Scene 2: [Scene Name]                            │    │
│ │ ... (repeat for all scenes)                           │    │
│ │                                                  │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Animation Style**: Orange-500
- **Story Steps**: Orange-400
- **Scene Cards**: Orange-300
- **Character Images**: Orange-200
- **Generated Previews**: Orange-500

### Key Components
1. **Animation Style Select**: Dropdown for animation type
2. **Story Steps**: Dynamic list based on selected structure
3. **Scene Cards**: Each scene has description, actions, character images
4. **Generate Buttons**: Prompt and Preview generation
5. **Move Controls**: Up/Down buttons for scene ordering
6. **Status Badges**: Pending, Generating, Complete

---

## Tab 8: Edit & Mix (Film Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Edit & Mix + AI Generate + Save                   │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall Edit & Mix Progress                 │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Canva Integration                                 │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │ Connect Canva Button                      │   │    │
│ │ │ Create Design Button                       │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │ Canva Designs List (if connected)       │   │    │
│ │ │ ┌─────────────────────────────────────┐   │   │    │
│ │ │ │ Design 1: [Thumbnail] [Name]   │   │    │
│ │ │ │ [Edit] [Delete]               │   │   │    │
│ │ │ └─────────────────────────────────────┘   │    │    │
│ │ │ Design 2: ...                          │   │    │
│ │ │ ...                                     │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Asset Library                                  │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │ Upload Asset Button                     │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │ Asset List                             │   │    │
│ │ │ ┌─────────────────────────────────┐   │   │    │
│ │ │ │ Asset 1: [Filename]         │   │   │    │
│ │ │ │ [Size] [Created] [Delete]   │   │   │    │
│ │ │ └─────────────────────────────────┘   │   │    │
│ │ │ Asset 2: ...                      │   │    │
│ │ │ ...                                 │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Mix Settings                                   │    │
│ │ - Mix Mode: [Select]                           │    │
│ │ - Blend Mode: [Select]                          │    │
│ │ - Opacity: [Slider]                             │    │
│ │ - Duration: [Input]                             │    │
│ │ - Quality: [Slider]                              │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Canva Integration**: Orange-500
- **Asset Library**: Orange-400
- **Mix Settings**: Orange-300

### Key Components
1. **Canva Integration**: Connect button, create design button, designs list
2. **Asset Library**: Upload button, asset list with thumbnails
3. **Mix Settings**: Mix mode, blend mode, opacity, duration, quality
4. **Asset Cards**: Filename, size, created date, delete button
5. **Design Cards**: Thumbnail, name, edit, delete buttons

---

## Tab 9: IP Bible (Book Icon)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: IP Bible + Export + Download                      │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar: Overall IP Bible Completion                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Export Options                                   │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │ Export Format: [PDF / DOCX / HTML]   │   │    │
│ │ │ Include Sections: ☑ IP Project       │   │    │
│ │ │                  ☑ Strategic Plan   │   │    │
│ │ │                  ☑ Character Formula│   │    │
│ │ │                  ☑ Story Formula    │   │    │
│ │ │                  ☑ Universe Formula │   │    │
│ │ │                  ☑ Moodboard       │   │    │
│ │ │                  ☑ Animate         │   │    │
│ │ │                  ☑ Edit & Mix      │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ │ Export Button                                  │   │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Generated Script Display (Full Page)             │    │
│ │ ┌─────────────────────────────────────────────┐   │    │
│ │ │ [Full Script Content Here...]           │   │    │
│ │ │                                         │   │    │
│ │ │                                         │   │    │
│ │ │                                         │   │    │
│ │ └─────────────────────────────────────────────┘   │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Download Button (if export completed)             │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
- **Export Options**: Orange-500
- **Generated Script**: Orange-400
- **Download Button**: Orange-300

### Key Components
1. **Export Options**: Format selector, section checkboxes
2. **Export Button**: Generate IP Bible document
3. **Generated Script Display**: Full-page script content
4. **Download Button**: Download generated document

---

## Common Components

### 1. Progress Bar
```tsx
<div className="flex items-center gap-3">
  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Progress</span>
  <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
  </div>
  <span className="text-xs text-orange-600 font-bold min-w-[35px] text-right">{progress}%</span>
</div>
```

### 2. Collapsible Section
```tsx
<div className="space-y-2">
  <button onClick={onToggle} className={`w-full justify-between p-3 rounded-lg ${color} hover:opacity-80 transition-opacity`}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-bold text-white">{title}</span>
    </div>
    {isOpen ? <ChevronDown className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-white" />}
  </button>
  {isOpen && <div className="p-4 rounded-lg bg-white border border-orange-200">{children}</div>}
</div>
```

### 3. Compact Input
```tsx
<div className="space-y-1">
  <label className={`text-[10px] uppercase tracking-wider font-medium ${labelColor}`}>{label}</label>
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`h-9 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabled} />
  {helperText && <p className={`text-[10px] ${helperColor}`}>{helperText}</p>}
</div>
```

### 4. Card Component
```tsx
<div className="bg-white rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
  <div className="p-4">
    {header && <h3 className="text-base font-semibold text-gray-900 mb-3">{header}</h3>}
    {children}
  </div>
</div>
```

### 5. Button Variants
```tsx
// Primary Button
<button className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  {icon && <span className="mr-2">{icon}</span>}
  {label}
</button>

// Secondary Button
<button className="bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  {icon && <span className="mr-2">{icon}</span>}
  {label}
</button>

// Ghost Button
<button className="bg-transparent text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  {icon && <span className="mr-2">{icon}</span>}
  {label}
</button>
```

---

## Responsive Design

### Desktop (> 1024px)
- Full layout with all columns visible
- Grid layouts: 3 columns for cards
- Side-by-side panels where appropriate

### Tablet (768px - 1024px)
- 2-column grid layouts
- Stacked panels where needed
- Adjusted padding

### Mobile (< 768px)
- Single column layout
- All panels stacked
- Full-width inputs
- Adjusted font sizes

---

## Accessibility

### Keyboard Navigation
- Tab key for form navigation
- Enter/Space for buttons
- Escape to close modals/panels

### Screen Readers
- ARIA labels on all interactive elements
- Semantic HTML structure
- Alt text on all images

### Focus States
- Visible focus ring on all interactive elements
- High contrast focus colors

---

## Animation & Transitions

### Smooth Transitions
- `transition-all duration-300` for color changes
- `transition-shadow duration-200` for hover effects
- `transition-colors duration-200` for buttons

### Loading States
- Spinner icon for loading
- Skeleton screens for content loading
- Progress bars for long operations

---

## Next Steps

1. Review and approve this UI design document
2. Create reusable UI components based on common patterns
3. Implement each tab following the layout structure
4. Test responsive behavior
5. Verify accessibility compliance
6. Polish animations and transitions
7. Deploy and monitor performance
