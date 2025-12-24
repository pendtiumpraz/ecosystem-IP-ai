# 📋 STRATEGIC PLAN UI/UX DESIGN
## IP Model Canvas - User-Friendly Implementation

**Date:** December 2025  
**Feature:** Strategic Plan Tab  
**Goal:** Create intuitive, user-friendly IP Business Model Canvas interface

---

# 📊 CURRENT ISSUES

## Problems with Current Implementation

| Issue | Severity | Impact |
|--------|-----------|---------|
| **No Visual Layout** | High | Canvas doesn't look like a business model canvas |
| **No Connection Lines** | High | Users can't see relationships between sections |
| **No Color Coding** | Medium | All sections look the same, hard to scan |
| **No Drag & Drop** | Medium | Can't rearrange sections |
| **No Export Options** | Medium | Can't download or share canvas |
| **No Templates** | High | Users start from blank every time |
| **No AI Suggestions** | High | No guidance on what to fill in |
| **No Validation** | Medium | Can't tell if canvas is complete |
| **Poor Mobile Experience** | High | Canvas doesn't work on mobile |
| **No Collaboration** | Medium | Can't work with team |

---

# 🎯 DESIGN SOLUTIONS

## 1. Visual Canvas Layout

### 1.1 Traditional Business Model Canvas Layout

