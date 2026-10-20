import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // 1. Check if running inside an iframe (e.g. AI Studio preview environment)
    const insideIframe = typeof window !== 'undefined' && window.self !== window.top;
    setIsInIframe(insideIframe);

    // 2. Platform detection
    if (typeof window !== 'undefined' && window.navigator) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroidDevice = /android/.test(userAgent);
      
      setIsIOS(isIOSDevice);
      if (isIOSDevice) {
        setPlatform('ios');
      } else if (isAndroidDevice) {
        setPlatform('android');
      } else {
        setPlatform('desktop');
      }
    }

    // 3. Standalone mode check
    // CRITICAL: If inside an iframe, the app is NEVER standalone.
    // Also NEVER use document.referrer as an install detector (Android intents set android-app:// referrer for normal browser visits).
    const checkStandalone = () => {
      if (insideIframe) {
        setIsStandalone(false);
        return;
      }
      
      try {
        const standaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
        const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        const isApp = standaloneQuery || navStandalone;
        setIsStandalone(isApp);
      } catch (e) {
        setIsStandalone(false);
      }
    };

    checkStandalone();

    // 4. Capture native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Native appinstalled event (fired ONLY when the app is genuinely installed)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isStandalone,
    isIOS,
    isInIframe,
    platform,
    install,
    hasPrompt: !!deferredPrompt,
  };
}
