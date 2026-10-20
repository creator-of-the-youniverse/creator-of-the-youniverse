import React, { useState } from 'react';
import { GitBranch, ExternalLink, Download, Copy, Check, Send, AlertCircle, Sparkles, X } from 'lucide-react';
import { ValidationReport } from '../types';

interface GitHubSyncModalProps {
  report: ValidationReport;
  onClose: () => void;
}

export const GITHUB_REPO_URL = 'https://github.com/creator-of-the-youniverse/validation.git';
export const GITHUB_WEB_URL = 'https://github.com/creator-of-the-youniverse/validation';

export function formatReportAsMarkdown(report: ValidationReport): string {
  const timestamp = new Date().toISOString();
  return `# BRIDGE Validation Report: ${report.offerName}
*Generated on ${timestamp} via BRIDGE Sovereign Node*
*Target Repository: [creator-of-the-youniverse/validation](${GITHUB_WEB_URL})*

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
${report.offerRefinement.map(r => `### Priority ${r.priority}: ${r.issue}\n- **Current State:** ${r.currentState}\n- **Target State:** ${r.targetState}\n- **Action:** ${r.action}`).join('\n\n')}

---

## 📣 Market-Message Match
> "${report.marketMessageMatch}"
`;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

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

  const handleOpenGitHubIssue = () => {
    const title = encodeURIComponent(`[Validation Report] ${report.offerName} (Score: ${report.validationScore}/10)`);
    const body = encodeURIComponent(markdownContent);
    const issueUrl = `${GITHUB_WEB_URL}/issues/new?title=${title}&body=${body}`;
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
  };

  const gitCliCommand = `git remote add origin ${GITHUB_REPO_URL} 2>/dev/null || git remote set-url origin ${GITHUB_REPO_URL}
git add .
git commit -m "feat(validation): report for ${report.offerName.replace(/"/g, '')}"
git push -u origin main`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCliCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Direct GitHub API file commit option
  const handleDirectCommit = async () => {
    if (!githubToken.trim()) {
      setSendError('Please enter a GitHub Personal Access Token (classic or fine-grained) with repo permissions.');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const owner = 'creator-of-the-youniverse';
      const repo = 'validation';
      const safeTitle = report.offerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `reports/validation-${safeTitle || 'report'}-${Date.now()}.md`;
      const contentBase64 = btoa(unescape(encodeURIComponent(markdownContent)));

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken.trim()}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add validation report for ${report.offerName}`,
          content: contentBase64,
          branch: 'main',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub API error: HTTP ${response.status}`);
      }

      const resData = await response.json();
      setSendSuccess(`Successfully committed report to ${GITHUB_WEB_URL}/blob/main/${filename}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSendError(msg);
    } finally {
      setIsSending(false);
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
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-bridge-gold">
                Repository Sync
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                creator-of-the-youniverse/validation
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Send Validation Report to GitHub</h3>
            <p className="text-xs text-bridge-subtext">
              Target repository: <a href={GITHUB_WEB_URL} target="_blank" rel="noreferrer" className="text-bridge-gold hover:underline inline-flex items-center gap-1 font-mono">{GITHUB_REPO_URL} <ExternalLink className="w-3 h-3" /></a>
            </p>
          </div>
        </div>

        {/* Option 1: 1-Click GitHub Issue / Submission */}
        <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-bridge-gold">
              Method 1: 1-Click Send via GitHub Issue / RFC
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">Instant & No Token Required</span>
          </div>
          <p className="text-xs text-bridge-subtext">
            Automatically opens a new report submission in the validation repository with the complete score, breakdown, and action items pre-formatted.
          </p>
          <button
            onClick={handleOpenGitHubIssue}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 text-bridge-dark font-bold text-xs uppercase tracking-wider hover:opacity-95 transition cursor-pointer shadow-md shadow-bridge-gold/20"
          >
            <Send className="w-4 h-4" />
            <span>Open & Send Issue on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Option 2: Direct Commit via GitHub API */}
        <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-bridge-gold">
              Method 2: Direct Repository File Commit
            </span>
            <span className="text-[10px] text-bridge-subtext">Automated Commit</span>
          </div>
          <p className="text-xs text-bridge-subtext">
            Commit markdown file directly to <code className="text-white/80 bg-white/5 px-1 rounded">main:reports/validation-{report.offerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md</code>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              placeholder="Paste GitHub Personal Access Token (repo scope)"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-bridge-gold/50 font-mono"
            />
            <button
              onClick={handleDirectCommit}
              disabled={isSending || !githubToken}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs tracking-wide transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-3.5 h-3.5 text-bridge-gold" />
                  <span>Commit File</span>
                </>
              )}
            </button>
          </div>
          {sendSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sendSuccess}</span>
            </div>
          )}
          {sendError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sendError}</span>
            </div>
          )}
        </div>

        {/* Option 3: Download Markdown & Copy Git CLI Command */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wide transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-bridge-gold" />
            <span>Download .MD Report</span>
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wide transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-bridge-gold" />
                <span>Copy Full Markdown</span>
              </>
            )}
          </button>
        </div>

        {/* Git CLI Snippet for Developers */}
        <div className="space-y-2 bg-black/40 border border-white/10 rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-bridge-subtext">CLI Git Push Script</span>
            <button
              onClick={handleCopyCmd}
              className="text-bridge-gold hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="font-mono text-[11px] text-white/70 overflow-x-auto whitespace-pre p-2 bg-black/50 rounded-lg">
            {gitCliCommand}
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
