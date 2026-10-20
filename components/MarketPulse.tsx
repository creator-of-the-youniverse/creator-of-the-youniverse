import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Sparkles, AlertCircle, ExternalLink, ArrowRight, RefreshCw, Zap, ShieldAlert, CheckCircle2, Globe, Flame } from 'lucide-react';
import { MarketPulseData, TrendingKeyword } from '../types';
import { fetchMarketPulse } from '../services/gemini';

interface MarketPulseProps {
  onStartValidationWithContext: (marketPulse: MarketPulseData) => void;
  activePulse: MarketPulseData | null;
  setActivePulse: (pulse: MarketPulseData | null) => void;
}

const PRESET_INDUSTRIES = [
  "AI & B2B SaaS",
  "High-Ticket Consulting",
  "Performance Marketing Agency",
  "Health & Longevity Tech",
  "E-Commerce & DTC Brands",
  "Creator Economy & Info-Products"
];

export const MarketPulse: React.FC<MarketPulseProps> = ({
  onStartValidationWithContext,
  activePulse,
  setActivePulse,
}) => {
  const [industryInput, setIndustryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<TrendingKeyword | null>(null);

  const handleFetch = async (targetIndustry: string) => {
    if (!targetIndustry.trim()) return;
    setIsLoading(true);
    setError(null);
    setSelectedKeyword(null);

    try {
      const data = await fetchMarketPulse(targetIndustry);
      setActivePulse(data);
      if (data.keywords.length > 0) {
        setSelectedKeyword(data.keywords[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to scan Google Search for market keywords. Please check your network and API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: string) => {
    setIndustryInput(preset);
    handleFetch(preset);
  };

  const getIntentBadgeColor = (intent: TrendingKeyword['intent']) => {
    switch (intent) {
      case 'Problem / Pain':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Solution / Buy':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Breakout Trend':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Competitor Comparison':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-white/10 text-white/80 border-white/20';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 text-left">
      {/* Container Box */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0F1422] to-[#0A0D16] border border-bridge-gold/30 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-bridge-gold to-transparent opacity-80" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bridge-gold/15 border border-bridge-gold/40 flex items-center justify-center text-bridge-gold shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Market Pulse
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-semibold text-blue-300">
                  <Globe className="w-3 h-3 text-blue-400" />
                  Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-bridge-subtext mt-0.5">
                Pulls live trending search queries, urgent buyer pain points, and competitive whitespaces before you validate.
              </p>
            </div>
          </div>

          {activePulse && !isLoading && (
            <button
              onClick={() => {
                setActivePulse(null);
                setIndustryInput('');
              }}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-bridge-subtext hover:text-white transition cursor-pointer border border-white/5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Industry</span>
            </button>
          )}
        </div>

        {/* Industry Selection & Search Input */}
        <div className="py-5 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-bridge-gold">
            {activePulse ? "Target Industry Analyzed" : "Select or Enter Your Target Industry"}
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bridge-subtext" />
              <input
                type="text"
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFetch(industryInput);
                  }
                }}
                placeholder="e.g. AI Workflow Automation, Remote Sales Agency, Clean Skincare..."
                disabled={isLoading}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-bridge-gold/50 disabled:opacity-50 transition"
              />
            </div>
            <button
              onClick={() => handleFetch(industryInput)}
              disabled={isLoading || !industryInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-bridge-dark border-t-transparent rounded-full animate-spin" />
                  <span>Searching Google...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Market Pulse</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          {!activePulse && (
            <div className="pt-2">
              <div className="text-[11px] text-bridge-subtext mb-2">Quick Industry Presets:</div>
              <div className="flex flex-wrap gap-2">
                {PRESET_INDUSTRIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-bridge-gold/15 hover:text-white border border-white/5 hover:border-bridge-gold/30 text-bridge-text transition cursor-pointer disabled:opacity-50"
                  >
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 mb-4 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <span className="font-semibold text-rose-200">Search Grounding Notice:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="py-8 space-y-4 text-center animate-pulse">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bridge-gold/10 text-bridge-gold border border-bridge-gold/20 text-xs">
              <div className="w-2 h-2 rounded-full bg-bridge-gold animate-ping" />
              <span>Querying Google Search Grounding & Extracting Real-Time Keywords...</span>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <div className="h-4 bg-white/5 rounded-full w-3/4 mx-auto" />
              <div className="h-4 bg-white/5 rounded-full w-1/2 mx-auto" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5" />
              ))}
            </div>
          </div>
        )}

        {/* Results Panel */}
        <AnimatePresence>
          {activePulse && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 pt-2"
            >
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-bridge-text leading-relaxed">
                <span className="font-semibold text-bridge-gold mr-1.5 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> Market Intelligence Brief:
                </span>
                <p className="text-white/90">{activePulse.summary}</p>
              </div>

              {/* Trending Keywords Cluster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-bridge-gold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Current Trending Search Keywords
                  </span>
                  <span className="text-[11px] text-bridge-subtext">Click any keyword to inspect search intent</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {activePulse.keywords.map((item, idx) => {
                    const isSelected = selectedKeyword?.keyword === item.keyword;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedKeyword(item)}
                        className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-bridge-gold/15 border-bridge-gold shadow-[0_0_15px_rgba(255,215,0,0.15)] text-white'
                            : 'bg-white/[0.02] border-white/5 hover:border-bridge-gold/30 hover:bg-white/[0.05] text-white/90'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getIntentBadgeColor(item.intent)}`}>
                            {item.intent}
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono font-medium">
                            {item.momentum}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white tracking-wide">
                          "{item.keyword}"
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Keyword Context Card */}
                {selectedKeyword && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-bridge-gold/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-bridge-gold">
                        Search Context for "{selectedKeyword.keyword}":
                      </span>
                      <span className="text-[10px] text-bridge-subtext font-mono">
                        {selectedKeyword.intent} • {selectedKeyword.momentum}
                      </span>
                    </div>
                    <p className="text-bridge-text leading-relaxed">
                      {selectedKeyword.context}
                    </p>
                  </div>
                )}
              </div>

              {/* Emerging Demands vs Saturated Clichés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emerging Demands */}
                <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>What Buyers Demand Now</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-100/90 leading-relaxed">
                    {activePulse.emergingDemands.map((demand, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{demand}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Saturated Clichés to Avoid */}
                <div className="p-4 rounded-xl bg-rose-500/[0.04] border border-rose-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Saturated Angles to Avoid</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-100/90 leading-relaxed">
                    {activePulse.saturatedAngles.map((angle, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{angle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Opportunity Gap */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-bridge-gold/15 via-amber-500/10 to-transparent border border-bridge-gold/40 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-bridge-gold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> High-Leverage Opportunity Whitespace
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {activePulse.opportunityGap}
                </p>
              </div>

              {/* Grounding Sources (Google Search Citations) */}
              {activePulse.sources.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="text-[11px] font-semibold text-bridge-subtext uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Google Search Grounding Sources ({activePulse.sources.length} indexed links)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activePulse.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-blue-300 hover:text-blue-200 border border-white/5 hover:border-blue-500/30 transition max-w-xs truncate"
                        title={src.title}
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Launch Action with Market Context */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <div className="text-xs text-bridge-subtext flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Context locked in for: <strong className="text-white">{activePulse.industry}</strong></span>
                </div>

                <button
                  onClick={() => onStartValidationWithContext(activePulse)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                >
                  <span>Start Validation with this Market Context</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
