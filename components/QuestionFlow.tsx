import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { TextArea } from './Input';
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Globe } from 'lucide-react';
import { MarketPulseData } from '../types';

interface QuestionFlowProps {
  onComplete: (answers: string[]) => void;
  marketPulse?: MarketPulseData | null;
}

const QUESTIONS = [
  {
    id: 1,
    text: "What is your product or service, and what is the #1 problem it solves?",
    subtext: "Explain what you're selling and the primary headache, pain point, or desire it resolves.",
    placeholder: "e.g., We help agency owners generate 15 booked appointments per month using an automated outbound flow...",
    presets: [
      { label: "SaaS/Software", text: "A software tool that automates repetitive daily operations, eliminating 10+ hours of manual work." },
      { label: "Agency/Service", text: "A done-for-you service that designs and runs highly profitable advertising campaigns to scale sales." },
      { label: "High-Ticket", text: "Bespoke executive performance mentoring helping founders scale from $1M to $10M without burning out." },
      { label: "E-commerce", text: "An ultra-durable, premium water-filtering bottle designed to eliminate microplastics on the go." },
      { label: "Education/Course", text: "A step-by-step masterclass program teaching senior engineers how to ace full-stack system design interviews." }
    ]
  },
  {
    id: 2,
    text: "Who is your ideal customer segment?",
    subtext: "Be specific about who benefits most from your offer and who is highly motivated to pay for it.",
    placeholder: "e.g., High-growth B2B SaaS companies with over $100k Monthly Recurring Revenue...",
    presets: [
      { label: "B2B Mid-Market", text: "Mid-sized B2B marketing managers struggling to source high-quality inbound sales leads." },
      { label: "SaaS Founders", text: "Tech-savvy startup founders with $50k-$200k ARR looking to delegate their sales outreach." },
      { label: "Premium Buyer", text: "High-income professionals seeking exclusive wellness, health optimization, and status markers." },
      { label: "Eco Consumer", text: "Health-conscious millennial consumers who actively prioritize zero-waste sustainable products." },
      { label: "Self-Learners", text: "Aspiring software developers looking to secure their first high-paying remote job." }
    ]
  },
  {
    id: 3,
    text: "What is your pricing model and price point?",
    subtext: "Explain your price structure (e.g., subscription, retainer, one-time fee, performance split) and how it's justified.",
    placeholder: "e.g., $1,500/month flat retainer with a 3-month commitment...",
    presets: [
      { label: "SaaS Tier", text: "$49 per user / month billed monthly, with a 20% discount on annual plans." },
      { label: "Retainer + Setup", text: "$3,000 one-time onboarding setup fee, followed by a flat $2,000/month ongoing retainer." },
      { label: "Premium One-Time", text: "$5,000 one-time flat fee for full-service implementation and 30 days of support." },
      { label: "Performance Split", text: "$0 upfront cost, but we take a 15% revenue share on all newly generated customer sales." },
      { label: "High-Ticket", text: "$25,000 premium package covering personalized continuous hand-holding and premium deliverables." }
    ]
  },
  {
    id: 4,
    text: "Why would they buy from you over competitors?",
    subtext: "What makes you different? Specify your unique mechanism, special advantage, speed benefit, or unbeatable guarantee.",
    placeholder: "e.g., Unlike general agencies, we install our system inside your business and guarantee...",
    presets: [
      { label: "Speed & Automation", text: "Our proprietary AI integrations deliver completed assets in 48 hours instead of the standard 3 weeks." },
      { label: "No-Risk Guarantee", text: "If we don't double your current conversion rates in 60 days, you receive a full 100% refund." },
      { label: "Bespoke Quality", text: "Handcrafted using rare premium components and individually numbered with cryptographic authenticity." },
      { label: "All-in-One Tool", text: "Combines scheduling, invoicing, and reporting into a single system, replacing 4 expensive active tools." },
      { label: "Proven Authority", text: "Created by industry leaders who have already scaled 3 successful exits in this exact space." }
    ]
  },
  {
    id: 5,
    text: "What real evidence of customer demand do you have?",
    subtext: "Cite any paying sales, active beta users, warm waitlists, user feedback, or positive pre-orders.",
    placeholder: "e.g., We have 3 paying beta customers, and 120 people on our email waitlist...",
    presets: [
      { label: "Paid Beta Users", text: "We successfully onboarded 4 active beta customers who gladly paid our full target price." },
      { label: "High-Intent Waitlist", text: "Collected over 250 verified email sign-ups on our teaser landing page within 10 days of launching." },
      { label: "Interview Validation", text: "Conducted 15 direct discovery interviews where 12 participants confirmed this is their top 3 critical pain point." },
      { label: "Social Traction", text: "Our early prototype demo video generated 25,000 organic impressions and 80 request-for-access comments." },
      { label: "Pre-Orders", text: "Generated over $12,000 in early-bird pre-sales from our private professional network before building." }
    ]
  }
];

