import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Repeat, 
  GraduationCap, 
  Zap,
  ShoppingCart,
  Settings
} from 'lucide-react';
import { Tab, Profile } from '../types';
import { getLevelFromXP } from '../lib/xp';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  earnedXP?: number;
  profile: Profile;
  onOpenProfile?: () => void;
  hasPendingFortschritt?: boolean;
  hasPendingBildung?: boolean;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  earnedXP = 0, 
  profile, 
  onOpenProfile,
  hasPendingFortschritt = false,
  hasPendingBildung = false
}: LayoutProps) {
  const displayTotalXP = (profile?.totalXP || 0) + earnedXP;
  const displayLevel = getLevelFromXP(displayTotalXP);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-md border-b border-surface-container-low max-w-md mx-auto">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onOpenProfile}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20">
            <img 
              src={profile.avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-yellow-400 font-headline font-bold text-lg leading-tight tracking-tight">
              {profile.name}
            </h1>
            <span className="text-[0.625rem] text-on-surface-variant font-bold uppercase tracking-widest">
              LVL {displayLevel} • {displayTotalXP.toLocaleString('de-DE')} XP
            </span>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('routines')}
          className={`hover:bg-surface-container-highest transition-colors p-2 rounded-full active:scale-95 ${activeTab === 'routines' ? 'text-yellow-400 bg-surface-container-highest' : 'text-on-surface-variant'}`}
        >
          <Settings size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel h-20 flex justify-around items-center px-4 max-w-md mx-auto">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<Repeat size={24} />}
          label="Fortschritt"
          hasNotification={hasPendingFortschritt}
        />
        <NavButton 
          active={activeTab === 'einkaufsliste'} 
          onClick={() => setActiveTab('einkaufsliste')}
          icon={<ShoppingCart size={24} />}
          label="Einkauf"
        />
        <NavButton 
          active={activeTab === 'bildung'} 
          onClick={() => setActiveTab('bildung')}
          icon={<GraduationCap size={24} />}
          label="Bildung"
          hasNotification={hasPendingBildung}
        />
      </nav>
    </div>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  hasNotification = false 
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  hasNotification?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 relative ${
        active ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'text-on-surface/40 hover:text-yellow-400'
      }`}
    >
      <div className="relative">
        {icon}
        {hasNotification && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-background shadow-[0_0_8px_rgba(250,204,21,0.6)]"
          />
        )}
      </div>
      <span className="text-[10px] font-medium tracking-tight mt-1">{label}</span>
    </button>
  );
}
