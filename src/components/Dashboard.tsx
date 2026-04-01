import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Droplets, Sun, Activity, Snowflake, Pill, Check, Coffee, Moon, Footprints, Info, X, Play, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { RoutineItem, Supplement } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_MORNING_ROUTINES, INITIAL_EVENING_ROUTINES, INITIAL_DAILY_TASKS, INITIAL_SUPPLEMENTS } from '../constants';
import { ICON_MAP } from '../lib/icons';

interface XPPopup {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

export default function Dashboard({ 
  setEarnedXP,
  routines,
  setRoutines,
  supplements,
  setSupplements,
  eveningRoutines,
  setEveningRoutines,
  dailyTasks,
  setDailyTasks,
  wakeUpTime = '07:00'
}: { 
  setEarnedXP?: (xp: number) => void;
  routines: RoutineItem[];
  setRoutines: (r: RoutineItem[]) => void;
  supplements: Supplement[];
  setSupplements: (s: Supplement[]) => void;
  eveningRoutines: RoutineItem[];
  setEveningRoutines: (r: RoutineItem[]) => void;
  dailyTasks: RoutineItem[];
  setDailyTasks: (t: RoutineItem[]) => void;
  wakeUpTime?: string;
}) {
  const [selectedProtocol, setSelectedProtocol] = useState<RoutineItem | Supplement | null>(null);
  const [popups, setPopups] = useState<XPPopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);

  const triggerXPPopup = useCallback((e: React.MouseEvent | React.TouchEvent | undefined) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const id = `${timestamp}-${randomSuffix}`;
    
    const x = e && 'clientX' in e ? e.clientX : window.innerWidth / 2;
    const y = e && 'clientY' in e ? e.clientY : window.innerHeight / 2;
    const rotation = (Math.random() - 0.5) * 30; // -15 to 15 degrees
    
    setPopups(prev => [...prev, { id, x, y, rotation }]);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 600);
    
