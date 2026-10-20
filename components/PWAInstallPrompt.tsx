import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  Share, 
  PlusSquare, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Laptop, 
  ExternalLink, 
  ArrowRight, 
  Info, 
  Copy, 
  Check,
  ChevronRight
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallPromptProps {
  /** Optional variant for backwards compatibility. Defaults to the scroll-delayed animated pop-up. */
  variant?: 'popup' | 'floating-toast' | 'banner' | 'header-button';
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isStandalone, isInIframe, install } = usePWAInstall();
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Initialize dismissed state from sessionStorage
  useEffect(() => {
    try {
      if (sessionStorage.getItem('bridge_pwa_prompt_dismissed') === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Delay prompt until the user scrolls down
  useEffect(() => {
    let triggered = false;

    const triggerPrompt = () => {
      if (!triggered) {
        triggered = true;
        setHasScrolledDown(true);
      }
    };

    // 1. Check window/document scroll offset
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollY > 50) {
        triggerPrompt();
      }
    };

    // 2. Detect downward wheel movement
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        triggerPrompt();
      }
    };

    // 3. Detect touch swipe up (which scrolls page down)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const currentY = e.touches[0].clientY;
        if (touchStartY - currentY > 35) {
          triggerPrompt();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Check if page is already scrolled on mount
    const initialScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (initialScrollY > 50) {
      triggerPrompt();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleDismiss = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bridge_pwa_prompt_dismissed', 'true');
    } catch {
      // Ignore
    }
    if (onClose) onClose();
  }, [onClose]);

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // Only hide if verified standalone app outside iframe
  const isAlreadyActiveInStandalone = isStandalone && !isInIframe && isInstalled;
  const isVisible = hasScrolledDown && !isDismissed && !isAlreadyActiveInStandalone;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            key="pwa-install-popup"
            aria-label="Install BRIDGE App prompt"
            initial={{
              opacity: 0,
              y: 75,
              scale: 0.72,
              rotate: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              y: 40,
              rotate: 6,
              transition: { duration: 0.22, ease: 'easeIn' },
            }}
            transition={{
              opacity: { duration: 0.25, ease: 'easeOut' },
              y: {
                type: 'spring',
                stiffness: 240,
                damping: 17,
                mass: 0.85,
              },
              scale: {
                type: 'spring',
                stiffness: 260,
                damping: 18,
                mass: 0.85,
              },
              rotate: {
                type: 'spring',
                stiffness: 210,
                damping: 15, // Creates a lively, fluid twist with smooth natural deceleration
                mass: 0.85,
              },
            }}
            whileHover={{ scale: 1.015 }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-2xl bg-gradient-to-br from-[#0e1320]/95 via-[#0c101a]/95 to-[#131929]/95 backdrop-blur-2xl border border-bridge-gold/50 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,215,0,0.22)] text-white select-none overflow-hidden"
          >
            {/* Ambient gold glow highlight line across the top */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-bridge-gold to-transparent opacity-90 animate-pulse" />
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-bridge-gold/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Playful bouncing icon with animated live beacon */}
                <motion.div
                  initial={{ rotate: -25, scale: 0.4, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 17,
                    delay: 0.08,
                  }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-bridge-card to-bridge-gold/25 border border-bridge-gold/50 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,215,0,0.25)] relative"
                >
                  <Smartphone className="w-5 h-5 text-bridge-gold" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-bridge-dark"></span>
                  </span>
                </motion.div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-bridge-gold font-bold">
                      INSTALL PWA
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-bridge-gold/15 text-bridge-gold border border-bridge-gold/30">
                      Offline Ready
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-white tracking-tight">
                    Add BRIDGE to Home Screen
                  </h4>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="text-bridge-subtext hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Dismiss prompt"
                aria-label="Dismiss prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="relative z-10 mt-2.5 text-xs text-bridge-subtext leading-relaxed">
              Launch directly from your home screen with zero browser bars, instant cached rubric loads, and offline diagnostic support.
            </p>

            {/* Action Buttons */}
            <div className="relative z-10 mt-3.5 flex items-center gap-2">
              <button
                onClick={handleTriggerInstall}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-bridge-gold via-amber-400 to-bridge-gold hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs uppercase tracking-wider shadow-lg shadow-bridge-gold/25 transition cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-bridge-subtext hover:text-white transition cursor-pointer inline-flex items-center gap-1"
              >
                <span>Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If embedded in preview iframe, provide clear direct tab link */}
            {isInIframe && (
              <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300/90">
                <span>Preview Mode</span>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-bridge-gold hover:underline font-semibold"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Multi-Platform Step-by-Step Installation Modal */}
      {showModal && <PWAInstallModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export const PWAInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isInstallable, isIOS, isInIframe, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(isIOS ? 'ios' : 'android');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-bridge-card border border-bridge-gold/40 p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bridge-subtext hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-bridge-gold/15 border border-bridge-gold/40 flex items-center justify-center text-bridge-gold shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-bridge-gold">
              Progressive Web App
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Install BRIDGE on Your Device</h3>
          </div>
        </div>

        {/* Value props */}
        <div className="space-y-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-xs text-bridge-subtext">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Standalone Window:</strong> Runs full-screen with no browser address bars, tabs, or menus.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Home Screen Icon:</strong> Launches with 1 tap straight from your apps or home screen.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Offline Resilient:</strong> Review offer frameworks and access cached diagnostics anywhere.</p>
          </div>
        </div>

        {/* Direct One-Click Install if Browser Prompt is ready */}
        {isInstallable && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-bridge-gold/15 to-amber-500/10 border border-bridge-gold/40 space-y-2">
            <p className="text-xs text-bridge-gold font-bold flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Ready for Direct 1-Click Install
            </p>
            <p className="text-[11px] text-bridge-subtext">
              Your browser supports direct installation. Click below to launch the native prompt.
            </p>
            <button
              onClick={async () => {
                const res = await install();
                if (res) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 text-bridge-dark font-bold text-xs uppercase tracking-wider hover:opacity-95 transition cursor-pointer shadow-lg shadow-bridge-gold/20 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Install BRIDGE Now</span>
            </button>
          </div>
        )}

        {/* If inside preview iframe, provide direct open tab option */}
        {isInIframe && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Info className="w-4 h-4 text-bridge-gold shrink-0" />
              <span>Preview Mode Notice</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed">
              Browsers restrict native PWA installation prompts within embedded preview frames. To install directly to your device or home screen, open in a full browser tab:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-bridge-gold text-bridge-dark font-bold text-xs hover:bg-amber-300 transition"
              >
                <span>Open in Full Browser Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition cursor-pointer"
                title="Copy App URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div>
          <div className="flex border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${activeTab === 'android' ? 'border-bridge-gold text-bridge-gold' : 'border-transparent text-bridge-subtext hover:text-white'}`}
            >
              Android / Chrome
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${activeTab === 'ios' ? 'border-bridge-gold text-bridge-gold' : 'border-transparent text-bridge-subtext hover:text-white'}`}
            >
              iPhone & iPad
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${activeTab === 'desktop' ? 'border-bridge-gold text-bridge-gold' : 'border-transparent text-bridge-subtext hover:text-white'}`}
            >
              Mac / PC / Laptop
            </button>
          </div>

          <div className="pt-3">
            {activeTab === 'android' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-bridge-subtext">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Google Chrome, Samsung Internet, or Brave:</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Tap the <strong className="text-white">three dots menu (⋮)</strong> in the top-right corner.</li>
                  <li>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
                  <li>Tap <strong className="text-white">Install</strong> when prompted to add the BRIDGE icon.</li>
                </ol>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-bridge-subtext">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-bridge-gold" />
                  <span>Safari on iOS (iPhone & iPad):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-blue-400" /> Share</strong> button in Safari's bottom toolbar.</li>
                  <li>Scroll down and tap <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-bridge-gold" /> Add to Home Screen</strong>.</li>
                  <li>Tap <strong className="text-white">Add</strong> in the top-right corner. The BRIDGE icon will appear on your home screen.</li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-bridge-subtext">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span>Desktop (Chrome, Edge, Brave):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Look for the <strong className="text-white">Install icon (computer/arrow or ⊕)</strong> on the right side of your browser's URL address bar.</li>
                  <li>Click <strong className="text-white">Install</strong> to add BRIDGE to your desktop apps or dock.</li>
                  <li>Alternatively, open browser menu (⋮) → <strong className="text-white">"Cast, save, and share"</strong> → <strong className="text-white">"Install page as app"</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-bridge-subtext hover:text-white transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
