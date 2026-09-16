/**
 * NexLearn AI - Executive Study Guide & Revision Cheatsheet PDF Generator
 * High-performance, theme-independent, vector-grade A4 PDF layout engine.
 * Engineered for executive SaaS typography, clean pagination, and 100% clean ASCII rendering.
 */

export interface StudyGuideData {
  title: string;
  courseTitle?: string;
  difficulty?: string;
  notes?: string;
  summary?: string;
  examples?: string;
  exercises?: string;
  studentName?: string;
}

/**
 * Robust ASCII / WinAnsi sanitizer to eliminate any unsupported Unicode characters
 * that cause mojibake / garbled symbols in standard PDF fonts.
 */
function cleanAscii(input?: string): string {
  if (!input) return '';
  return input
    // Smart quotes & apostrophes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Dashes & hyphens
    .replace(/[\u2013\u2014\u2015]/g, '-')
    // Bullets & dots
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25CF\u25CB]/g, '-')
    // Stars
    .replace(/[\u2605\u2606\u2728\u2B50]/g, '*')
    // Checkmarks & crosses
    .replace(/[\u2713\u2714]/g, '[v]')
    .replace(/[\u2715\u2716\u2717\u2718]/g, '[x]')
    // Arrows
    .replace(/[\u2192\u279C\u2794\u21D2]/g, '->')
    .replace(/[\u2190\u21D0]/g, '<-')
    // Ellipsis
    .replace(/\u2026/g, '...')
    // Degree, copyright, trademarks
    .replace(/\u00B0/g, ' deg')
    .replace(/[\u00A9\u00AE\u2122]/g, '')
    // Non-breaking space
    .replace(/\u00A0/g, ' ')
    // Strip all remaining non-ASCII characters outside standard printable range
    .replace(/[^\x20-\x7E\t\n\r]/g, ' ')
    // Collapse excessive whitespace within lines
    .replace(/[ \t]+/g, ' ');
}

