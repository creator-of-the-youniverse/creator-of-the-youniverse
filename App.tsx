import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, ValidationReport } from './types';
import { generateBridgeReport } from './services/gemini';
import { QuestionFlow } from './components/QuestionFlow';
import { ReportView } from './components/ReportView';
import { Button } from './components/Button';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GITHUB_REPO_URL, GITHUB_WEB_URL } from './components/GitHubSyncModal';
import { GitBranch, ExternalLink, RefreshCw } from 'lucide-react';

// Utility to generate the raw text format for "NotNotes"
const generateArtifactText = (report: ValidationReport) => {
  return `
BRIDGE VALIDATION REPORT
Generated: ${new Date().toISOString()}

OFFER SNAPSHOT
Name: ${report.offerName}
Primary Problem: ${report.coreProblem}
Target Customer: ${report.targetCustomer}
Pricing: ${report.pricing}
Differentiation: ${report.differentiation}

VALIDATION SCORE: ${report.validationScore} / 10

Scoring Breakdown:
Problem Clarity: ${report.scoringBreakdown.problemClarity.score}/2 - ${report.scoringBreakdown.problemClarity.rationale}
Customer Specificity: ${report.scoringBreakdown.customerSpecificity.score}/2 - ${report.scoringBreakdown.customerSpecificity.rationale}
Pricing Confidence: ${report.scoringBreakdown.pricingConfidence.score}/2 - ${report.scoringBreakdown.pricingConfidence.rationale}
Unique Advantage: ${report.scoringBreakdown.differentiationStrength.score}/2 - ${report.scoringBreakdown.differentiationStrength.rationale}
Demand Evidence: ${report.scoringBreakdown.demandEvidence.score}/2 - ${report.scoringBreakdown.demandEvidence.rationale}

STRENGTHS
${report.strengths.map(s => `✅ ${s}`).join('\n')}

WEAKNESSES
${report.weaknesses.map(w => `⚠️ ${w}`).join('\n')}

OFFER REFINEMENT
${report.offerRefinement.map(r => `
Priority ${r.priority}: ${r.issue}
Current state: ${r.currentState}
Target state: ${r.targetState}
Action: ${r.action}
`).join('')}

MARKET-MESSAGE MATCH REPORT
${report.marketMessageMatch}

END OF REPORT
  `.trim();
};

export default function App() {
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const handleStart = () => {
    setState(AppState.QUESTIONS);
  };

  const handleQuestionsComplete = async (answers: string[]) => {
    setState(AppState.ANALYZING);
    try {
      const generatedReport = await generateBridgeReport(answers);
      setReport(generatedReport);
      setState(AppState.REPORT);
    } catch (error) {
      console.error("Failed to generate report", error);
      // In a real app, handle error state better. 
      // For now, reset to allow retry if needed or show alert.
      alert("Validation Node Offline. Please check your connection or API Key.");
      setState(AppState.WELCOME);
    }
  };

  const handleCommit = () => {
    if (!report) return;
    
    // Simulate Handoff to NotNotes
    console.log("Hey Not, BRIDGE here. I have a validation report ready to commit.");
    console.log(generateArtifactText(report));
    
    setState(AppState.COMMITTING);
    setTimeout(() => {
      setState(AppState.FINISHED);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-bridge-dark text-bridge-text font-sans selection:bg-bridge-gold/30 selection:text-white overflow-x-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-bridge-card rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-bridge-gold/5 rounded-full blur-[120px] opacity-10" />
      </div>

      <header className="relative z-50 px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-white/5 bg-bridge-dark/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-bridge-gold/30 flex items-center justify-center rounded-xl bg-gradient-to-tr from-bridge-card to-bridge-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
             <span className="font-serif font-bold text-bridge-gold text-lg">B</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm tracking-[0.2em] font-bold text-white">BRIDGE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-bridge-gold border border-white/10 font-mono">v1.2</span>
            </div>
            <div className="text-[10px] text-bridge-subtext font-mono">SOVEREIGN NODE ID: BB</div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Target GitHub Repository connection */}
          <a
            href={GITHUB_WEB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-bridge-subtext hover:text-white transition group"
            title="Target: https://github.com/creator-of-the-youniverse/validation.git"
          >
            <GitBranch className="w-3.5 h-3.5 text-bridge-gold group-hover:rotate-12 transition-transform" />
            <span className="font-mono text-[11px] text-white/80">creator-of-the-youniverse/validation</span>
            <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white" />
          </a>

          {/* PWA Homescreen Action Button */}
          <PWAInstallPrompt variant="header-button" />
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center py-8 sm:py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto w-full mb-6">
          <PWAInstallPrompt variant="banner" />
        </div>

        <AnimatePresence mode="wait">
          {state === AppState.WELCOME && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-8"
            >
              <div className="inline-block mb-4">
                 <div className="h-[1px] w-20 bg-bridge-gold/50 mx-auto mb-4"></div>
                 <span className="text-bridge-gold text-xs uppercase tracking-[0.3em]">Offer Validation Protocol</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
                Validate Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">Offer-Market Fit</span>
              </h1>
              <p className="text-lg text-bridge-subtext max-w-md mx-auto leading-relaxed">
                A diagnostic tool to assess whether your offer hits a bleeding neck problem with enough clarity to convert.
              </p>
              <div className="pt-8">
                <Button onClick={handleStart} className="text-lg px-10 py-4">
                  Initiate Validation
                </Button>
              </div>
            </motion.div>
          )}

          {state === AppState.QUESTIONS && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <QuestionFlow onComplete={handleQuestionsComplete} />
            </motion.div>
          )}

          {state === AppState.ANALYZING && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-bridge-gold rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-xs font-bold text-white animate-pulse">AI</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-serif text-white mb-2">Generating Artifact</h2>
                <p className="text-bridge-subtext">Calculating validation score...</p>
              </div>
            </motion.div>
          )}

          {state === AppState.REPORT && report && (
            <motion.div
              key="report"
              className="w-full"
            >
              <ReportView report={report} onCommit={handleCommit} />
            </motion.div>
          )}

          {state === AppState.COMMITTING && (
             <motion.div
             key="committing"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex flex-col items-center justify-center space-y-4"
           >
             <div className="text-bridge-gold animate-pulse text-xl font-serif">Syncing with NotNotes...</div>
           </motion.div>
          )}

          {state === AppState.FINISHED && (
             <motion.div
             key="finished"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex flex-col items-center justify-center space-y-6 h-full"
           >
             <div className="text-center max-w-md mx-auto space-y-4">
               <div className="w-16 h-16 border border-bridge-gold rounded-full flex items-center justify-center mx-auto mb-4 text-bridge-gold shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h2 className="text-3xl font-serif text-white">Transmission Complete</h2>
               <p className="text-bridge-subtext text-sm">
                 Report committed and ready. You can also view or send validations directly to the target GitHub repository.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                 <Button onClick={() => { setReport(null); setState(AppState.WELCOME); }}>
                   <RefreshCw className="w-4 h-4 mr-2" /> Validate Another Offer
                 </Button>
                 <a
                   href={GITHUB_WEB_URL}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white tracking-wide transition cursor-pointer"
                 >
                   <GitBranch className="w-4 h-4 text-bridge-gold" />
                   <span>View Repository</span>
                   <ExternalLink className="w-3.5 h-3.5 text-white/50" />
                 </a>
               </div>
             </div>
           </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