export const QuestionFlow: React.FC<QuestionFlowProps> = ({ onComplete, marketPulse }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  const handleNext = () => {
    if (!inputValue.trim()) return;

    const newAnswers = [...answers];
    newAnswers[currentStep] = inputValue;
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setInputValue("");
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative z-10">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between text-xs uppercase tracking-widest text-bridge-subtext mb-2 font-semibold">
          <span>Validation Sequence</span>
          <span>{currentStep + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-bridge-gold shadow-[0_0_10px_#FFD700]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3 leading-tight">
              {QUESTIONS[currentStep].text}
            </h2>
            <p className="text-bridge-subtext text-lg">
              {QUESTIONS[currentStep].subtext}
            </p>
          </div>

          <div className="space-y-3">
            {/* Live Market Pulse Context (if scanned) */}
            {marketPulse && (
              <div className="bg-gradient-to-r from-bridge-gold/10 via-[#131b2e] to-bridge-gold/5 border border-bridge-gold/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-bridge-gold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Market Pulse: {marketPulse.industry}</span>
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-400" />
                    Google Search Grounded
                  </span>
                </div>
                <div className="text-[11px] text-bridge-subtext flex items-center gap-1.5 flex-wrap">
                  <span className="text-white/80 font-medium">Trending keywords (tap to insert):</span>
                  {marketPulse.keywords.slice(0, 6).map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const snippet = kw.keyword;
                        setInputValue(prev => {
                          const trimmed = prev.trim();
                          if (!trimmed) return snippet;
                          return trimmed + (trimmed.endsWith('.') || trimmed.endsWith('?') || trimmed.endsWith('!') ? ' ' : '; ') + snippet;
                        });
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-bridge-gold/20 text-white/90 hover:text-white border border-white/10 hover:border-bridge-gold/40 text-[10px] font-mono cursor-pointer transition"
                      title={kw.context}
                    >
                      +{kw.keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={QUESTIONS[currentStep].placeholder}
              className="bg-bridge-card/50 border-white/5 focus:border-bridge-gold/30 min-h-[140px]"
            />

            {/* A plethora of quick choices */}
            <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.15em] text-bridge-gold font-bold">Quick-Select Ideas (Tap to fill/add)</span>
                <span className="text-[10px] text-bridge-subtext">Click any preset to build your offer answer instantly</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
                {QUESTIONS[currentStep].presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!inputValue.trim()) {
                        setInputValue(preset.text);
                      } else {
                        // Avoid duplicates if clicked multiple times
                        if (!inputValue.includes(preset.text)) {
                          setInputValue(prev => {
                            const trimmed = prev.trim();
                            return trimmed + (trimmed.endsWith('.') || trimmed.endsWith('?') || trimmed.endsWith('!') ? ' ' : '; ') + preset.text;
                          });
                        }
                      }
                      // Focus back to the input
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-bridge-gold/15 hover:text-white border border-white/5 hover:border-bridge-gold/30 text-left text-bridge-text leading-snug cursor-pointer transition-all duration-200"
                  >
                    <span className="font-semibold text-bridge-gold mr-1">{preset.label}:</span>
                    <span className="text-white/80">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleNext} 
              disabled={!inputValue.trim()}
              className="group"
            >
              {currentStep === QUESTIONS.length - 1 ? 'Analyze Offer' : 'Next Step'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
