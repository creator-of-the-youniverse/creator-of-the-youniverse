import React, { useState } from 'react';
import { Download, Copy, Check, FileText, X, Loader2, FileDown } from 'lucide-react';
import { ValidationReport } from '../types';
import { downloadReportAsPDF } from '../services/pdfExport';

interface GitHubSyncModalProps {
  report: ValidationReport;
  onClose: () => void;
}

export function formatReportAsMarkdown(report: ValidationReport): string {
  const timestamp = new Date().toISOString();
  return `# BRIDGE Validation Report: ${report.offerName}
*Generated on ${timestamp} via BRIDGE Sovereign Node (BB)*

---

## 🎯 Offer Snapshot
- **Offer Name:** ${report.offerName}
- **Primary Problem Solved:** ${report.coreProblem}
- **Target Customer:** ${report.targetCustomer}
- **Pricing & Model:** ${report.pricing}
- **Differentiation:** ${report.differentiation}

---

## ⚖️ Validation Score: ${report.validationScore} / 10

### Scoring Breakdown
- **Problem Clarity:** ${report.scoringBreakdown.problemClarity.score}/2
  > ${report.scoringBreakdown.problemClarity.rationale}
- **Audience Specificity:** ${report.scoringBreakdown.customerSpecificity.score}/2
  > ${report.scoringBreakdown.customerSpecificity.rationale}
- **Pricing Confidence:** ${report.scoringBreakdown.pricingConfidence.score}/2
  > ${report.scoringBreakdown.pricingConfidence.rationale}
- **Unique Advantage:** ${report.scoringBreakdown.differentiationStrength.score}/2
  > ${report.scoringBreakdown.differentiationStrength.rationale}
- **Demand Evidence:** ${report.scoringBreakdown.demandEvidence.score}/2
  > ${report.scoringBreakdown.demandEvidence.rationale}

---

## 🚀 Offer Strengths
${report.strengths.map(s => `- ✅ ${s}`).join('\n')}

---

## ⚠️ Weaknesses & Friction Points
${report.weaknesses.map(w => `- ⚠️ ${w}`).join('\n')}

---

## 🛠️ Action Priorities (Impact Refinements)
${report.offerRefinement.map(r => `### Priority ${r.priority}: ${r.issue}
- **Current State:** ${r.currentState}
- **Target State:** ${r.targetState}
- **Action:** ${r.action}`).join('\n\n')}

---

## 📣 Market-Message Match
> "${report.marketMessageMatch}"
`;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const markdownContent = formatReportAsMarkdown(report);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = report.offerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `validation-${safeTitle || 'report'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadReportAsPDF(report);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF from modal:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-bridge-card border border-bridge-gold/30 p-6 sm:p-7 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-bridge-subtext hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bridge-gold/20 to-amber-500/10 border border-bridge-gold/40 flex items-center justify-center text-bridge-gold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-bridge-gold">
                Export Artifact
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono">
                PDF Ready
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono">
                Markdown
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Export Validation Report</h3>
            <p className="text-xs text-bridge-subtext">
              Save or export your complete diagnostic breakdown, scorecards, and action refinements for offline reference.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Primary PDF Download */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 text-bridge-dark font-bold text-xs uppercase tracking-wider hover:opacity-95 transition cursor-pointer shadow-md shadow-bridge-gold/20"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-bridge-dark" />
                <span>Generating...</span>
              </>
            ) : pdfDownloaded ? (
              <>
                <Check className="w-4 h-4 text-bridge-dark" />
                <span>PDF Saved!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-bridge-dark" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Markdown file download */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wide transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-bridge-gold" />
            <span>Download .MD</span>
          </button>

          {/* Copy to clipboard */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wide transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-bridge-gold" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        </div>

        {/* Markdown Preview */}
        <div className="space-y-2 bg-black/40 border border-white/10 rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-bridge-subtext">Report Preview</span>
            <span className="text-[10px] text-bridge-subtext font-mono">Score: {report.validationScore}/10</span>
          </div>
          <pre className="font-mono text-[11px] text-white/70 overflow-x-auto max-h-48 whitespace-pre p-2 bg-black/50 rounded-lg">
            {markdownContent}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-bridge-subtext hover:text-white transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