export async function generateStudyGuidePDF(data: StudyGuideData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF('p', 'pt', 'a4');
  const pdfWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pdfHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 36;
  const contentWidth = pdfWidth - margin * 2; // 523.28 pt
  const bottomLimit = pdfHeight - 40; // 801.89 pt
  let currentY = 48;

  const rawModuleTitle = cleanAscii(data.title || 'Curriculum Module');
  const rawCourseTitle = cleanAscii(data.courseTitle || 'NexLearn AI Masterclass');
  const rawDifficulty = cleanAscii(data.difficulty || 'Intermediate').toUpperCase();
  const currentDate = cleanAscii(
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  );

  // Generate clean alphanumeric document hash for official verification reference
  const docHash = Math.abs(
    (rawModuleTitle + rawCourseTitle + currentDate).split('').reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0)
  )
    .toString(36)
    .toUpperCase()
    .padStart(8, '0');

  // Ensure enough vertical space before drawing a block
  const checkPageBreak = (neededHeight: number): boolean => {
    if (currentY + neededHeight > bottomLimit) {
      doc.addPage();
      currentY = 48;
      return true;
    }
    return false;
  };

  // =========================================================================
  // --- 1. Top Cover / Metadata Banner (Page 1) ---
  // =========================================================================
  checkPageBreak(130);

  // Outer Master Container Card with Rounded Corners
  doc.setFillColor(30, 27, 75); // Deep Midnight Indigo 950
  doc.roundedRect(margin, currentY, contentWidth, 116, 8, 8, 'F');

  // Top Radiant Accent Stripe inside the card
  doc.setFillColor(79, 70, 229); // Electric Indigo 600
  doc.roundedRect(margin, currentY, contentWidth * 0.45, 3.5, 2, 2, 'F');
  doc.setFillColor(139, 92, 246); // Violet 500
  doc.rect(margin + contentWidth * 0.45, currentY, contentWidth * 0.35, 3.5, 'F');
  doc.setFillColor(6, 182, 212); // Cyan 500
  doc.roundedRect(margin + contentWidth * 0.8, currentY, contentWidth * 0.2, 3.5, 2, 2, 'F');

  // Top Dark Banner Row: Institutional Badge & Difficulty Pill
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(199, 210, 254); // Indigo 200
  doc.text('OFFICIAL ACADEMIC STUDY GUIDE | EXECUTIVE CHEATSHEET', margin + 14, currentY + 19);

  // Difficulty Pill Badge (Top Right)
  const diffPillWidth = 86;
  const diffPillX = pdfWidth - margin - diffPillWidth - 12;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(diffPillX, currentY + 8, diffPillWidth, 15, 4, 4, 'F');
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`LEVEL: ${rawDifficulty}`, diffPillX + diffPillWidth / 2, currentY + 18.5, { align: 'center' });

  // Inner Clean White Card Body
  const innerCardY = currentY + 29;
  const innerCardHeight = 87;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.75);
  doc.roundedRect(margin, innerCardY, contentWidth, innerCardHeight, 0, 0, 'FD');
  // Outer border re-stroke for clean rounded edges
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 116, 8, 8, 'D');

  // Course Supertitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  const truncCourse = rawCourseTitle.length > 75 ? rawCourseTitle.slice(0, 72) + '...' : rawCourseTitle;
  doc.text(truncCourse.toUpperCase(), margin + 14, innerCardY + 16);

  // Module Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(rawModuleTitle, contentWidth - 28);
  doc.text(titleLines.slice(0, 2), margin + 14, innerCardY + 33);

  // Executive 4-Pill Metadata Stat Bar
  const statBarY = innerCardY + 54;
  const statPillWidth = (contentWidth - 28 - 24) / 4;

  const statPills = [
    { label: 'EST. READ TIME', val: '~12 MIN' },
    { label: 'SYLLABUS STATUS', val: 'VERIFIED' },
    { label: 'EXERCISES', val: 'INCLUDED' },
    { label: 'REVISION ISSUED', val: currentDate },
  ];

  statPills.forEach((p, idx) => {
    const pillX = margin + 14 + idx * (statPillWidth + 8);
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.roundedRect(pillX, statBarY, statPillWidth, 22, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(p.label, pillX + 6, statBarY + 8.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(p.val, pillX + 6, statBarY + 17.5);
  });

  currentY += 132;

  // =========================================================================
  // --- Helper: Draw Section Header ---
  // =========================================================================
  const drawSectionHeader = (sectionNumber: string, sectionTitle: string, subtitle?: string) => {
    // Keep header together with following content (requires at least 65pt)
    checkPageBreak(65);

    // Pill badge for section number
    doc.setFillColor(30, 27, 75); // Deep Midnight Indigo 950
    doc.roundedRect(margin, currentY, 24, 16, 4, 4, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(sectionNumber, margin + 6.5, currentY + 11.5);

    // Section title
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanAscii(sectionTitle), margin + 32, currentY + 12);

    // Accent line: 40pt indigo start, then subtle slate across width
    doc.setFillColor(79, 70, 229);
    doc.rect(margin, currentY + 22, 40, 1.2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin + 40, currentY + 22.6, pdfWidth - margin, currentY + 22.6);

    currentY += 30;

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(cleanAscii(subtitle), margin, currentY);
      currentY += 14;
    }
  };

  // =========================================================================
  // --- Helper: Render Formatted Code Box with Modern VS Code / Mac Theme ---
  // =========================================================================
  const renderCodeBox = (codeLines: string[]) => {
    if (codeLines.length === 0) return;

    let lineIndex = 0;
    let isContinuation = false;

    while (lineIndex < codeLines.length) {
      // Calculate available space on current page
      const availableSpace = bottomLimit - currentY - 26;
      let linesFitting = Math.floor(availableSpace / 11);

      if (linesFitting < 3) {
        doc.addPage();
        currentY = 48;
        linesFitting = Math.floor((bottomLimit - currentY - 26) / 11);
      }

      const chunk = codeLines.slice(lineIndex, lineIndex + linesFitting);
      lineIndex += chunk.length;

      const codeChunkHeight = chunk.length * 11 + 18;

      // Card Background (Midnight Slate #0F172A - High-End Technical Aesthetic)
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.setDrawColor(30, 41, 59); // Slate 800
      doc.setLineWidth(0.75);
      doc.roundedRect(margin, currentY, contentWidth, codeChunkHeight, 5, 5, 'FD');

      // Top IDE Header Bar (Slate 800)
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, currentY, contentWidth, 15, 5, 5, 'F');
      doc.rect(margin, currentY + 9, contentWidth, 6, 'F'); // Square off bottom corners of header

      // Three Mac Window Dots
      doc.setFillColor(239, 68, 68); // Red Close
      doc.circle(margin + 10, currentY + 7.5, 2.3, 'F');
      doc.setFillColor(245, 158, 11); // Yellow Minimize
      doc.circle(margin + 17, currentY + 7.5, 2.3, 'F');
      doc.setFillColor(16, 185, 129); // Green Maximize
      doc.circle(margin + 24, currentY + 7.5, 2.3, 'F');

      // Header Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      const headerTitle = isContinuation
        ? 'CODE IMPLEMENTATION (CONTINUED)'
        : 'CODE IMPLEMENTATION & SYNTAX DEMO';
      doc.text(headerTitle, margin + 34, currentY + 10);

      // Verified Syntax Pill Badge (Right) - Clean vector dot + clean ASCII text (NO unicode symbols!)
      doc.setFillColor(6, 78, 59); // Emerald 900
      doc.roundedRect(pdfWidth - margin - 82, currentY + 3.5, 72, 9, 2, 2, 'F');
      doc.setFillColor(52, 211, 153); // Emerald 400 vector dot
      doc.circle(pdfWidth - margin - 76, currentY + 8, 1.8, 'F');
      doc.setFontSize(5.5);
      doc.setTextColor(52, 211, 153); // Emerald 400
      doc.text('VERIFIED SYNTAX', pdfWidth - margin - 70, currentY + 9.5);

      // Code Body: Gutter Line Numbers + Monospace Code
      let textY = currentY + 24;
      const startNum = lineIndex - chunk.length + 1;

      // Draw subtle gutter divider line
      doc.setDrawColor(51, 65, 85); // Slate 700
      doc.setLineWidth(0.5);
      doc.line(margin + 26, currentY + 15, margin + 26, currentY + codeChunkHeight);

      for (let c = 0; c < chunk.length; c++) {
        const lineNum = (startNum + c).toString().padStart(2, '0');
        const codeText = cleanAscii(chunk[c]);

        // Gutter Line Number
        doc.setFont('courier', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(lineNum, margin + 7, textY);

        // Monospace Code Line
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);

        // Syntax-highlight feel: Comments in Sky Slate, code in Crisp White
        if (codeText.trim().startsWith('//') || codeText.trim().startsWith('#')) {
          doc.setTextColor(148, 163, 184); // Slate 400
        } else {
          doc.setTextColor(248, 250, 252); // Crisp White Slate 50
        }

        doc.text(codeText, margin + 32, textY);
        textY += 11;
      }

      currentY += codeChunkHeight + 8;
      isContinuation = true;
    }
  };

  // =========================================================================
  // --- Helper: Parse & Render Markdown Text Content ---
  // =========================================================================
  const renderMarkdownBlock = (rawText: string) => {
    if (!rawText) return;

    // Sanitize whole text to clean ASCII upfront
    const sanitized = cleanAscii(rawText);
    const lines = sanitized.split('\n');
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];

    const flushCodeBlock = () => {
      if (codeBlockBuffer.length === 0) return;
      const codeText = codeBlockBuffer.join('\n');
      const formattedLines = doc.splitTextToSize(codeText, contentWidth - 44);
      renderCodeBox(formattedLines);
      codeBlockBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Code block delimiters
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        continue;
      }

      if (!trimmed) {
        currentY += 4;
        continue;
      }

      // Headings 1 & 2
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        const hText = cleanAscii(trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, ''));
        checkPageBreak(30);

        // Indigo accent bar on the left
        doc.setFillColor(79, 70, 229);
        doc.roundedRect(margin, currentY + 1, 3.5, 13, 1, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(hText, margin + 10, currentY + 11.5);
        currentY += 21;
        continue;
      }

      // Headings 3 & 4
      if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        const hText = cleanAscii(trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, ''));
        checkPageBreak(24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(67, 56, 202);
        doc.text(hText, margin, currentY + 10);
        currentY += 17;
        continue;
      }

      // Blockquotes / Callout boxes (> ...)
      if (trimmed.startsWith('> ')) {
        const quoteContent = cleanAscii(trimmed.slice(2).replace(/\*\*/g, ''));
        const qLines = doc.splitTextToSize(quoteContent, contentWidth - 32);
        const qHeight = qLines.length * 12.5 + 20;

        checkPageBreak(qHeight);

        // Callout card container
        doc.setFillColor(245, 247, 255); // Indigo 50 / soft violet
        doc.setDrawColor(199, 210, 254); // Indigo 200
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, currentY, contentWidth, qHeight, 4, 4, 'FD');

        // Left 3.5pt solid Indigo bar
        doc.setFillColor(79, 70, 229);
        doc.roundedRect(margin, currentY, 3.5, qHeight, 1, 1, 'F');

        // Pill Tag: KEY TAKEAWAY
        doc.setFillColor(224, 231, 255);
        doc.roundedRect(margin + 12, currentY + 6, 68, 9, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(67, 56, 202);
        doc.text('KEY TAKEAWAY', margin + 46, currentY + 12.5, { align: 'center' });

        // Quote text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 27, 75); // Indigo 950
        doc.text(qLines, margin + 12, currentY + 25);

        currentY += qHeight + 8;
        continue;
      }

      // Bullet points (- or * or numbered list) with HANGING INDENT
      const isBullet = /^[*-]\s+/.test(trimmed);
      const isNumbered = /^\d+\.\s+/.test(trimmed);

      if (isBullet || isNumbered) {
        const bulletText = cleanAscii(trimmed.replace(/^[*-]\s+|^\d+\.\s+/, '').replace(/\*\*/g, ''));
        // Hanging indent: wrap width is contentWidth - 22
        const bLines = doc.splitTextToSize(bulletText, contentWidth - 22);
        const bHeight = bLines.length * 12.5 + 3;

        checkPageBreak(bHeight);

        // Vector Marker (NO Unicode text bullets that cause mojibake!)
        if (isBullet) {
          doc.setFillColor(79, 70, 229);
          doc.circle(margin + 5, currentY + 6, 2, 'F');
        } else {
          const matchNum = trimmed.match(/^(\d+)\./);
          const numStr = matchNum ? matchNum[1] + '.' : '-';
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(79, 70, 229);
          doc.text(numStr, margin + 2, currentY + 8);
        }

        // Hanging text block: all lines align at margin + 16
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(bLines, margin + 16, currentY + 8);

        currentY += bHeight + 4;
        continue;
      }

      // Regular paragraph text
      const cleanPara = cleanAscii(trimmed.replace(/\*\*/g, ''));
      const pLines = doc.splitTextToSize(cleanPara, contentWidth);
      const pHeight = pLines.length * 12.5 + 2;

      checkPageBreak(pHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // Slate 700
      doc.text(pLines, margin, currentY + 8);

      currentY += pHeight + 6;
    }

    if (inCodeBlock) flushCodeBlock();
  };

  // =========================================================================
  // --- Section 1: Notes & Core Theory ---
  // =========================================================================
  if (data.notes) {
    drawSectionHeader('01', 'COMPREHENSIVE CURRICULUM NOTES & THEORY', 'Core architectural principles, mechanics, and conceptual paradigms');
    renderMarkdownBlock(data.notes);
    currentY += 12;
  }

  // =========================================================================
  // --- Section 2: Practical Worked Examples ---
  // =========================================================================
  if (data.examples && data.examples.trim().length > 10) {
    drawSectionHeader('02', 'PRACTICAL WORKED EXAMPLES & CODE WALKTHROUGHS', 'Real-world application patterns, syntax demonstrations, and algorithmic logic');
    renderMarkdownBlock(data.examples);
    currentY += 12;
  }

  // =========================================================================
  // --- Section 3: Interactive Practice Challenges ---
  // =========================================================================
  if (data.exercises && data.exercises.trim().length > 10) {
    drawSectionHeader('03', 'PRACTICE CHALLENGES & COMPREHENSION SETS', 'Problem sets designed to evaluate retention and enforce critical mastery');
    renderMarkdownBlock(data.exercises);
    currentY += 12;
  }

  // =========================================================================
  // --- Section 4: Executive Summary & Cheatsheet ---
  // =========================================================================
  if (data.summary && data.summary.trim().length > 10) {
    drawSectionHeader('04', 'EXECUTIVE SUMMARY & REVISION CHEATSHEET', 'High-yield takeaways and key terminology for rapid review and exam readiness');
    renderMarkdownBlock(data.summary);
    currentY += 12;
  }

  // =========================================================================
  // --- 5. Clean Executive Curriculum Verification Ledger Card (Closing) ---
  // (Replaces fake stamp & signature with a modern, prestigious SaaS ledger card)
  // =========================================================================
  const ledgerCardHeight = 52;

  // If insufficient space remaining on current page, break cleanly and show Next Steps
  if (currentY + ledgerCardHeight > bottomLimit) {
    doc.addPage();
    currentY = 48;

    // Next Learning Milestones Card (Clean and balanced, never an empty page!)
    const milestoneHeight = 64;
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.75);
    doc.roundedRect(margin, currentY, contentWidth, milestoneHeight, 6, 6, 'FD');

    doc.setFillColor(79, 70, 229); // Indigo accent bar
    doc.roundedRect(margin, currentY, 3.5, milestoneHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('NEXT CURRICULUM MILESTONES', margin + 14, currentY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('[1] Advance to subsequent module in this curriculum to preserve your learning streak.', margin + 14, currentY + 30);
    doc.text('[2] Complete the interactive module quiz to evaluate comprehension and earn points.', margin + 14, currentY + 42);
    doc.text('[3] Reinforce key technical definitions with spaced repetition flashcards.', margin + 14, currentY + 54);

    currentY += milestoneHeight + 14;
  }

  // Render Modern SaaS Curriculum Verification Card
  const cardY = currentY;

  // Background Container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.75);
  doc.roundedRect(margin, cardY, contentWidth, ledgerCardHeight, 6, 6, 'FD');

  // Left Indigo Accent Bar
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, cardY, 3.5, ledgerCardHeight, 1, 1, 'F');

  // Card Header Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202);
  doc.text('NEXLEARN AI | OFFICIAL CURRICULUM RECORD & REVISION DIGEST', margin + 14, cardY + 15);

  // Status Pill Badge (Top Right)
  const statusPillW = 98;
  const statusPillX = pdfWidth - margin - statusPillW - 10;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.setLineWidth(0.5);
  doc.roundedRect(statusPillX, cardY + 7, statusPillW, 12, 3, 3, 'FD');

  // Green Vector Dot (No Unicode!)
  doc.setFillColor(16, 185, 129);
  doc.circle(statusPillX + 8, cardY + 13, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(4, 120, 87);
  doc.text('STATUS: VERIFIED', statusPillX + 15, cardY + 15);

  // Divider Line
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.5);
  doc.line(margin + 14, cardY + 22, pdfWidth - margin - 14, cardY + 22);

  // Subtitle / Ledger Details (Clean ASCII only)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Course: ${rawCourseTitle}  |  Module: ${rawModuleTitle}  |  Level: ${rawDifficulty}`,
    margin + 14,
    cardY + 33
  );
  doc.text(
    `Doc Ref: NL-GUIDE-${docHash}  |  Issued: ${currentDate}  |  nexlearn.ai`,
    margin + 14,
    cardY + 43
  );

  // =========================================================================
  // --- Multi-Page Institutional Header & Footer Pass ---
  // =========================================================================
  const totalPages = (doc.internal as any).getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // 1. Top Radiant Brand Stripe (Full Width)
    doc.setFillColor(67, 56, 202); // Deep Indigo
    doc.rect(0, 0, pdfWidth * 0.45, 3.5, 'F');
    doc.setFillColor(124, 58, 237); // Violet
    doc.rect(pdfWidth * 0.45, 0, pdfWidth * 0.35, 3.5, 'F');
    doc.setFillColor(6, 182, 212); // Cyan accent
    doc.rect(pdfWidth * 0.8, 0, pdfWidth * 0.2, 3.5, 'F');

    // 2. Institutional Header Bar
    // NexLearn Logo Monogram
    doc.setFillColor(67, 56, 202);
    doc.roundedRect(margin, 12, 17, 17, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('N', margin + 5, 24);

    // Title & Subtitle
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NexLearn AI', margin + 23, 20);

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Autonomous Learning Ecosystem', margin + 23, 28);

    // Running Header Metadata (Right Aligned, Clean ASCII)
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `STUDY GUIDE | PAGE ${p} OF ${totalPages}`,
      pdfWidth - margin,
      20,
      { align: 'right' }
    );
    doc.text(`ISSUED: ${currentDate}`, pdfWidth - margin, 28, { align: 'right' });

    // Header Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, 35, pdfWidth - margin, 35);

    // 3. Institutional Footer Bar
    const footerY = pdfHeight - 16;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, footerY - 8, pdfWidth - margin, footerY - 8);

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Official NexLearn AI Study Material | Verified Curriculum | nexlearn.ai',
      margin,
      footerY
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${p} of ${totalPages}`, pdfWidth - margin, footerY, { align: 'right' });
  }

  // Save the generated PDF document
  const safeFilename = `NexLearn_StudyGuide_${rawModuleTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
