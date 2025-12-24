import jsPDF from 'jspdf';

export interface IPBibleData {
  title: string;
  studioName?: string;
  ipOwner?: string;
  story?: {
    genre?: string;
    subGenre?: string;
    format?: string;
    duration?: string;
    tone?: string;
    theme?: string;
    conflict?: string;
    targetAudience?: string;
    endingType?: string;
    premise?: string;
    synopsis?: string;
    globalSynopsis?: string;
    structure?: string;
    structureBeats?: Record<string, string>;
  };
  characters?: Array<{
    name: string;
    role: string;
    age?: string;
    physiological?: {
      gender?: string;
    };
    psychological?: {
      archetype?: string;
      wants?: string;
      needs?: string;
      fears?: string;
    };
  }>;
  universe?: {
    name?: string;
    period?: string;
    era?: string;
    location?: string;
    environment?: string;
  };
  universeFormula?: {
    workingOfficeSchool?: string;
    townDistrictCity?: string;
    neighborhoodEnvironment?: string;
    rulesOfWork?: string;
    laborLaw?: string;
    country?: string;
    governmentSystem?: string;
    universeName?: string;
    period?: string;
    environmentLandscape?: string;
    societyAndSystem?: string;
    privateInterior?: string;
    sociopoliticEconomy?: string;
    socioculturalSystem?: string;
    houseCastle?: string;
    roomCave?: string;
    familyInnerCircle?: string;
    kingdomTribeCommunal?: string;
  };
  strategicPlan?: {
    customerSegments?: string;
    valuePropositions?: string;
    channels?: string;
    customerRelationships?: string;
    revenueStreams?: string;
    keyResources?: string;
    keyActivities?: string;
    keyPartnerships?: string;
    costStructure?: string;
    cast?: string;
    director?: string;
    producer?: string;
    executiveProducer?: string;
    distributor?: string;
    publisher?: string;
    titleBrandPositioning?: string;
    themeStated?: string;
    uniqueSelling?: string;
    storyValues?: string;
    fansLoyalty?: string;
    productionBudget?: string;
    promotionBudget?: string;
    socialMediaEngagements?: string;
    teaserTrailerEngagements?: string;
    genre?: string;
  };
  moodboardImages?: Record<string, string>;
  animationVideos?: Record<string, { url: string; duration?: number; provider?: string }>;
  projectTeam?: Array<{
    name: string;
    role: string;
    email?: string;
    responsibilities?: string;
    expertise?: string;
  }>;
  materials?: Array<{
    name: string;
    description?: string;
    type: string;
    fileUrl?: string;
    category?: string;
    tags?: string[];
  }>;
}