    // Trigger particles
    const newParticles: Particle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: `${id}-p-${i}`,
      x,
      y,
      color: i % 3 === 0 ? '#FACC15' : i % 3 === 1 ? '#EAB308' : '#FFFFFF',
      size: Math.random() * 8 + 2,
      velocity: {
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 15 - 8
      }
    }));
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1000);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  }, []);

  const handleOpenProtocol = (item: RoutineItem | Supplement) => {
    setSelectedProtocol(item);
  };

  // Restore icons that are lost during JSON serialization in localStorage
  const getIcon = (item: any, initialArray: any[]) => {
    // Check if item has a string icon name
    if (typeof item.icon === 'string') {
      return ICON_MAP[item.icon] || Activity;
    }
    
    // If it's already a component (function or object with $$typeof), return it
    if (item.icon && (typeof item.icon === 'function' || (typeof item.icon === 'object' && (item.icon as any).$$typeof))) {
      return item.icon;
    }

    // Fallback to initial array lookup for legacy items
    const initial = initialArray.find(i => i.id === item.id);
    if (initial && initial.icon) {
      // If initial icon is a string, map it
      if (typeof initial.icon === 'string') {
        return ICON_MAP[initial.icon] || Activity;
      }
      return initial.icon;
    }
    return Activity; // Fallback for custom routines
  };

  const mappedRoutines = routines.map(r => ({ ...r, icon: getIcon(r, INITIAL_MORNING_ROUTINES) }));
  const mappedEveningRoutines = eveningRoutines.map(r => ({ ...r, icon: getIcon(r, INITIAL_EVENING_ROUTINES) }));
  const mappedDailyTasks = dailyTasks.map(t => ({ ...t, icon: getIcon(t, INITIAL_DAILY_TASKS) }));
  const mappedSupplements = supplements.map(s => ({ ...s, icon: getIcon(s, INITIAL_SUPPLEMENTS) }));

  const toggleRoutine = (id: string, e?: React.MouseEvent) => {
    const item = routines.find(r => r.id === id);
    if (item && !item.completed) triggerXPPopup(e);
    setRoutines(routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const toggleSupplement = (id: string, e?: React.MouseEvent) => {
    const item = supplements.find(s => s.id === id);
    if (item && !item.completed) triggerXPPopup(e);
    setSupplements(supplements.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const toggleEveningRoutine = (id: string, e?: React.MouseEvent) => {
    const item = eveningRoutines.find(r => r.id === id);
    if (item && !item.completed) triggerXPPopup(e);
    setEveningRoutines(eveningRoutines.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const toggleDailyTask = (id: string, e?: React.MouseEvent) => {
    const item = dailyTasks.find(t => t.id === id);
    if (item && !item.completed) triggerXPPopup(e);
    setDailyTasks(dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const activeRoutines = mappedRoutines.filter(r => !r.completed);
  const activeDailyTasks = mappedDailyTasks.filter(t => !t.completed);
  const activeSupplements = mappedSupplements.filter(s => !s.completed);
  const activeEveningRoutines = mappedEveningRoutines.filter(r => !r.completed);

  const completedRoutines = mappedRoutines.filter(r => r.completed);
  const completedDailyTasks = mappedDailyTasks.filter(t => t.completed);
  const completedSupplements = mappedSupplements.filter(s => s.completed);
  const completedEveningRoutines = mappedEveningRoutines.filter(r => r.completed);

  const completedTasksCount = completedRoutines.length + completedDailyTasks.length + completedSupplements.length + completedEveningRoutines.length;
  const totalTasksCount = mappedRoutines.length + mappedDailyTasks.length + supplements.length + mappedEveningRoutines.length;
  const progressPercentage = totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100;
  const earnedXP = completedTasksCount * 100;
  const hasCompletedTasks = completedTasksCount > 0;
  
  const prevProgressRef = useRef(progressPercentage);

  useEffect(() => {
    if (setEarnedXP) setEarnedXP(earnedXP);
  }, [earnedXP, setEarnedXP]);

  useEffect(() => {
    if (progressPercentage === 100 && prevProgressRef.current < 100 && totalTasksCount > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
    prevProgressRef.current = progressPercentage;
  }, [progressPercentage, totalTasksCount]);

  return (
    <div className="space-y-10">
      {/* Hero Progress */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 font-medium">Tagesprotokoll</span>
            <h2 className="font-headline font-bold text-3xl text-on-surface mt-1">Fortschritt</h2>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="font-headline text-4xl font-bold text-yellow-400 leading-none">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
        <motion.div 
          animate={isPulsing ? { scale: [1, 1.02, 1], x: [0, -2, 2, -2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden p-[2px] relative"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full vitality-glow relative"
          >
            <motion.div 
              animate={{ 
                opacity: [0, 0.5, 0],
                x: ['-100%', '200%']
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </motion.div>
        <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">
          Tagesfortschritt: Du hast <span className="text-yellow-400 font-semibold">{completedTasksCount} von {totalTasksCount}</span> Aufgaben abgeschlossen.
        </p>
      </section>

      {/* Routine Grid */}
      {activeRoutines.length > 0 && (
      <section>
        <h3 className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-4 font-medium">Morgen-Routine</h3>
        <div className="bg-surface-container-low rounded-sm divide-y divide-outline-variant/10 overflow-hidden">
          <AnimatePresence initial={false}>
            {activeRoutines.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.05, x: 30 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => toggleRoutine(item.id, e)}
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 relative z-10">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors border-outline-variant/50 bg-surface-container-highest">
                      <Icon size={12} className="text-yellow-400" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-base font-medium transition-all text-on-surface break-all hyphens-auto">
                        {item.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(item);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
      )}

      {/* Protocol Modal */}
      <AnimatePresence>
        {selectedProtocol && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProtocol(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/20 rounded-t-3xl z-[70] max-w-md mx-auto overflow-y-auto max-h-[95vh] pb-safe custom-scrollbar"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                      {(() => {
                        const IconComp = typeof (selectedProtocol as any).icon === 'string' 
                          ? (ICON_MAP[(selectedProtocol as any).icon] || Activity)
                          : ((selectedProtocol as any).icon || Activity);
                        return <IconComp size={20} />;
                      })()}
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-xl text-on-surface break-all hyphens-auto">
                        {(selectedProtocol as any).title || (selectedProtocol as any).name}
                      </h2>
                      <p className="text-[0.625rem] text-yellow-400 font-bold tracking-widest uppercase">
                        {(selectedProtocol as Supplement).time ? 'Zeitpunkt & Info' : 'Protokoll & Info'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedProtocol(null)}
                      className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <>
                    {(selectedProtocol as Supplement).time && (
                      <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
                        <span className="text-[0.625rem] text-yellow-400 font-bold uppercase tracking-widest block mb-1">Zeitpunkt</span>
                        <p className="text-lg font-headline font-bold text-on-surface">{(selectedProtocol as Supplement).time}</p>
                      </div>
                    )}

                    {selectedProtocol.value && (
                      <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
                        <span className="text-[0.625rem] text-yellow-400 font-bold uppercase tracking-widest block mb-1">Info / Dosis</span>
                        <p className="text-lg font-headline font-bold text-on-surface break-all hyphens-auto">{selectedProtocol.value}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {selectedProtocol.protocol?.map((step, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-[0.625rem] font-bold text-yellow-400 border border-yellow-400/20">
                            {index + 1}
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed pt-0.5 break-words hyphens-auto">
                            {step}
                          </p>
                        </div>
                      ))}
                      {(!selectedProtocol.protocol || selectedProtocol.protocol.length === 0) && !selectedProtocol.value && (
                        <p className="text-sm text-on-surface-variant italic text-center py-4">Keine weiteren Informationen hinterlegt.</p>
                      )}
                    </div>
                  </>
                </div>

                <div className="flex flex-col gap-3">
                  <>
                    {selectedProtocol.videoUrl && (
                      <a 
                        href={selectedProtocol.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-surface-container-high text-on-surface font-headline font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-outline-variant/20"
                      >
                        <Play size={18} fill="currentColor" className="text-yellow-400" />
                        Video-Anleitung ansehen
                      </a>
                    )}
                    
                    <button 
                      onClick={() => {
                        toggleRoutine(selectedProtocol.id);
                        setSelectedProtocol(null);
                      }}
                      className="w-full bg-yellow-400 text-yellow-950 font-headline font-bold py-4 rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
                    >
                      <Check size={20} strokeWidth={3} />
                      Protokoll abgeschlossen
                    </button>
                  </>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily Tasks */}
      {activeDailyTasks.length > 0 && (
      <section>
        <h3 className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-4 font-medium">Tagesaufgaben</h3>
        <div className="bg-surface-container-low rounded-sm divide-y divide-outline-variant/10 overflow-hidden">
          <AnimatePresence initial={false}>
            {activeDailyTasks.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.05, x: 30 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => toggleDailyTask(item.id, e)}
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 relative z-10">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors border-outline-variant/50 bg-surface-container-highest">
                      <Icon size={12} className="text-yellow-400" />
                    </div>
                    <span className="text-base font-medium transition-all text-on-surface flex-1 break-all hyphens-auto">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(item);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
      )}

      {/* Supplements */}
      {activeSupplements.length > 0 && (
      <section>
        <h3 className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-4 font-medium">Supplemente</h3>
        <div className="bg-surface-container-low rounded-sm divide-y divide-outline-variant/10 overflow-hidden">
          <AnimatePresence initial={false}>
            {activeSupplements.map((sup) => {
              const Icon = sup.icon;
              return (
                <motion.div 
                  key={sup.id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.05, x: 30 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => toggleSupplement(sup.id, e)}
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 relative z-10">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors border-outline-variant/50 bg-surface-container-highest">
                      <Icon size={12} className="text-yellow-400" />
                    </div>
                    <span className="text-base font-medium transition-all text-on-surface flex-1 break-all hyphens-auto">
                      {sup.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(sup);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
      )}

      {/* Evening Routine */}
      {activeEveningRoutines.length > 0 && (
      <section>
        <h3 className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-4 font-medium">Abend-Routine</h3>
        <div className="bg-surface-container-low rounded-sm divide-y divide-outline-variant/10 overflow-hidden">
          <AnimatePresence initial={false}>
            {activeEveningRoutines.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.05, x: 30 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => toggleEveningRoutine(item.id, e)}
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 relative z-10">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors border-outline-variant/50 bg-surface-container-highest">
                      <Icon size={12} className="text-yellow-400" />
                    </div>
                    <span className="text-base font-medium transition-all text-on-surface flex-1 break-all hyphens-auto">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(item);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
      )}

      {/* Erledigte Aufgaben */}
      {hasCompletedTasks && (
        <section className="opacity-60">
          <h3 className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-4 font-medium">Erledigte Aufgaben</h3>
          <div className="bg-surface-container-low rounded-sm divide-y divide-outline-variant/10 overflow-hidden">
            <AnimatePresence initial={false}>
              {completedRoutines.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => toggleRoutine(item.id, e)} 
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors bg-yellow-400 border-yellow-400 text-yellow-950">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-base font-medium transition-all line-through text-on-surface-variant flex-1 break-all hyphens-auto">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(item);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              ))}
              {completedDailyTasks.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => toggleDailyTask(item.id, e)} 
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors bg-yellow-400 border-yellow-400 text-yellow-950">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-base font-medium transition-all line-through text-on-surface-variant flex-1 break-all hyphens-auto">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(item);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              ))}
              {completedSupplements.map((sup) => (
                <motion.div 
                  key={sup.id} 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => toggleSupplement(sup.id, e)} 
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors bg-yellow-400 border-yellow-400 text-yellow-950">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-base font-medium transition-all line-through text-on-surface-variant flex-1 break-all hyphens-auto">{sup.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(sup);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              ))}
              {completedEveningRoutines.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => toggleEveningRoutine(item.id, e)} 
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors bg-yellow-400 border-yellow-400 text-yellow-950">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-base font-medium transition-all line-through text-on-surface-variant flex-1 break-all hyphens-auto">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProtocol(item);
                      }}
                      className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-full hover:bg-yellow-400/20 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <span className="text-[0.6875rem] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">+100 XP</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      
      {/* XP Popups & Particles */}
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: popup.y, x: popup.x - 50, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: popup.y - 150, 
              scale: [0.5, 1.2, 1.2, 1],
              rotate: popup.rotation 
            }}
            transition={{ duration: 1, times: [0, 0.2, 0.8, 1] }}
            className="fixed pointer-events-none z-[100] flex items-center gap-2 text-yellow-400 font-headline font-bold text-2xl drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          >
            <Sparkles size={28} className="animate-pulse" />
            +100 XP
          </motion.div>
        ))}
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, x: particle.x, y: particle.y, scale: 1 }}
            animate={{ 
              opacity: 0, 
              x: particle.x + particle.velocity.x * 20, 
              y: particle.y + particle.velocity.y * 20,
              scale: 0 
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed pointer-events-none z-[99] rounded-full"
            style={{ 
              width: particle.size, 
              height: particle.size, 
              backgroundColor: particle.color,
              boxShadow: `0 0 10px ${particle.color}`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