```tsx
// Create visual canvas with 9 sections in grid layout
<div className="strategic-plan-canvas">
  <div className="canvas-header">
    <h2>IP Business Model Canvas</h2>
    <div className="canvas-actions">
      <Button variant="outline" size="sm" onClick={saveCanvas}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={exportCanvas}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={shareCanvas}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={loadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Load Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={clearCanvas}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Canvas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={printCanvas}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
  
  {/* Canvas Grid */}
  <div className="canvas-grid">
    {/* Left Column */}
    <div className="canvas-column left">
      <div className="canvas-section" data-section="key-partners">
        <div className="section-header">
          <Users className="h-5 w-5 text-blue-500" />
          <h3>Key Partners</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.keyPartners.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="Who are your key partners?&#10;• Distributors&#10;• Platforms&#10;• Production companies..."
          value={strategyData.keyPartners}
          onChange={(e) => updateSection('keyPartners', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('keyPartners')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
      
      <div className="canvas-section" data-section="key-activities">
        <div className="section-header">
          <Zap className="h-5 w-5 text-orange-500" />
          <h3>Key Activities</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.keyActivities.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="What are your key activities?&#10;• Content creation&#10;• Marketing&#10;• Distribution..."
          value={strategyData.keyActivities}
          onChange={(e) => updateSection('keyActivities', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('keyActivities')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
      
      <div className="canvas-section" data-section="key-creator">
        <div className="section-header">
          <User className="h-5 w-5 text-purple-500" />
          <h3>Key Creator/Owner</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.keyCreator.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="Who is creating this IP?&#10;• Studio name&#10;• Creators&#10;• IP owner..."
          value={strategyData.keyCreator}
          onChange={(e) => updateSection('keyCreator', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('keyCreator')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
    </div>
    
    {/* Center Column */}
    <div className="canvas-column center">
      <div className="canvas-section" data-section="licensable-values">
        <div className="section-header">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3>Licensable & Unique Values</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.licensableValues.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="What makes your IP unique and licensable?&#10;• Characters&#10;• Story&#10;• Visual style..."
          value={strategyData.licensableValues}
          onChange={(e) => updateSection('licensableValues', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('licensableValues')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
      
      <div className="canvas-section" data-section="ip-foundation">
        <div className="section-header">
          <Building2 className="h-5 w-5 text-red-500" />
          <h3>IP Foundation</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.ipFoundation.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="What are the core elements of your IP?&#10;• Story&#10;• Characters&#10;• Universe..."
          value={strategyData.ipFoundation}
          onChange={(e) => updateSection('ipFoundation', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('ipFoundation')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
      
      <div className="canvas-section" data-section="derivatives-product">
        <div className="section-header">
          <Package className="h-5 w-5 text-indigo-500" />
          <h3>Derivatives Product</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.derivativesProduct.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="What derivative products can be created?&#10;• Merchandise&#10;• Games&#10;• Toys..."
          value={strategyData.derivativesProduct}
          onChange={(e) => updateSection('derivativesProduct', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('derivativesProduct')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
    </div>
    
    {/* Right Column */}
    <div className="canvas-column right">
      <div className="canvas-section" data-section="segmentation">
        <div className="section-header">
          <Target className="h-5 w-5 text-green-500" />
          <h3>Segmentation</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.segmentation.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="Who is your target audience?&#10;• Age groups&#10;• Interests&#10;• Geography..."
          value={strategyData.segmentation}
          onChange={(e) => updateSection('segmentation', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('segmentation')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
      
      <div className="canvas-section" data-section="brand-positioning">
        <div className="section-header">
          <BadgePercent className="h-5 w-5 text-pink-500" />
          <h3>Brand Positioning</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.brandPositioning.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="What is your brand positioning?&#10;• Market position&#10;• Brand personality&#10;• Differentiation..."
          value={strategyData.brandPositioning}
          onChange={(e) => updateSection('brandPositioning', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('brandPositioning')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
      
      <div className="canvas-section" data-section="core-medium">
        <div className="section-header">
          <Monitor className="h-5 w-5 text-cyan-500" />
          <h3>Core Medium</h3>
          <Badge variant="outline" className="section-count">
            {strategyData.coreMedium.split('\n').filter(Boolean).length}
          </Badge>
        </div>
        <Textarea
          className="section-content"
          placeholder="What is your primary format?&#10;• Series&#10;• Film&#10;• Game..."
          value={strategyData.coreMedium}
          onChange={(e) => updateSection('coreMedium', e.target.value)}
        />
        <div className="section-footer">
          <Button variant="ghost" size="sm" onClick={() => generateSection('coreMedium')}>
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </div>
    </div>
  </div>
  
  {/* Bottom Section */}
  <div className="canvas-bottom">
    <div className="canvas-section" data-section="cost-structure">
      <div className="section-header">
        <DollarSign className="h-5 w-5 text-gray-500" />
        <h3>Cost Structure</h3>
        <Badge variant="outline" className="section-count">
          {strategyData.costStructure.split('\n').filter(Boolean).length}
        </Badge>
      </div>
      <Textarea
        className="section-content"
        placeholder="What are your main costs?&#10;• Production&#10;• Marketing&#10;• Distribution..."
        value={strategyData.costStructure}
        onChange={(e) => updateSection('costStructure', e.target.value)}
      />
      <div className="section-footer">
        <Button variant="ghost" size="sm" onClick={() => generateSection('costStructure')}>
          <Wand2 className="h-4 w-4 mr-1" />
          AI Generate
        </Button>
      </div>
    </div>
    
    <div className="canvas-section" data-section="revenue-streams">
      <div className="section-header">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h3>Revenue Streams</h3>
        <Badge variant="outline" className="section-count">
          {strategyData.revenueStreams.split('\n').filter(Boolean).length}
        </Badge>
      </div>
      <Textarea
        className="section-content"
        placeholder="How can this IP generate revenue?&#10;• Licensing&#10;• Merchandise&#10;• Streaming..."
        value={strategyData.revenueStreams}
        onChange={(e) => updateSection('revenueStreams', e.target.value)}
      />
      <div className="section-footer">
        <Button variant="ghost" size="sm" onClick={() => generateSection('revenueStreams')}>
          <Wand2 className="h-4 w-4 mr-1" />
          AI Generate
        </Button>
      </div>
    </div>
  </div>
</div>

// CSS for canvas layout
.strategic-plan-canvas {
  @apply bg-gray-50 min-h-screen;
}

.canvas-header {
  @apply bg-white border-b border-gray-200 p-6;
}

.canvas-header h2 {
  @apply text-2xl font-bold text-gray-900;
}

.canvas-actions {
  @apply flex items-center gap-2 mt-4;
}

.canvas-grid {
  @apply p-6 grid gap-4;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, auto) 1fr;
}

.canvas-column {
  @apply flex flex-col gap-4;
}

.canvas-column.center {
  @apply col-start-2;
}

.canvas-section {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm 
         overflow-hidden transition-shadow hover:shadow-md;
}

.section-header {
  @apply flex items-center gap-3 p-4 border-b border-gray-100 
         bg-gradient-to-r from-gray-50 to-white;
}

.section-header h3 {
  @apply font-semibold text-gray-900 flex-1;
}

.section-count {
  @apply text-xs;
}

.section-content {
  @apply min-h-[150px] p-4 resize-none border-0 
         focus:ring-0 text-gray-700;
}

.section-footer {
  @apply p-3 border-t border-gray-100 flex justify-end;
}

.canvas-bottom {
  @apply col-span-3 grid grid-cols-2 gap-4 mt-4;
}
```

