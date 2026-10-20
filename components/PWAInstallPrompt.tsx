import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, Share, PlusSquare, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallPromptProps {
  variant?: 'banner' | 'header-button' | 'modal';
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ variant = 'banner', onClose }) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check local storage for dismissal
    const wasDismissed = sessionStorage.getItem('bridge_pwa_banner_dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('bridge_pwa_banner_dismissed', 'true');
    if (onClose) onClose();
  };

  // If already running inside standalone PWA, show verified badge or nothing
  if (isStandalone) {
    if (variant === 'header-button') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Homescreen App</span>
        </div>
      );
    }
    return null;
  }

  // Header quick-action button
  if (variant === 'header-button') {
    return (
      <>
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else {
              setShowModal(true);
            }
          }}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-bridge-gold/20 to-amber-500/20 hover:from-bridge-gold/30 hover:to-amber-500/30 border border-bridge-gold/40 hover:border-bridge-gold text-bridge-gold text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]"
          title="Lives on your homescreen — Install App"
        >
          <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-bridge-gold" />
          <span className="hidden sm:inline">Lives on Homescreen</span>
          <span className="sm:hidden">Install</span>
          <Download className="w-3 h-3 text-bridge-gold/70" />
        </button>

        {showModal && <PWAInstallModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // Don't show banner if dismissed or installed
  if (dismissed || isInstalled) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bridge-card via-[#151b2a] to-bridge-card border border-bridge-gold/30 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-fade-in my-4">
        {/* Subtle gold glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-bridge-gold to-transparent opacity-70" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 max-w-2xl">
            <div className="w-11 h-11 rounded-xl bg-bridge-gold/10 border border-bridge-gold/30 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-6 h-6 text-bridge-gold animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-bridge-gold">
                  PWA Ready
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bridge-gold/15 text-bridge-gold border border-bridge-gold/30">
                  Zero Browser Clutter
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                BRIDGE Lives On Your Homescreen
              </h3>
              <p className="text-xs sm:text-sm text-bridge-subtext leading-relaxed">
                Add to your phone or desktop for instant, distraction-free access. Validate any offer anywhere, even offline with cached evaluations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-1 md:pt-0">
            {isInstallable ? (
              <button
                onClick={install}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              >
                <Download className="w-4 h-4" />
                <span>Install to Homescreen</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              >
                <Smartphone className="w-4 h-4" />
                <span>How to Install</span>
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-2 text-bridge-subtext hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && <PWAInstallModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export const PWAInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-bridge-card border border-bridge-gold/30 p-6 shadow-2xl space-y-5 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bridge-subtext hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-bridge-gold/15 border border-bridge-gold/40 flex items-center justify-center text-bridge-gold">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-bridge-gold">
              Progressive Web App
            </div>
            <h3 className="text-lg font-bold text-white">Lives On Your Homescreen</h3>
          </div>
        </div>

        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs text-bridge-subtext">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Zero browser address bar:</strong> Operates as a native app with full viewport focus.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Always accessible:</strong> One tap from your phone home screen, iPad, or computer dock.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Offline resilient:</strong> Validations, rubric guidance, and quick choices work anywhere.</p>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2.5 text-xs text-amber-200">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>Install on iPhone & iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-amber-200/90 leading-relaxed">
              <li>Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-blue-400" /> Share</strong> button in Safari's bottom toolbar.</li>
              <li>Scroll down the menu and tap <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-bridge-gold" /> Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-white">Add</strong> in the top right corner.</li>
            </ol>
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 text-bridge-dark font-bold text-xs uppercase tracking-wider hover:opacity-95 transition cursor-pointer shadow-lg shadow-bridge-gold/20"
            >
              <Download className="w-4 h-4" />
              <span>Install BRIDGE Now</span>
            </button>
            <p className="text-center text-[11px] text-bridge-subtext">Clicking install will add BRIDGE to your device apps.</p>
          </div>
        ) : (
          <div className="space-y-2 text-xs text-bridge-subtext bg-white/5 p-3 rounded-xl">
            <p className="font-medium text-white">Browser Instructions:</p>
            <p>In Chrome, Edge, or Brave: click the <strong className="text-white">Install</strong> icon in the right side of the URL address bar, or open the browser menu and select <em>"Install BRIDGE - Sovereign Node"</em>.</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-bridge-subtext hover:text-white transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
