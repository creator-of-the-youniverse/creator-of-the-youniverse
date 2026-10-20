import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ValidationReport } from '../types';
import { Button } from './Button';
import { Check, AlertTriangle, TrendingUp, Send, Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { GitHubSyncModal } from './GitHubSyncModal';
import { downloadReportAsPDF } from '../services/pdfExport';

interface ReportViewProps {
  report: ValidationReport;
  onCommit: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onCommit }) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [showGitHubSync, setShowGitHubSync] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadReportAsPDF(report);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCommit = () => {
    setIsCommitting(true);
    // Simulate API delay
    setTimeout(() => {
      onCommit();
    }, 1500);
  };

  const ScoreCard = ({ label, score, rationale }: { label: string; score: number; rationale: string }) => (
    <div className="bg-white/5 border border-white/5 p-4 rounded-sm hover:border-bridge-gold/20 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-bridge-text uppercase tracking-wider">{label}</h4>
        <div className={clsx(
          "px-2 py-0.5 text-xs font-bold rounded-full",
          score === 2 ? "bg-green-500/20 text-green-400" :
          score === 1 ? "bg-yellow-500/20 text-yellow-400" :
          "bg-red-500/20 text-red-400"
        )}>
          {score}/2
        </div>
      </div>
      <p className="text-xs text-bridge-subtext leading-relaxed">{rationale}</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12 border-b border-white/10 pb-8">
          <div className="inline-block px-3 py-1 border border-bridge-gold/30 rounded-full bg-bridge-gold/5 mb-4">
            <span className="text-xs font-bold text-bridge-gold tracking-[0.2em] uppercase">Validation Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
            {report.offerName || "Offer Analysis"}
          </h1>
          <div className="flex items-center justify-center gap-4 text-bridge-subtext text-sm flex-wrap">
            <span>Generated: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>Node ID: BB</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Offline Ready
            </span>
          </div>

          {/* Quick PDF Action in Header */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm",
                pdfDownloaded
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-bridge-gold/10 hover:bg-bridge-gold/20 border border-bridge-gold/30 text-bridge-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.25)]"
              )}
              title="Save validation results offline as high-resolution PDF document"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : pdfDownloaded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PDF Saved to Device!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report as PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Score Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="md:col-span-1 bg-gradient-to-br from-bridge-card to-bridge-dark border border-bridge-gold/20 p-8 flex flex-col items-center justify-center relative overflow-hidden rounded-sm group">
            <div className="absolute inset-0 bg-bridge-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-bridge-subtext text-xs uppercase tracking-widest mb-4">Validation Score</h3>
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * report.validationScore) / 10}
                  className="text-bridge-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-bold text-white">{report.validationScore}</span>
                <span className="text-xs text-bridge-subtext">/ 10.0</span>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScoreCard label="Problem Clarity" {...report.scoringBreakdown.problemClarity} />
            <ScoreCard label="Audience Specificity" {...report.scoringBreakdown.customerSpecificity} />
            <ScoreCard label="Pricing Strategy" {...report.scoringBreakdown.pricingConfidence} />
            <ScoreCard label="Unique Advantage" {...report.scoringBreakdown.differentiationStrength} />
            <ScoreCard label="Demand Evidence" {...report.scoringBreakdown.demandEvidence} />
          </div>
        </div>

        {/* Artifact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Strengths & Weaknesses */}
          <div className="space-y-6">
            <div className="bg-bridge-card/50 border border-white/5 p-6 rounded-sm">
              <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-white mb-4">
                <Check className="w-5 h-5 text-green-400" /> Strengths
              </h3>
              <ul className="space-y-3">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-bridge-subtext">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bridge-card/50 border border-white/5 p-6 rounded-sm">
              <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-white mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Weaknesses
              </h3>
              <ul className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-bridge-subtext">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Refinement Plan */}
          <div className="bg-bridge-card/50 border border-bridge-gold/10 p-6 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-bridge-gold/5 blur-[50px] pointer-events-none" />
            <h3 className="flex items-center gap-2 text-lg font-serif font-bold text-white mb-6">
              <TrendingUp className="w-5 h-5 text-bridge-gold" /> Offer Refinement Protocol
            </h3>
            
            <div className="space-y-6">
              {report.offerRefinement.map((refinement, i) => (
                <div key={i} className="relative pl-6 border-l border-white/10 hover:border-bridge-gold/50 transition-colors">
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-bridge-dark border border-bridge-gold/50" />
                  <h4 className="text-sm font-bold text-white mb-1">
                    <span className="text-bridge-gold mr-2">P{refinement.priority}</span>
                    {refinement.issue}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                    <div>
                      <span className="block text-bridge-subtext mb-1 uppercase text-[10px]">Current</span>
                      <p className="text-white/70">{refinement.currentState}</p>
                    </div>
                    <div>
                      <span className="block text-bridge-subtext mb-1 uppercase text-[10px]">Target</span>
                      <p className="text-white">{refinement.targetState}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-white/5 p-3 rounded-sm border border-white/5">
                     <span className="text-bridge-gold text-xs font-bold uppercase mr-2">Action:</span>
                     <span className="text-xs text-white/90">{refinement.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Message Match */}
        <div className="bg-gradient-to-r from-bridge-card to-bridge-dark border border-white/10 p-8 rounded-sm text-center">
          <h3 className="text-sm font-bold text-bridge-subtext uppercase tracking-widest mb-4">Market-Message Match</h3>
          <p className="text-lg md:text-xl font-serif text-white leading-relaxed italic">
            "{report.marketMessageMatch}"
          </p>
        </div>

        {/* Action Area */}
        <div className="sticky bottom-4 md:bottom-8 flex flex-col items-center justify-center z-50 px-4">
          {pdfDownloaded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shadow-lg backdrop-blur-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Validation Report saved offline as PDF</span>
            </motion.div>
          )}

          <div className="bg-bridge-dark/95 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto max-w-full">
            {/* Primary Action: Download Report as PDF */}
            <Button 
              onClick={handleDownloadPdf}
              isLoading={isDownloadingPdf}
              className={clsx(
                "w-full sm:w-auto min-w-[220px] font-bold transition-all shadow-md",
                pdfDownloaded 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-r from-bridge-gold to-amber-400 text-bridge-dark hover:shadow-[0_0_20px_rgba(255,215,0,0.35)]"
              )}
              title="Save validation results offline as high-resolution PDF document"
            >
              {pdfDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>PDF Saved (Download Again)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-bridge-dark" />
                  <span>Download Report as PDF</span>
                </>
              )}
            </Button>

            {/* Export Markdown / CLI */}
            <Button 
              variant="secondary"
              onClick={() => setShowGitHubSync(true)} 
              className="w-full sm:w-auto min-w-[170px] text-xs font-semibold border-white/10 hover:border-bridge-gold/40"
            >
              <FileText className="w-4 h-4 text-bridge-gold" />
              <span>Export & Markdown</span>
            </Button>

            {/* Commit to NotNotes */}
            <Button 
              variant="secondary"
              onClick={handleCommit} 
              isLoading={isCommitting}
              className="w-full sm:w-auto min-w-[170px] text-xs font-semibold"
            >
              {isCommitting ? (
                 <span className="flex items-center">Committing Artifact...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Commit to NotNotes
                </>
              )}
            </Button>
          </div>
        </div>

        {showGitHubSync && (
          <GitHubSyncModal report={report} onClose={() => setShowGitHubSync(false)} />
        )}

      </motion.div>
    </div>
  );
};