### 1.2 Connection Lines

```tsx
// Add visual connections between related sections
<div className="canvas-with-connections">
  <svg className="connections-layer">
    {/* Key Partners → Key Activities */}
    <path 
      d="M 100 100 L 200 100" 
      className="connection-line"
      markerEnd="url(#arrowhead)"
    />
    {/* Key Activities → IP Foundation */}
    <path 
      d="M 200 150 L 200 250" 
      className="connection-line"
      markerEnd="url(#arrowhead)"
    />
    {/* More connections */}
    <defs>
      <marker 
        id="arrowhead" 
        markerWidth="10" 
        markerHeight="7" 
        refX="9" 
        refY="3.5" 
        orient="auto"
      >
        <polygon 
          points="0 0, 10 3.5, 0 7" 
          fill="#94a3b8"
        />
      </marker>
    </defs>
  </svg>
  
  {/* Canvas content */}
  <div className="canvas-content">
    {/* Sections */}
  </div>
</div>

// CSS for connections
.connections-layer {
  @apply absolute inset-0 pointer-events-none z-0;
}

.connection-line {
  @apply stroke-blue-500/30 stroke-2 fill-none;
}

.canvas-content {
  @apply relative z-10;
}
```

---

## 2. AI Generation Features

### 2.1 Smart Suggestions

```tsx
// Add AI suggestions for each section
<div className="section-with-suggestions">
  <div className="section-header">
    <h3>Key Partners</h3>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setShowSuggestions(!showSuggestions)}
    >
      <Lightbulb className="h-4 w-4 mr-1" />
      Suggestions
    </Button>
  </div>
  
  <Textarea
    className="section-content"
    placeholder="Enter your key partners..."
    value={strategyData.keyPartners}
    onChange={(e) => updateSection('keyPartners', e.target.value)}
  />
  
  {showSuggestions && (
    <div className="suggestions-panel">
      <div className="suggestions-header">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4>AI Suggestions</h4>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowSuggestions(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="suggestions-list">
        {suggestions.map((suggestion, i) => (
          <div key={i} className="suggestion-item">
            <div className="suggestion-content">
              <p className="suggestion-text">{suggestion.text}</p>
              <div className="suggestion-meta">
                <Badge variant="outline">{suggestion.category}</Badge>
                <span className="suggestion-confidence">
                  {suggestion.confidence}% match
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applySuggestion(suggestion)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        ))}
      </div>
      <div className="suggestions-footer">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={generateMoreSuggestions}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate More
        </Button>
      </div>
    </div>
  )}
</div>

// Suggestions based on project context
const suggestions = [
  {
    text: 'Netflix - Global streaming platform',
    category: 'Distributor',
    confidence: 95,
  },
  {
    text: 'Disney+ - Family-friendly streaming',
    category: 'Distributor',
    confidence: 88,
  },
  {
    text: 'Toei Animation - Production partner',
    category: 'Production',
    confidence: 82,
  },
];

// CSS
.suggestions-panel {
  @apply bg-white border border-gray-200 rounded-lg shadow-xl 
         mt-4 overflow-hidden;
}

.suggestions-header {
  @apply flex items-center gap-2 p-4 border-b border-gray-100 
         bg-gradient-to-r from-blue-50 to-white;
}

.suggestions-header h4 {
  @apply font-semibold flex-1;
}

.suggestions-list {
  @apply max-h-[300px] overflow-y-auto;
}

.suggestion-item {
  @apply flex items-start gap-3 p-4 hover:bg-gray-50 
         transition-colors border-b border-gray-100 last:border-0;
}

.suggestion-content {
  @apply flex-1;
}

.suggestion-text {
  @apply text-sm text-gray-700 mb-2;
}

.suggestion-meta {
  @apply flex items-center gap-2;
}

.suggestion-confidence {
  @apply text-xs text-gray-500;
}

.suggestions-footer {
  @apply p-4 border-t border-gray-100;
}
```