export async function generateIPBiblePDF(data: IPBibleData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentPage = 1;
  
  // Helper function to check and add new page if needed
  const checkNewPage = (y: number, neededSpace: number = 20) => {
    if (y + neededSpace > pageHeight - margin) {
      pdf.addPage();
      currentPage++;
      return margin;
    }
    return y;
  };
  
  // Helper function to add section header
  const addSectionHeader = (y: number, title: string, sectionNumber?: number) => {
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, y, contentWidth, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const headerText = sectionNumber ? `${sectionNumber}. ${title}` : title;
    pdf.text(headerText, margin + 5, y + 7);
    return y + 15;
  };
  
  // Helper function to add text with word wrap
  const addWrappedText = (text: string, y: number, fontSize: number = 10, maxWidth: number = contentWidth) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const lines = pdf.splitTextToSize(text || 'N/A', maxWidth);
    lines.forEach((line: string) => {
      y = checkNewPage(y, 5);
      pdf.text(line, margin, y);
      y += 5;
    });
    return y + 5;
  };
  
  // Cover Page
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title || "Untitled IP", pageWidth / 2, 100, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text("IP Bible & Documentation", pageWidth / 2, 120, { align: 'center' });
  pdf.text(`Version 1.0 | ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 135, { align: 'center' });
  
  if (data.studioName) {
    pdf.text(`Created by ${data.studioName}`, pageWidth / 2, 155, { align: 'center' });
  }
  if (data.ipOwner) {
    pdf.text(`IP Owner: ${data.ipOwner}`, pageWidth / 2, 170, { align: 'center' });
  }
  
  // Table of Contents
  pdf.addPage();
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Table of Contents", margin, margin);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  let tocY = margin + 20;
  const tocItems = [
    "1. Project Overview",
    "2. Story Formula",
    "3. Story Structure",
    "4. Character Profiles",
    "5. Universe & World-Building",
    "6. Universe Formula",
    "7. Strategic Plan",
    "8. Visual Development",
    "9. Project Team",
    "10. Pre-existing Materials",
  ];
  
  tocItems.forEach((item, i) => {
    pdf.text(`${i + 1}. ${item}`, margin, tocY);
    tocY += 10;
  });
  
  let y = margin;
  
  // Section 1: Project Overview
  pdf.addPage();
  y = addSectionHeader(y, "Project Overview", 1);
  
  const overviewData = [
    { label: "Genre", value: data.story?.genre || "-" },
    { label: "Format", value: data.story?.format || "-" },
    { label: "Duration", value: data.story?.duration || "-" },
    { label: "Tone", value: data.story?.tone || "-" },
    { label: "Theme", value: data.story?.theme || "-" },
    { label: "Target Audience", value: data.story?.targetAudience || "-" },
    { label: "Ending Type", value: data.story?.endingType || "-" },
  ];
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  overviewData.forEach((item, i) => {
    y = checkNewPage(y, 10);
    pdf.text(`${item.label}:`, margin, y);
    pdf.text(item.value, margin + 60, y);
    y += 10;
  });
  
  // Section 2: Story Formula
  pdf.addPage();
  y = addSectionHeader(y, "Story Formula", 2);
  
  if (data.story?.premise) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Premise:", margin, y);
    y += 8;
    y = addWrappedText(data.story.premise, y);
  }
  
  if (data.story?.synopsis) {
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Synopsis:", margin, y);
    y += 8;
    y = addWrappedText(data.story.synopsis, y);
  }
  
  if (data.story?.globalSynopsis) {
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Global Synopsis:", margin, y);
    y += 8;
    y = addWrappedText(data.story.globalSynopsis, y);
  }
  
  // Section 3: Story Structure
  if (data.story?.structureBeats && Object.keys(data.story.structureBeats).length > 0) {
    pdf.addPage();
    const structureName = data.story.structure === "hero" ? "Hero's Journey" : 
                       data.story.structure === "cat" ? "Save the Cat" : "Dan Harmon Circle";
    y = addSectionHeader(y, `Story Structure - ${structureName}`, 3);
    
    Object.entries(data.story.structureBeats).forEach(([beat, desc], idx) => {
      y = checkNewPage(y, 25);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${idx + 1}. ${beat}:`, margin, y);
      y += 8;
      y = addWrappedText(desc, y, 10);
      y += 5;
    });
  }
  
  // Section 4: Character Profiles
  if (data.characters && data.characters.length > 0) {
    pdf.addPage();
    y = addSectionHeader(y, "Character Profiles", 4);
    
    data.characters.forEach((char, idx) => {
      if (idx > 0) pdf.addPage();
      y = margin;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${char.name} (${char.role})`, margin, y);
      y += 12;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Age: ${char.age || "N/A"}`, margin, y);
      y += 7;
      pdf.text(`Gender: ${char.physiological?.gender || "N/A"}`, margin + 60, y);
      y += 7;
      pdf.text(`Archetype: ${char.psychological?.archetype || "N/A"}`, margin + 120, y);
      y += 12;
      
      // Psychology
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Psychology:", margin, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (char.psychological?.wants) {
        pdf.text(`Wants: ${char.psychological.wants}`, margin, y);
        y += 7;
      }
      if (char.psychological?.needs) {
        pdf.text(`Needs: ${char.psychological.needs}`, margin, y);
        y += 7;
      }
      if (char.psychological?.fears) {
        pdf.text(`Fears: ${char.psychological.fears}`, margin, y);
        y += 12;
      }
    });
  }
  
  // Section 5: Universe & World-Building
  if (data.universe) {
    pdf.addPage();
    y = addSectionHeader(y, "Universe & World-Building", 5);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    if (data.universe.name) {
      pdf.text(`Universe Name: ${data.universe.name}`, margin, y);
      y += 10;
    }
    if (data.universe.period) {
      pdf.text(`Period: ${data.universe.period}`, margin, y);
      y += 10;
    }
    if (data.universe.era) {
      pdf.text(`Era: ${data.universe.era}`, margin, y);
      y += 10;
    }
    if (data.universe.location) {
      pdf.text(`Location: ${data.universe.location}`, margin, y);
      y += 10;
    }
    if (data.universe.environment) {
      y = checkNewPage(y, 15);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Environment:", margin, y);
      y += 8;
      y = addWrappedText(data.universe.environment, y);
    }
  }
  
  // Section 6: Universe Formula
  if (data.universeFormula) {
    pdf.addPage();
    y = addSectionHeader(y, "Universe Formula", 6);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Top Row - Locations
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Locations:", margin, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (data.universeFormula.workingOfficeSchool) {
      pdf.text(`Working Office/School: ${data.universeFormula.workingOfficeSchool}`, margin, y);
      y += 7;
    }
    if (data.universeFormula.townDistrictCity) {
      pdf.text(`Town/District/City: ${data.universeFormula.townDistrictCity}`, margin, y);
      y += 7;
    }
    if (data.universeFormula.neighborhoodEnvironment) {
      pdf.text(`Neighborhood/Environment: ${data.universeFormula.neighborhoodEnvironment}`, margin, y);
      y += 12;
    }
    
    // Left Column - Systems
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Systems:", margin, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (data.universeFormula.rulesOfWork) {
      y = addWrappedText(`Rules of Work: ${data.universeFormula.rulesOfWork}`, y);
    }
    if (data.universeFormula.laborLaw) {
      y = addWrappedText(`Labor Law: ${data.universeFormula.laborLaw}`, y);
    }
    if (data.universeFormula.country) {
      pdf.text(`Country: ${data.universeFormula.country}`, margin, y);
      y += 7;
    }
    if (data.universeFormula.governmentSystem) {
      y = addWrappedText(`Government System: ${data.universeFormula.governmentSystem}`, y);
    }
    
    // Center Column - Identity
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Identity:", margin, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (data.universeFormula.universeName) {
      pdf.text(`Name of Universe: ${data.universeFormula.universeName}`, margin, y);
      y += 7;
    }
    if (data.universeFormula.period) {
      pdf.text(`Period: ${data.universeFormula.period}`, margin, y);
      y += 7;
    }
    
    // Center Column - Visual
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Visual:", margin, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (data.universeFormula.environmentLandscape) {
      y = addWrappedText(`Environment/Landscape: ${data.universeFormula.environmentLandscape}`, y);
    }
    if (data.universeFormula.societyAndSystem) {
      y = addWrappedText(`Society & System: ${data.universeFormula.societyAndSystem}`, y);
    }
    if (data.universeFormula.privateInterior) {
      y = addWrappedText(`Private/Interior: ${data.universeFormula.privateInterior}`, y);
    }
    
    // Center Column - Systems (Sociopolitic & Economy)
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Sociopolitic & Economy:", margin, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (data.universeFormula.sociopoliticEconomy) {
      y = addWrappedText(data.universeFormula.sociopoliticEconomy, y);
    }
    
    // Right Column - Private Spaces
    y = checkNewPage(y, 15);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Private Spaces:", margin, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (data.universeFormula.houseCastle) {
      pdf.text(`House/Castle: ${data.universeFormula.houseCastle}`, margin, y);
      y += 7;
    }
    if (data.universeFormula.roomCave) {
      pdf.text(`Room/Cave: ${data.universeFormula.roomCave}`, margin, y);
      y += 7;
    }
    if (data.universeFormula.familyInnerCircle) {
      y = addWrappedText(`Family/Inner Circle: ${data.universeFormula.familyInnerCircle}`, y);
    }
    if (data.universeFormula.kingdomTribeCommunal) {
      y = addWrappedText(`Kingdom/Tribe/Communal: ${data.universeFormula.kingdomTribeCommunal}`, y);
    }
  }
  
  // Section 7: Strategic Plan
  if (data.strategicPlan) {
    pdf.addPage();
    y = addSectionHeader(y, "Strategic Plan - IP Business Model Canvas", 7);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const bmcSections = [
      { label: "Customer Segments", value: data.strategicPlan.customerSegments },
      { label: "Value Propositions", value: data.strategicPlan.valuePropositions },
      { label: "Channels", value: data.strategicPlan.channels },
      { label: "Customer Relationships", value: data.strategicPlan.customerRelationships },
      { label: "Revenue Streams", value: data.strategicPlan.revenueStreams },
      { label: "Key Resources", value: data.strategicPlan.keyResources },
      { label: "Key Activities", value: data.strategicPlan.keyActivities },
      { label: "Key Partnerships", value: data.strategicPlan.keyPartnerships },
      { label: "Cost Structure", value: data.strategicPlan.costStructure },
    ];
    
    bmcSections.forEach((section) => {
      y = checkNewPage(y, 20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.label + ":", margin, y);
      y += 8;
      y = addWrappedText(section.value || "Not provided", y);
    });
    
    // Performance Analysis
    y = checkNewPage(y, 15);
    y = addSectionHeader(y, "Performance Analysis", undefined);
    
    const performanceFactors = [
      { label: "Cast", value: data.strategicPlan.cast },
      { label: "Director", value: data.strategicPlan.director },
      { label: "Producer", value: data.strategicPlan.producer },
      { label: "Executive Producer", value: data.strategicPlan.executiveProducer },
      { label: "Distributor", value: data.strategicPlan.distributor },
      { label: "Publisher", value: data.strategicPlan.publisher },
      { label: "Title Brand Positioning", value: data.strategicPlan.titleBrandPositioning },
      { label: "Theme Stated", value: data.strategicPlan.themeStated },
      { label: "Unique Selling", value: data.strategicPlan.uniqueSelling },
      { label: "Story Values", value: data.strategicPlan.storyValues },
      { label: "Fans Loyalty", value: data.strategicPlan.fansLoyalty },
      { label: "Production Budget", value: data.strategicPlan.productionBudget },
      { label: "Promotion Budget", value: data.strategicPlan.promotionBudget },
      { label: "Social Media Engagements", value: data.strategicPlan.socialMediaEngagements },
      { label: "Teaser Trailer Engagements", value: data.strategicPlan.teaserTrailerEngagements },
      { label: "Genre", value: data.strategicPlan.genre },
    ];
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    performanceFactors.forEach((factor) => {
      y = checkNewPage(y, 10);
      pdf.text(`${factor.label}: ${factor.value || "N/A"}`, margin, y);
      y += 7;
    });
  }
  
  // Section 8: Visual Development (Moodboard & Animations)
  if ((data.moodboardImages && Object.keys(data.moodboardImages).length > 0) ||
      (data.animationVideos && Object.keys(data.animationVideos).length > 0)) {
    pdf.addPage();
    y = addSectionHeader(y, "Visual Development", 8);
    
    // Moodboard Gallery
    if (data.moodboardImages && Object.keys(data.moodboardImages).length > 0) {
      y = checkNewPage(y, 15);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Moodboard Gallery:", margin, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      Object.entries(data.moodboardImages).forEach(([beat, url]) => {
        y = checkNewPage(y, 10);
        pdf.text(`${beat}:`, margin, y);
        y += 7;
        y = addWrappedText(url, y, 9);
      });
    }
    
    // Animation Previews
    if (data.animationVideos && Object.keys(data.animationVideos).length > 0) {
      y = checkNewPage(y, 15);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Animation Previews:", margin, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      Object.entries(data.animationVideos).forEach(([beat, videoData]) => {
        y = checkNewPage(y, 10);
        pdf.text(`${beat}:`, margin, y);
        y += 7;
        pdf.text(`Duration: ${videoData.duration || "N/A"}s | Provider: ${videoData.provider || "N/A"}`, margin, y);
        y += 7;
        y = addWrappedText(`URL: ${videoData.url}`, y, 9);
      });
    }
  }
  
  // Section 9: Project Team
  if (data.projectTeam && data.projectTeam.length > 0) {
    pdf.addPage();
    y = addSectionHeader(y, "Project Team", 9);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    data.projectTeam.forEach((member) => {
      y = checkNewPage(y, 20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${member.name} (${member.role})`, margin, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (member.email) {
        pdf.text(`Email: ${member.email}`, margin, y);
        y += 7;
      }
      if (member.responsibilities) {
        y = addWrappedText(`Responsibilities: ${member.responsibilities}`, y);
      }
      if (member.expertise) {
        y = addWrappedText(`Expertise: ${member.expertise}`, y);
      }
    });
  }
  
  // Section 10: Pre-existing Materials
  if (data.materials && data.materials.length > 0) {
    pdf.addPage();
    y = addSectionHeader(y, "Pre-existing Materials", 10);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    data.materials.forEach((material) => {
      y = checkNewPage(y, 20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${material.name} (${material.type})`, margin, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (material.description) {
        y = addWrappedText(material.description, y);
      }
      if (material.category) {
        pdf.text(`Category: ${material.category}`, margin, y);
        y += 7;
      }
      if (material.tags && material.tags.length > 0) {
        pdf.text(`Tags: ${material.tags.join(', ')}`, margin, y);
        y += 7;
      }
      if (material.fileUrl) {
        y = addWrappedText(`URL: ${material.fileUrl}`, y, 9);
      }
    });
  }
  
  // Footer
  pdf.addPage();
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`© ${new Date().getFullYear()} ${data.studioName || "MODO Studio"} - All Rights Reserved`, margin, pageHeight - 30);
  pdf.text("Generated with MODO Creator Verse", margin, pageHeight - 20);
  
  return pdf.output('blob');
}
