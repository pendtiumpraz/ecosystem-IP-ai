import jsPDF from 'jspdf';

export interface ScreenplayPDFData {
    projectName: string;
    projectImage?: string;
    studioName?: string;
    authorName?: string;
    scenes: Array<{
        sceneNumber: number;
        title: string;
        content: string;
        hasScript: boolean;
        synopsis?: string;
    }>;
}

// Helper to load image and convert to base64
async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

export async function generateScreenplayPDF(data: ScreenplayPDFData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 25.4; // 1 inch margin
    const leftMargin = 38.1; // 1.5 inch left margin for screenplay
    const contentWidth = pageWidth - leftMargin - margin;

    // ============================================
    // PAGE 1: COVER PAGE with Image
    // ============================================

    // Background gradient effect (dark theme)
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Try to add cover image
    if (data.projectImage) {
        try {
            const imageData = await loadImageAsBase64(data.projectImage);
            if (imageData) {
                // Add image centered
                const imgWidth = 140;
                const imgHeight = 100;
                const imgX = (pageWidth - imgWidth) / 2;
                const imgY = 40;

                pdf.addImage(imageData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
            }
        } catch (e) {
            console.log('Failed to load cover image');
        }
    }

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('courier', 'bold');
    const titleY = data.projectImage ? 170 : 100;
    pdf.text(data.projectName.toUpperCase() || "UNTITLED SCREENPLAY", pageWidth / 2, titleY, { align: 'center' });

    // Subtitle
    pdf.setFontSize(14);
    pdf.setFont('courier', 'normal');
    pdf.text("SCREENPLAY", pageWidth / 2, titleY + 15, { align: 'center' });

    // Line separator
    pdf.setDrawColor(249, 115, 22); // orange-500
    pdf.setLineWidth(1);
    pdf.line(pageWidth / 2 - 40, titleY + 25, pageWidth / 2 + 40, titleY + 25);

    // Author/Studio info
    pdf.setFontSize(12);
    pdf.setTextColor(200, 200, 200);
    if (data.authorName) {
        pdf.text(`Written by ${data.authorName}`, pageWidth / 2, titleY + 45, { align: 'center' });
    }
    if (data.studioName) {
        pdf.text(data.studioName, pageWidth / 2, titleY + 55, { align: 'center' });
    }

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }), pageWidth / 2, titleY + 75, { align: 'center' });

    // Scene count
    const sceneCount = data.scenes.filter(s => s.hasScript).length;
    pdf.text(`${sceneCount} Scenes`, pageWidth / 2, titleY + 85, { align: 'center' });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated with MODO Creator Verse", pageWidth / 2, pageHeight - 15, { align: 'center' });

    // ============================================
    // PAGE 2: TITLE PAGE (Screenplay Standard)
    // ============================================
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.setFont('courier', 'bold');
    pdf.text(data.projectName.toUpperCase() || "UNTITLED", pageWidth / 2, 100, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('courier', 'normal');
    pdf.text("Original Screenplay", pageWidth / 2, 115, { align: 'center' });

    if (data.authorName) {
        pdf.text("by", pageWidth / 2, 140, { align: 'center' });
        pdf.text(data.authorName, pageWidth / 2, 150, { align: 'center' });
    }

    // Contact info at bottom left (screenplay format)
    pdf.setFontSize(10);
    pdf.text(data.studioName || "MODO Studio", margin, pageHeight - 50);
    pdf.text(new Date().toLocaleDateString('id-ID'), margin, pageHeight - 40);

    // ============================================
    // SCENE PAGES
    // ============================================

    for (const scene of data.scenes) {
        pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        let y = margin;

        // Scene Header
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('courier', 'bold');
        pdf.text(`SCENE ${scene.sceneNumber}`, leftMargin, y);
        y += 10;

        pdf.setFontSize(14);
        pdf.text(scene.title.toUpperCase(), leftMargin, y);
        y += 8;

        // Separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(leftMargin, y, pageWidth - margin, y);
        y += 15;

        // Script content or placeholder
        if (scene.hasScript && scene.content) {
            y = renderScreenplayContent(pdf, scene.content, y, leftMargin, contentWidth, pageHeight, margin);
        } else {
            // No script placeholder
            pdf.setFontSize(12);
            pdf.setFont('courier', 'italic');
            pdf.setTextColor(150, 150, 150);
            pdf.text("[Script not yet generated]", leftMargin, y);
            y += 15;

            if (scene.synopsis) {
                pdf.setFontSize(10);
                pdf.setFont('courier', 'normal');
                pdf.setTextColor(100, 100, 100);
                const lines = pdf.splitTextToSize(`Synopsis: ${scene.synopsis}`, contentWidth);
                lines.forEach((line: string) => {
                    pdf.text(line, leftMargin, y);
                    y += 5;
                });
            }
        }

        // Page number
        pdf.setFontSize(10);
        pdf.setFont('courier', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${pdf.getNumberOfPages() - 2}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    return pdf.output('blob');
}

// Render screenplay-formatted content
function renderScreenplayContent(
    pdf: jsPDF,
    content: string,
    startY: number,
    leftMargin: number,
    contentWidth: number,
    pageHeight: number,
    margin: number
): number {
    let y = startY;
    const lines = content.split('\n');

    const checkNewPage = (neededSpace: number = 12) => {
        if (y + neededSpace > pageHeight - margin - 10) {
            pdf.addPage();
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, 210, 297, 'F');
            y = margin;
            // Page number
            pdf.setFontSize(10);
            pdf.setFont('courier', 'normal');
            pdf.setTextColor(150, 150, 150);
            pdf.text(`${pdf.getNumberOfPages() - 2}`, 105, pageHeight - 10, { align: 'center' });
        }
    };

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines but add spacing
        if (!trimmedLine) {
            y += 3; // Reduced from 5 to match web view
            continue;
        }

        checkNewPage();

        // Scene heading (INT./EXT.)
        if (/^(INT\.|EXT\.|INT\/EXT\.)/.test(trimmedLine)) {
            pdf.setFontSize(10);
            pdf.setFont('courier', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(trimmedLine.toUpperCase(), leftMargin, y);
            y += 6;
        }
        // Character name (ALL CAPS)
        else if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 40 && !trimmedLine.includes(':')) {
            pdf.setFontSize(10);
            pdf.setFont('courier', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(trimmedLine, leftMargin + 25, y); // ~1 inch from left margin
            y += 5;
        }
        // Parenthetical (stage direction in parentheses)
        else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
            pdf.setFontSize(10);
            pdf.setFont('courier', 'italic');
            pdf.setTextColor(80, 80, 80);
            pdf.text(trimmedLine, leftMargin + 20, y); // ~0.8 inch offset
            y += 4;
        }
        // Transition (CUT TO:, FADE OUT., etc.)
        else if (/^(CUT TO:|FADE TO:|FADE OUT\.|DISSOLVE TO:|SMASH CUT:)/.test(trimmedLine)) {
            pdf.setFontSize(10);
            pdf.setFont('courier', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(trimmedLine, leftMargin + contentWidth - 20, y, { align: 'right' });
            y += 6;
        }
        // Dialog or Action
        else {
            pdf.setFontSize(10);
            pdf.setFont('courier', 'normal');
            pdf.setTextColor(0, 0, 0);

            // Check if it looks like dialog (after character name usually)
            const isDialog = line.startsWith('    ') || line.startsWith('\t');
            const xOffset = isDialog ? 12 : 0; // ~0.5 inch for dialog
            const maxWidth = isDialog ? contentWidth - 24 : contentWidth;

            const wrappedLines = pdf.splitTextToSize(trimmedLine, maxWidth);
            for (const wrappedLine of wrappedLines) {
                checkNewPage(5);
                pdf.text(wrappedLine, leftMargin + xOffset, y);
                y += 4;
            }
            y += 1;
        }
    }

    return y;
}
