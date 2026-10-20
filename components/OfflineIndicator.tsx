import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from './useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-bridge-dark shadow-2xl border border-amber-300/40 animate-slide-up">
      <WifiOff className="w-4 h-4 text-bridge-dark" />
      <span>Offline Mode — Running locally from homescreen cache</span>
    </div>
  );
};
