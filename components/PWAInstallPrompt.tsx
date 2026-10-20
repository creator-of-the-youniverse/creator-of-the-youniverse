import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, Share, PlusSquare, X, Sparkles, ShieldCheck, Laptop, ExternalLink, ArrowRight } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallPromptProps {
  variant?: 'banner' | 'header-button' | 'floating-toast';
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ variant = 'banner', onClose }) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, isInIframe, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in session
    const wasBannerDismissed = sessionStorage.getItem('bridge_pwa_banner_dismissed') === 'true';
    const wasToastDismissed = sessionStorage.getItem('bridge_pwa_toast_dismissed') === 'true';
    if (wasBannerDismissed) setBannerDismissed(true);
    if (wasToastDismissed) setToastDismissed(true);
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('bridge_pwa_banner_dismissed', 'true');
    if (onClose) onClose();
  };

  const handleDismissToast = () => {
    setToastDismissed(true);
    sessionStorage.setItem('bridge_pwa_toast_dismissed', 'true');
    if (onClose) onClose();
  };

  // If already running inside standalone PWA, show verified badge or nothing
  if (isStandalone || isInstalled) {
    if (variant === 'header-button') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>PWA Installed</span>
        </div>
      );
    }
    return null;
  }

  // 1. Header quick-action button
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
          className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-bridge-gold/20 via-amber-400/25 to-bridge-gold/20 hover:from-bridge-gold/30 hover:to-amber-400/35 border border-bridge-gold/50 hover:border-bridge-gold text-bridge-gold text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(255,215,0,0.15)] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] active:scale-95"
          title="Install BRIDGE App to your device"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bridge-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-bridge-gold"></span>
          </span>
          <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-bridge-gold" />
          <span>Install App</span>
        </button>

        {showModal && <PWAInstallModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // 2. Floating Bottom Toast / Prompt
  if (variant === 'floating-toast') {
    if (toastDismissed) {
      return null;
    }

    return (
      <>
        <aside
          aria-label="Install BRIDGE App prompt"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-2xl bg-bridge-card/95 backdrop-blur-xl border border-bridge-gold/40 p-4 shadow-2xl shadow-black/80 animate-slide-up text-white"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-bridge-gold to-transparent opacity-80" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bridge-card to-bridge-gold/20 border border-bridge-gold/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,215,0,0.15)]">
                <span className="font-serif font-bold text-bridge-gold text-base">B</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bridge-gold">Install PWA</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">Add BRIDGE to Homescreen</h4>
              </div>
            </div>
            <button
              onClick={handleDismissToast}
              className="text-bridge-subtext hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Dismiss for now"
              aria-label="Dismiss for now"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-bridge-subtext leading-relaxed">
            Run BRIDGE as a native, full-screen app on iOS, Android, Mac, or Windows. Works offline with zero browser distraction.
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            {isInstallable ? (
              <button
                onClick={install}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs uppercase tracking-wider shadow-lg shadow-bridge-gold/20 transition cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs uppercase tracking-wider shadow-lg shadow-bridge-gold/20 transition cursor-pointer active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-bridge-subtext hover:text-white transition cursor-pointer"
            >
              Instructions
            </button>
          </div>
        </aside>

        {showModal && <PWAInstallModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // 3. In-page Banner variant
  if (bannerDismissed) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bridge-card via-[#151b2a] to-bridge-card border border-bridge-gold/30 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-fade-in my-4">
        {/* Subtle gold glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-bridge-gold to-transparent opacity-70" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 max-w-2xl">
            <div className="w-11 h-11 rounded-xl bg-bridge-gold/10 border border-bridge-gold/30 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
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
                Install BRIDGE to Your Home Screen
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
                <span>Install App</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-bridge-gold to-amber-400 hover:from-amber-300 hover:to-bridge-gold text-bridge-dark font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install Guide</span>
              </button>
            )}

            <button
              onClick={handleDismissBanner}
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
  const { isInstallable, isIOS, isInIframe, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(isIOS ? 'ios' : 'android');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-bridge-card border border-bridge-gold/30 p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
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
            <h3 className="text-lg font-bold text-white">Install BRIDGE on Your Device</h3>
          </div>
        </div>

        {/* Value props */}
        <div className="space-y-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-xs text-bridge-subtext">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Standalone App Window:</strong> No browser tabs, no URL search bars — runs with full viewport focus.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Home Screen Icon:</strong> Instant one-tap access directly from your phone screen or computer dock.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-bridge-gold shrink-0 mt-0.5" />
            <p><strong className="text-white">Offline Resilient:</strong> Validations, rubric guidance, and saved PDF reports work without connection.</p>
          </div>
        </div>

        {/* Direct One-Click Install if Browser Prompt is ready */}
        {isInstallable && (
          <div className="p-3 rounded-xl bg-bridge-gold/10 border border-bridge-gold/30 space-y-2">
            <p className="text-xs text-bridge-gold font-semibold flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Ready for Direct 1-Click Install
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

        {/* Tab Selector */}
        <div>
          <div className="flex border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 text-center border-b-2 transition ${activeTab === 'android' ? 'border-bridge-gold text-bridge-gold' : 'border-transparent text-bridge-subtext hover:text-white'}`}
            >
              Android / Chrome
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 text-center border-b-2 transition ${activeTab === 'ios' ? 'border-bridge-gold text-bridge-gold' : 'border-transparent text-bridge-subtext hover:text-white'}`}
            >
              iPhone & iPad
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 text-center border-b-2 transition ${activeTab === 'desktop' ? 'border-bridge-gold text-bridge-gold' : 'border-transparent text-bridge-subtext hover:text-white'}`}
            >
              Mac / PC / Laptop
            </button>
          </div>

          <div className="pt-3">
            {activeTab === 'android' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-bridge-subtext">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Google Chrome or Brave (Android):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Tap the <strong className="text-white">three dots menu (⋮)</strong> in the top-right corner of Chrome.</li>
                  <li>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
                  <li>Tap <strong className="text-white">Install</strong> when prompted to add the BRIDGE icon.</li>
                </ol>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2.5 text-xs text-amber-200">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-bridge-gold" />
                  <span>Safari on iOS (iPhone & iPad):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-amber-200/90 leading-relaxed">
                  <li>Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-blue-400" /> Share</strong> button in Safari's bottom toolbar.</li>
                  <li>Scroll down the share sheet and tap <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-bridge-gold" /> Add to Home Screen</strong>.</li>
                  <li>Tap <strong className="text-white">Add</strong> in the top-right corner. The BRIDGE icon will appear on your home screen.</li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-bridge-subtext">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span>Desktop (Chrome, Edge, Brave, Safari 17+):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Look for the <strong className="text-white">Install icon (computer/arrow)</strong> on the right side of your URL address bar.</li>
                  <li>Click <strong className="text-white">Install</strong> to add BRIDGE to your desktop apps or dock.</li>
                  <li>Alternatively, open browser menu (⋮) → <strong className="text-white">"Cast, save, and share"</strong> → <strong className="text-white">"Install page as app"</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Note if viewed inside preview iframe */}
        {isInIframe && (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-xs text-blue-200 flex items-start gap-2.5">
            <ExternalLink className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white">Preview Note:</span>
              <p className="text-blue-200/90">
                Browsers restrict native PWA installation inside embedded preview frames. To install to your device, open BRIDGE in a full browser tab:
              </p>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-bridge-gold hover:underline font-semibold mt-1"
              >
                <span>Open in Full Browser Tab</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

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