### 2.2 Generate All with Progress

```tsx
// Add generate all button with progress tracking
<div className="generate-all-section">
  <div className="generate-header">
    <div className="generate-icon">
      <Sparkles className="h-8 w-8 text-primary" />
    </div>
    <div className="generate-content">
      <h3>Generate Complete Canvas</h3>
      <p className="generate-description">
        AI will fill in all 9 sections based on your story, characters, and universe
      </p>
    </div>
    <Button 
      onClick={handleGenerateAll}
      disabled={isGenerating || !hasRequiredData()}
      className="generate-button"
    >
      {isGenerating ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          Generating...
        </div>
      ) : (
        <>
          <Wand2 className="h-4 w-4 mr-2" />
          Generate All
        </>
      )}
    </Button>
  </div>
  
  {isGenerating && (
    <div className="generation-progress">
      <div className="progress-header">
        <span className="progress-label">Generating sections...</span>
        <span className="progress-count">
          {completedSections}/{totalSections}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(completedSections / totalSections) * 100}%` }}
        />
      </div>
      <div className="progress-steps">
        {GENERATION_STEPS.map((step, i) => (
          <div 
            key={step.id}
            className={`progress-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
          >
            <div className="step-icon">
              {step.completed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : step.current ? (
                <div className="animate-pulse">
                  <Circle className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <Circle className="h-4 w-4 text-gray-300" />
              )}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

// Generation steps
const GENERATION_STEPS = [
  { id: 'key-partners', label: 'Key Partners', completed: false, current: false },
  { id: 'key-activities', label: 'Key Activities', completed: false, current: false },
  { id: 'key-creator', label: 'Key Creator', completed: false, current: false },
  { id: 'licensable-values', label: 'Licensable Values', completed: false, current: false },
  { id: 'ip-foundation', label: 'IP Foundation', completed: false, current: false },
  { id: 'derivatives-product', label: 'Derivatives', completed: false, current: false },
  { id: 'segmentation', label: 'Segmentation', completed: false, current: false },
  { id: 'brand-positioning', label: 'Brand Positioning', completed: false, current: false },
  { id: 'core-medium', label: 'Core Medium', completed: false, current: false },
  { id: 'cost-structure', label: 'Cost Structure', completed: false, current: false },
  { id: 'revenue-streams', label: 'Revenue Streams', completed: false, current: false },
];

// CSS
.generate-all-section {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm 
         p-6 mb-6;
}

.generate-header {
  @apply flex items-center gap-4;
}

.generate-icon {
  @apply p-3 bg-primary/10 rounded-lg;
}

.generate-content h3 {
  @apply font-semibold text-gray-900 mb-1;
}

.generate-description {
  @apply text-sm text-gray-600;
}

.generation-progress {
  @apply mt-6 space-y-4;
}

.progress-header {
  @apply flex items-center justify-between text-sm;
}

.progress-label {
  @apply text-gray-600;
}

.progress-count {
  @apply font-semibold text-primary;
}

.progress-bar {
  @apply h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-primary transition-all duration-500;
}

.progress-steps {
  @apply grid grid-cols-3 gap-2;
}

.progress-step {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.progress-step.completed {
  @apply text-green-600;
}

.progress-step.current {
  @apply text-primary font-medium;
}

.step-icon {
  @apply flex-shrink-0;
}

.step-label {
  @apply truncate;
}
```

---

## 3. Templates & Presets

### 3.1 Template Gallery

```tsx
// Add template gallery for quick start
<div className="template-gallery">
  <div className="gallery-header">
    <h3>Start with a Template</h3>
    <p className="gallery-description">
      Choose a template to get started quickly
    </p>
  </div>
  
  <div className="template-grid">
    {TEMPLATES.map(template => (
      <div 
        key={template.id}
        className="template-card"
        onClick={() => loadTemplate(template.id)}
      >
        <div className="template-preview">
          <template.icon className="h-8 w-8 text-primary" />
        </div>
        <div className="template-content">
          <h4 className="template-name">{template.name}</h4>
          <p className="template-description">{template.description}</p>
          <div className="template-tags">
            {template.tags.map(tag => (
              <Badge key={tag} variant="outline" className="template-tag">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="template-button"
        >
          Use Template
        </Button>
      </div>
    ))}
  </div>
</div>

// Templates
const TEMPLATES = [
  {
    id: 'animation-series',
    name: 'Animation Series',
    description: 'Perfect for animated TV series with merchandising potential',
    icon: MonitorPlay,
    tags: ['Animation', 'TV', 'Merch'],
    data: {
      keyPartners: '• Streaming platforms\n• Animation studios\n• Merchandise manufacturers',
      keyActivities: '• Animation production\n• Content marketing\n• Brand management',
      keyCreator: '• Animation studio\n• IP creator',
      licensableValues: '• Character designs\n• Story world\n• Visual style',
      ipFoundation: '• Story bible\n• Character profiles\n• Universe guide',
      derivativesProduct: '• Toys\n• Clothing\n• Games\n• Books',
      segmentation: '• Kids 6-12\n• Families\n• Animation fans',
      brandPositioning: '• Fun and adventurous\n• Family-friendly\n• Educational',
      coreMedium: '• Animated TV series\n• 52 episodes/season\n• 22 min/episode',
      costStructure: '• Animation production\n• Voice acting\n• Marketing',
      revenueStreams: '• Streaming licensing\n• Merchandise sales\n• International sales',
    },
  },
  {
    id: 'webtoon',
    name: 'Webtoon',
    description: 'Ideal for web-based comics with global reach',
    icon: BookOpen,
    tags: ['Webtoon', 'Digital', 'Global'],
    data: { /* ... */ },
  },
  {
    id: 'game-franchise',
    name: 'Game Franchise',
    description: 'For IPs that start as games and expand to other media',
    icon: Gamepad2,
    tags: ['Gaming', 'Multi-platform', 'Franchise'],
    data: { /* ... */ },
  },
  {
    id: 'live-action-series',
    name: 'Live Action Series',
    description: 'For live-action TV series with streaming distribution',
    icon: Clapperboard,
    tags: ['Live Action', 'TV', 'Streaming'],
    data: { /* ... */ },
  },
];

// CSS
.template-gallery {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm 
         p-6 mb-6;
}

.gallery-header h3 {
  @apply font-semibold text-gray-900 mb-1;
}

.gallery-description {
  @apply text-sm text-gray-600;
}

.template-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4;
}

.template-card {
  @apply bg-gray-50 border border-gray-200 rounded-lg p-4 
         cursor-pointer hover:border-primary hover:shadow-md transition-all;
}

.template-preview {
  @apply p-3 bg-white rounded-lg mb-3;
}

.template-content h4 {
  @apply font-semibold text-gray-900 mb-1;
}

.template-description {
  @apply text-sm text-gray-600 mb-3;
}

.template-tags {
  @apply flex flex-wrap gap-1;
}

.template-tag {
  @apply text-xs;
}

.template-button {
  @apply w-full mt-3;
}
```

### 3.2 Custom Template Creation

```tsx
// Allow users to save their own templates
<div className="template-actions">
  <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Save className="h-4 w-4 mr-2" />
        Save as Template
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save as Template</DialogTitle>
        <DialogDescription>
          Save your current canvas as a reusable template
        </DialogDescription>
      </DialogHeader>
      <div className="template-form">
        <div className="form-field">
          <Label>Template Name</Label>
          <Input 
            placeholder="My Animation Series Template"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <Label>Description</Label>
          <Textarea 
            placeholder="Describe when to use this template..."
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
          />
        </div>
        <div className="form-field">
          <Label>Tags</Label>
          <Input 
            placeholder="animation, tv, kids"
            value={templateTags}
            onChange={(e) => setTemplateTags(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
          Cancel
        </Button>
        <Button onClick={saveTemplate}>
          Save Template
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <FolderOpen className="h-4 w-4 mr-2" />
        Load Template
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {savedTemplates.map(template => (
        <DropdownMenuItem key={template.id} onClick={() => loadTemplate(template.id)}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="template-info">
            <span className="template-name">{template.name}</span>
            <span className="template-date">
              {new Date(template.createdAt).toLocaleDateString()}
            </span>
          </div>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={manageTemplates}>
        <Settings className="h-4 w-4 mr-2" />
        Manage Templates
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

---

## 4. Validation & Completion

### 4.1 Real-time Validation

```tsx
// Add validation indicators for each section
<div className="section-with-validation">
  <div className="section-header">
    <h3>Key Partners</h3>
    <div className="validation-indicator">
      {validation.keyPartners.status === 'complete' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>This section is complete</p>
          </TooltipContent>
        </Tooltip>
      )}
      {validation.keyPartners.status === 'partial' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Add more details to complete this section</p>
          </TooltipContent>
        </Tooltip>
      )}
      {validation.keyPartners.status === 'empty' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <XCircle className="h-5 w-5 text-gray-300" />
          </TooltipTrigger>
          <TooltipContent>
            <p>This section is empty</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  </div>
  
  <Textarea
    className={`section-content ${validation.keyPartners.status === 'error' ? 'error' : ''}`}
    placeholder="Enter your key partners..."
    value={strategyData.keyPartners}
    onChange={(e) => updateSection('keyPartners', e.target.value)}
  />
  
  {validation.keyPartners.status === 'partial' && (
    <div className="validation-message">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <span>{validation.keyPartners.message}</span>
    </div>
  )}
</div>

// Validation logic
const validation = useMemo(() => {
  const sections = {
    keyPartners: {
      status: getSectionStatus(strategyData.keyPartners, 3),
      message: 'Add at least 3 key partners for a complete canvas',
    },
    keyActivities: {
      status: getSectionStatus(strategyData.keyActivities, 3),
      message: 'Add at least 3 key activities',
    },
    // ... more sections
  };
  
  return sections;
}, [strategyData]);

function getSectionStatus(value: string, minItems: number): 'complete' | 'partial' | 'empty' {
  const items = value.split('\n').filter(Boolean);
  
  if (items.length === 0) return 'empty';
  if (items.length >= minItems) return 'complete';
  return 'partial';
}

// CSS
.validation-indicator {
  @apply flex-shrink-0;
}

.validation-message {
  @apply flex items-center gap-2 p-3 bg-amber-50 
         text-amber-700 rounded-lg mt-2 text-sm;
}

.section-content.error {
  @apply border-red-300 focus:border-red-500;
}
```

### 4.2 Completion Progress

```tsx
// Add overall completion progress
<div className="canvas-completion">
  <div className="completion-header">
    <div className="completion-icon">
      {completionPercentage === 100 ? (
        <CheckCircle className="h-8 w-8 text-green-500" />
      ) : (
        <div className="progress-ring">
          <svg className="progress-svg" viewBox="0 0 36 36">
            <path
              className="progress-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="progress-fill"
              strokeDasharray={`${completionPercentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <span className="progress-text">
            {completionPercentage}%
          </span>
        </div>
      )}
    </div>
    <div className="completion-content">
      <h3>Canvas Completion</h3>
      <p className="completion-message">
        {completionPercentage === 100 
          ? 'Your canvas is complete! Ready for export.'
          : `Complete ${completedSections} of ${totalSections} sections`
        }
      </p>
    </div>
    {completionPercentage === 100 && (
      <Button onClick={exportCanvas}>
        <Download className="h-4 w-4 mr-2" />
        Export Canvas
      </Button>
    )}
  </div>
  
  <div className="completion-details">
    {sections.map(section => (
      <div 
        key={section.id}
        className={`completion-item ${section.status}`}
      >
        <div className="item-icon">
          {section.status === 'complete' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {section.status === 'partial' && (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
          {section.status === 'empty' && (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
        </div>
        <span className="item-label">{section.label}</span>
        <span className="item-status">
          {section.status === 'complete' && 'Complete'}
          {section.status === 'partial' && 'In Progress'}
          {section.status === 'empty' && 'Empty'}
        </span>
      </div>
    ))}
  </div>
</div>

// CSS
.canvas-completion {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm 
         p-6 mb-6;
}

.completion-header {
  @apply flex items-center gap-4 mb-6;
}

.completion-icon {
  @apply flex-shrink-0;
}

.progress-ring {
  @apply relative w-20 h-20;
}

.progress-svg {
  @apply w-full h-full -rotate-90;
}

.progress-bg {
  @apply text-gray-200;
}

.progress-fill {
  @apply text-primary transition-all duration-500;
}

.progress-text {
  @apply absolute inset-0 flex items-center justify-center 
         text-sm font-semibold;
}

.completion-content h3 {
  @apply font-semibold text-gray-900 mb-1;
}

.completion-message {
  @apply text-sm text-gray-600;
}

.completion-details {
  @apply grid grid-cols-2 md:grid-cols-3 gap-2;
}

.completion-item {
  @apply flex items-center gap-2 p-3 rounded-lg 
         bg-gray-50 text-sm;
}

.completion-item.complete {
  @apply bg-green-50 text-green-700;
}

.completion-item.partial {
  @apply bg-amber-50 text-amber-700;
}

.completion-item.empty {
  @apply bg-gray-100 text-gray-500;
}

.item-status {
  @apply ml-auto text-xs font-medium;
}
```

---

## 5. Export & Share

### 5.1 Export Options

```tsx
// Add multiple export options
<Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Export Canvas</DialogTitle>
      <DialogDescription>
        Choose your preferred export format
      </DialogDescription>
    </DialogHeader>
    <div className="export-options">
      {EXPORT_FORMATS.map(format => (
        <div 
          key={format.id}
          className={`export-option ${selectedFormat === format.id ? 'selected' : ''}`}
          onClick={() => setSelectedFormat(format.id)}
        >
          <div className="option-icon">
            <format.icon className="h-6 w-6" />
          </div>
          <div className="option-content">
            <h4 className="option-name">{format.name}</h4>
            <p className="option-description">{format.description}</p>
          </div>
          {selectedFormat === format.id && (
            <CheckCircle className="h-5 w-5 text-primary" />
          )}
        </div>
      ))}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowExportDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleExport}>
        Export {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.name}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Export formats
const EXPORT_FORMATS = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'High-quality PDF for printing and sharing',
    icon: FileText,
  },
  {
    id: 'png',
    name: 'PNG Image',
    description: 'Visual image of the canvas',
    icon: Image,
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Raw data for developers',
    icon: Code,
  },
  {
    id: 'csv',
    name: 'CSV Spreadsheet',
    description: 'Spreadsheet-compatible format',
    icon: Table,
  },
];

// CSS
.export-options {
  @apply space-y-2;
}

.export-option {
  @apply flex items-center gap-3 p-4 border border-gray-200 
         rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 
         transition-all;
}

.export-option.selected {
  @apply border-primary bg-primary/10;
}

.option-icon {
  @apply p-2 bg-white rounded-lg;
}

.option-content h4 {
  @apply font-semibold text-gray-900 mb-1;
}

.option-description {
  @apply text-sm text-gray-600;
}
```

### 5.2 Share Options

```tsx
// Add sharing functionality
<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Share Canvas</DialogTitle>
      <DialogDescription>
        Share your canvas with team members or collaborators
      </DialogDescription>
    </DialogHeader>
    <div className="share-options">
      <Tabs defaultValue="link">
        <TabsList className="share-tabs">
          <TabsTrigger value="link">
            <Link className="h-4 w-4 mr-2" />
            Share Link
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="link">
          <div className="share-link-section">
            <div className="link-display">
              <Input 
                value={shareLink}
                readOnly
                className="link-input"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyLink}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="link-settings">
              <div className="setting-item">
                <Label>Link Expiry</Label>
                <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="setting-item">
                <Label>Permissions</Label>
                <Select value={linkPermission} onValueChange={setLinkPermission}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="comment">Can Comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="email">
          <div className="email-section">
            <div className="form-field">
              <Label>Recipient Emails</Label>
              <Textarea 
                placeholder="email1@example.com, email2@example.com"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
              />
            </div>
            <div className="form-field">
              <Label>Message</Label>
              <Textarea 
                placeholder="Add a personal message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="team">
          <div className="team-section">
            <div className="form-field">
              <Label>Team Members</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.name.charAt(0)}
                        </div>
                        <div className="member-details">
                          <span className="member-name">{member.name}</span>
                          <span className="member-role">{member.role}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label>Permission Level</Label>
              <Select value={teamPermission} onValueChange={setTeamPermission}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowShareDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleShare}>
        Share
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// CSS
.share-options {
  @apply min-h-[400px];
}

.share-link-section {
  @apply space-y-4;
}

.link-display {
  @apply flex gap-2;
}

.link-input {
  @apply flex-1;
}

.link-settings {
  @apply space-y-4 mt-4;
}

.setting-item {
  @apply space-y-2;
}

.email-section,
.team-section {
  @apply space-y-4;
}

.member-info {
  @apply flex items-center gap-3;
}

.member-avatar {
  @apply w-8 h-8 rounded-full bg-primary text-white 
         flex items-center justify-center font-semibold;
}

.member-details {
  @apply flex flex-col;
}

.member-name {
  @apply font-medium text-gray-900;
}

.member-role {
  @apply text-sm text-gray-600;
}
```

---

# 📋 IMPLEMENTATION CHECKLIST

## Phase 1: Visual Canvas Layout
- [ ] Create 9-section grid layout
- [ ] Add section headers with icons
- [ ] Implement color-coded sections
- [ ] Add item count badges
- [ ] Add connection lines between sections

## Phase 2: AI Generation Features
- [ ] Add AI suggestions for each section
- [ ] Implement generate all with progress
- [ ] Add suggestion confidence indicators
- [ ] Implement section-wise AI generation

## Phase 3: Templates & Presets
- [ ] Create template gallery
- [ ] Add 4-6 preset templates
- [ ] Implement custom template creation
- [ ] Add template management dialog

## Phase 4: Validation & Completion
- [ ] Add real-time validation
- [ ] Implement completion progress ring
- [ ] Add section status indicators
- [ ] Add validation messages

## Phase 5: Export & Share
- [ ] Add export dialog with multiple formats
- [ ] Implement PDF export
- [ ] Implement PNG export
- [ ] Add share dialog
- [ ] Implement share link generation
- [ ] Add email sharing
- [ ] Add team member sharing

---

# 📅 DOCUMENT INFO

**Created:** December 2025  
**Version:** 1.0  
**Feature:** Strategic Plan - IP Business Model Canvas  
**Author:** Architecture Analysis  
**Status:** Ready for Implementation
