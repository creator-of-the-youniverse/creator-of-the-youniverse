import { jsPDF } from 'jspdf';
import { ValidationReport } from '../types';

/**
 * Generates an executive, professional PDF document from a ValidationReport
 * and triggers an offline download.
 */
export async function downloadReportAsPDF(report: ValidationReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Colors
  const COLOR_HEADER = [15, 23, 42] as const;       // #0F172A
  const COLOR_GOLD = [212, 175, 55] as const;        // #D4AF37
  const COLOR_GOLD_BG = [254, 243, 199] as const;    // #FEF3C7
  const COLOR_TEXT = [15, 23, 42] as const;          // #0F172A
  const COLOR_MUTED = [100, 116, 139] as const;      // #64748B
  const COLOR_CARD_BG = [248, 250, 252] as const;    // #F8FAFC
  const COLOR_BORDER = [226, 232, 240] as const;     // #E2E8F0
  const COLOR_GREEN = [22, 163, 74] as const;        // #16A34A
  const COLOR_GREEN_BG = [220, 252, 231] as const;   // #DCFCE7
  const COLOR_AMBER = [217, 119, 6] as const;        // #D97706
  const COLOR_AMBER_BG = [254, 243, 199] as const;   // #FEF3C7
  const COLOR_RED = [220, 38, 38] as const;          // #DC2626
  const COLOR_RED_BG = [254, 226, 226] as const;     // #FEE2E2

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.text('BRIDGE // SOVEREIGN VALIDATION NODE', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    const rightText = report.offerName ? report.offerName.substring(0, 40) : 'Validation Artifact';
    doc.text(rightText, pageWidth - margin, 12, { align: 'right' });

    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // --- COVER / HEADER BANNER ---
  // Background Header Card
  const headerHeight = 36;
  doc.setFillColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  doc.roundedRect(margin, currentY, contentWidth, headerHeight, 2, 2, 'F');

  // Gold top accent stripe
  doc.setFillColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
  doc.rect(margin, currentY, contentWidth, 2, 'F');

  // Subtitle / Tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
  doc.text('SOVEREIGN VALIDATION REPORT • OFFLINE ARTIFACT', margin + 6, currentY + 9);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titleText = report.offerName || 'Offer Validation Analysis';
  const truncatedTitle = titleText.length > 45 ? titleText.substring(0, 42) + '...' : titleText;
  doc.text(truncatedTitle, margin + 6, currentY + 18);

  // Metadata row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 195, 210);
  const timestampStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${timestampStr}   |   Node: BB (Sovereign)   |   Status: Verified Offline`, margin + 6, currentY + 28);

  currentY += headerHeight + 6;

  // --- SCORE & EXECUTIVE SUMMARY ---
  checkPageBreak(38);
  const scoreCardHeight = 34;

  // Score Box (left 50mm)
  const scoreBoxWidth = 46;
  doc.setFillColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  doc.roundedRect(margin, currentY, scoreBoxWidth, scoreCardHeight, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
  doc.text('VALIDATION SCORE', margin + scoreBoxWidth / 2, currentY + 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(`${report.validationScore}`, margin + scoreBoxWidth / 2, currentY + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 195, 210);
  doc.text('out of 10.0', margin + scoreBoxWidth / 2, currentY + 26, { align: 'center' });

  // Score Assessment Summary Box (right)
  const summaryBoxX = margin + scoreBoxWidth + 4;
  const summaryBoxWidth = contentWidth - scoreBoxWidth - 4;
  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, scoreCardHeight, 2, 2, 'FD');

  const scoreVal = report.validationScore;
  const assessmentLabel =
    scoreVal >= 8 ? 'STRONG MARKET FIT READY FOR SCALING' :
    scoreVal >= 6 ? 'MODERATE FIT WITH ACTIONABLE OPTIMIZATION GAPS' :
    'HIGH FRICTION DETECTED — REVISION RECOMMENDED';

  const badgeColor = scoreVal >= 8 ? COLOR_GREEN : scoreVal >= 6 ? COLOR_AMBER : COLOR_RED;
  const badgeBg = scoreVal >= 8 ? COLOR_GREEN_BG : scoreVal >= 6 ? COLOR_AMBER_BG : COLOR_RED_BG;

  doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
  doc.roundedRect(summaryBoxX + 4, currentY + 4, summaryBoxWidth - 8, 7, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.text(`VERDICT: ${assessmentLabel}`, summaryBoxX + 6, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  const summaryNotice = `This validation artifact assesses problem urgency, ICP positioning, pricing leverage, and defensibility across sovereign market dynamics. Available anytime offline on your device.`;
  const splitNotice = doc.splitTextToSize(summaryNotice, summaryBoxWidth - 8);
  doc.text(splitNotice, summaryBoxX + 4, currentY + 16);

  currentY += scoreCardHeight + 6;

  // --- OFFER SNAPSHOT CARD ---
  checkPageBreak(42);
  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  
  // Measure snapshot text to fit
  const snapshotItems = [
    { label: 'Core Problem:', value: report.coreProblem || 'Not specified' },
    { label: 'Target Customer:', value: report.targetCustomer || 'Not specified' },
    { label: 'Pricing Model:', value: report.pricing || 'Not specified' },
    { label: 'Differentiation:', value: report.differentiation || 'Not specified' },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  doc.text('1. Offer Foundation & Snapshot', margin, currentY);
  currentY += 4;

  let snapshotY = currentY;
  // Estimate height
  let estimatedSnapHeight = 10;
  snapshotItems.forEach(item => {
    const lines = doc.splitTextToSize(`${item.label} ${item.value}`, contentWidth - 10);
    estimatedSnapHeight += lines.length * 4.5 + 1;
  });

  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  doc.roundedRect(margin, snapshotY, contentWidth, estimatedSnapHeight, 2, 2, 'FD');

  let curItemY = snapshotY + 6;
  snapshotItems.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.text(`• ${item.label}`, margin + 4, curItemY);

    const labelWidth = doc.getTextWidth(`• ${item.label} `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

    const valLines = doc.splitTextToSize(item.value, contentWidth - labelWidth - 8);
    doc.text(valLines[0] || '', margin + 4 + labelWidth, curItemY);

    for (let k = 1; k < valLines.length; k++) {
      curItemY += 4.5;
      doc.text(valLines[k], margin + 8, curItemY);
    }
    curItemY += 5;
  });

  currentY = snapshotY + estimatedSnapHeight + 6;

  // --- 5-PILLAR SCORING BREAKDOWN ---
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  doc.text('2. 5-Pillar Score Breakdown', margin, currentY);
  currentY += 4;

  const pillars = [
    { title: 'Problem Clarity', ...report.scoringBreakdown.problemClarity },
    { title: 'Audience Specificity', ...report.scoringBreakdown.customerSpecificity },
    { title: 'Pricing Strategy', ...report.scoringBreakdown.pricingConfidence },
    { title: 'Unique Advantage', ...report.scoringBreakdown.differentiationStrength },
    { title: 'Demand Evidence', ...report.scoringBreakdown.demandEvidence },
  ];

  pillars.forEach(p => {
    const rationaleLines = doc.splitTextToSize(p.rationale || '', contentWidth - 32);
    const boxHeight = Math.max(13, 8 + rationaleLines.length * 4);
    checkPageBreak(boxHeight + 2);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    // Score badge
    const badgeBgCol = p.score === 2 ? COLOR_GREEN_BG : p.score === 1 ? COLOR_AMBER_BG : COLOR_RED_BG;
    const badgeTextCol = p.score === 2 ? COLOR_GREEN : p.score === 1 ? COLOR_AMBER : COLOR_RED;
    doc.setFillColor(badgeBgCol[0], badgeBgCol[1], badgeBgCol[2]);
    doc.roundedRect(margin + contentWidth - 18, currentY + 3, 14, 6, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(badgeTextCol[0], badgeTextCol[1], badgeTextCol[2]);
    doc.text(`${p.score} / 2`, margin + contentWidth - 11, currentY + 7.2, { align: 'center' });

    // Pillar title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
    doc.text(p.title, margin + 4, currentY + 6);

    // Rationale text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(rationaleLines, margin + 4, currentY + 11);

    currentY += boxHeight + 2.5;
  });

  currentY += 4;

  // --- STRENGTHS & WEAKNESSES ---
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  doc.text('3. Strengths & Vulnerability Analysis', margin, currentY);
  currentY += 4;

  const colWidth = (contentWidth - 4) / 2;
  const strengthsYStart = currentY;

  // Strengths column
  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);

  let strengthsTextLines: string[][] = report.strengths.map(s =>
    doc.splitTextToSize(`✓ ${s}`, colWidth - 8)
  );
  let totalStrengthsHeight = 12 + strengthsTextLines.reduce((acc, lines) => acc + lines.length * 4 + 2, 0);

  let weaknessesTextLines: string[][] = report.weaknesses.map(w =>
    doc.splitTextToSize(`! ${w}`, colWidth - 8)
  );
  let totalWeaknessesHeight = 12 + weaknessesTextLines.reduce((acc, lines) => acc + lines.length * 4 + 2, 0);

  const maxColHeight = Math.max(totalStrengthsHeight, totalWeaknessesHeight, 28);
  checkPageBreak(maxColHeight + 4);

  // Left column: Strengths
  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.roundedRect(margin, currentY, colWidth, maxColHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
  doc.text('VALIDATED STRENGTHS', margin + 4, currentY + 7);

  let sY = currentY + 13;
  report.strengths.forEach((s) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    const lines = doc.splitTextToSize(`• ${s}`, colWidth - 8);
    doc.text(lines, margin + 4, sY);
    sY += lines.length * 4 + 2;
  });

  // Right column: Weaknesses
  const rightColX = margin + colWidth + 4;
  doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
  doc.roundedRect(rightColX, currentY, colWidth, maxColHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_RED[0], COLOR_RED[1], COLOR_RED[2]);
  doc.text('FRICTION & VULNERABILITIES', rightColX + 4, currentY + 7);

  let wY = currentY + 13;
  report.weaknesses.forEach((w) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    const lines = doc.splitTextToSize(`• ${w}`, colWidth - 8);
    doc.text(lines, rightColX + 4, wY);
    wY += lines.length * 4 + 2;
  });

  currentY += maxColHeight + 6;

  // --- REFINEMENT PROTOCOL ---
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
  doc.text('4. Offer Refinement Protocol (Priority Actions)', margin, currentY);
  currentY += 4;

  report.offerRefinement.forEach((ref) => {
    const actionLines = doc.splitTextToSize(`Action: ${ref.action}`, contentWidth - 10);
    const currLines = doc.splitTextToSize(`Current: ${ref.currentState}`, (contentWidth - 14) / 2);
    const targetLines = doc.splitTextToSize(`Target: ${ref.targetState}`, (contentWidth - 14) / 2);
    const middleHeight = Math.max(currLines.length, targetLines.length) * 3.8;
    const cardHeight = 12 + middleHeight + actionLines.length * 3.8 + 6;

    checkPageBreak(cardHeight + 2);

    doc.setFillColor(COLOR_CARD_BG[0], COLOR_CARD_BG[1], COLOR_CARD_BG[2]);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.roundedRect(margin, currentY, contentWidth, cardHeight, 1.5, 1.5, 'FD');

    // Priority badge
    doc.setFillColor(COLOR_GOLD_BG[0], COLOR_GOLD_BG[1], COLOR_GOLD_BG[2]);
    doc.roundedRect(margin + 4, currentY + 3, 16, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(COLOR_AMBER[0], COLOR_AMBER[1], COLOR_AMBER[2]);
    doc.text(`P${ref.priority} IMPACT`, margin + 12, currentY + 6.6, { align: 'center' });

    // Issue Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
    const cleanIssue = ref.issue ? ref.issue.replace(/^Priority\s*\d+:\s*/i, '') : 'Refinement';
    doc.text(cleanIssue, margin + 23, currentY + 6.8);

    // Current vs Target
    const rowY = currentY + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text('CURRENT STATE:', margin + 4, rowY);
    doc.text('TARGET STATE:', margin + 4 + contentWidth / 2, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    doc.text(currLines, margin + 4, rowY + 3.8);
    doc.text(targetLines, margin + 4 + contentWidth / 2, rowY + 3.8);

    // High Impact Action box
    const actionBoxY = rowY + middleHeight + 4;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.roundedRect(margin + 4, actionBoxY, contentWidth - 8, actionLines.length * 3.8 + 4, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_AMBER[0], COLOR_AMBER[1], COLOR_AMBER[2]);
    doc.text('RECOMMENDED ACTION:', margin + 6, actionBoxY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    const actionBodyLines = doc.splitTextToSize(ref.action, contentWidth - 14);
    doc.text(actionBodyLines, margin + 6, actionBoxY + 7.5);

    currentY += cardHeight + 3;
  });

  currentY += 3;

  // --- MARKET-MESSAGE MATCH ---
  if (report.marketMessageMatch) {
    checkPageBreak(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
    doc.text('5. Market-Message Match (Positioning Formula)', margin, currentY);
    currentY += 4;

    const messageLines = doc.splitTextToSize(`"${report.marketMessageMatch}"`, contentWidth - 12);
    const boxH = Math.max(16, messageLines.length * 4.5 + 8);

    doc.setFillColor(COLOR_HEADER[0], COLOR_HEADER[1], COLOR_HEADER[2]);
    doc.roundedRect(margin, currentY, contentWidth, boxH, 2, 2, 'F');

    // Left gold bar
    doc.setFillColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.rect(margin, currentY, 2.5, boxH, 'F');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(messageLines, margin + 6, currentY + 7);

    currentY += boxH + 6;
  }

  // --- FOOTERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Render running header for pages 2+
    if (i > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
      doc.text('BRIDGE // SOVEREIGN VALIDATION NODE', margin, 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      const safeOffer = report.offerName ? report.offerName.substring(0, 45) : 'Validation Artifact';
      doc.text(safeOffer, pageWidth - margin, 10, { align: 'right' });

      doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, 12, pageWidth - margin, 12);
    }

    // Bottom running footer on every page
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(
      'BRIDGE Sovereign Node (BB) • Saved for Offline Verification • Confidential',
      margin,
      pageHeight - 8
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Trigger download in browser
  const safeTitle = (report.offerName || 'Validation_Report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = `${safeTitle || 'validation'}-report.pdf`;

  doc.save(fileName);
}
