import { Play, Check, Lock, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LIBRARY_ITEMS, GROUPS } from '../constants/bildung';

export default function Bildung({ 
  completedVideos, 
  setCompletedVideos 
}: { 
  completedVideos: string[]; 
  setCompletedVideos: (ids: string[]) => void; 
}) {
  const handleVideoClick = (id: string, isLocked: boolean) => {
    if (isLocked) return;
    if (!completedVideos.includes(id)) {
      setCompletedVideos([...completedVideos, id]);
    }
  };

  const isGroupCompleted = (groupId: string) => {
    const group = GROUPS.find(g => g.id === groupId);
    if (!group) return false;
    return group.itemIds.every(id => completedVideos.includes(id));
  };

  const isGroupLocked = (index: number) => {
    if (index === 0) return false;
    const previousGroup = GROUPS[index - 1];
    return !isGroupCompleted(previousGroup.id);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <section>
        <span className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-1 block font-medium">Wissensdatenbank</span>
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Bildung</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          Schließe alle Videos eines Levels ab, um das nächste Level und einen Bonus freizuschalten.
        </p>
      </section>

      {/* Levels */}
      <div className="space-y-16">
        {GROUPS.map((group, groupIndex) => {
          const locked = isGroupLocked(groupIndex);
          const completed = isGroupCompleted(group.id);
          const progress = group.itemIds.filter(id => completedVideos.includes(id)).length;
          const total = group.itemIds.length;

          return (
            <div key={group.id} className={`relative ${locked ? 'opacity-50 grayscale' : ''}`}>
              {/* Group Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline text-xl font-bold text-on-surface">{group.title}</h3>
                    {locked && <Lock size={16} className="text-on-surface-variant" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-32 bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / total) * 100}%` }}
                        className="h-full bg-yellow-400"
                      />
                    </div>
                    <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
                      {progress} / {total} Videos
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-all duration-300 ${
                  completed 
                    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]' 
                    : 'text-on-surface-variant/30 bg-surface-container-high border-outline-variant/10'
                }`}>
                  <Star size={14} className={completed ? "fill-yellow-400" : ""} />
                  <span className="text-[0.6875rem] font-bold whitespace-nowrap">
                    +{group.bonus.toLocaleString()} XP
                  </span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-6">
                {group.itemIds.map((itemId) => {
                  const item = LIBRARY_ITEMS.find(i => i.id === itemId);
                  if (!item) return null;
                  const isCompleted = completedVideos.includes(item.id);
                  
                  return (
                    <a 
                      key={item.id} 
                      href={locked ? undefined : item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => handleVideoClick(item.id, locked)}
                      className={`block relative group overflow-hidden bg-surface-container-low rounded-sm border border-outline-variant/10 transition-all duration-300 ${
                        locked ? 'cursor-not-allowed' : 'active:scale-[0.98]'
                      } ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    >
                      <div className="relative min-h-[160px] flex flex-col">
                        <div className="absolute inset-0">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 opacity-40"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        </div>
                        
                        <div className="relative p-4 flex flex-col h-full justify-between z-10 flex-1">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl drop-shadow-lg">{item.emoji}</span>
                              {isCompleted && (
                                <div className="bg-yellow-400 text-yellow-950 p-0.5 rounded-full shadow-lg">
                                  <Check size={10} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            {/* Play Button in Header */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-300 ${
                              locked 
                                ? 'bg-surface-container-high text-on-surface-variant' 
                                : 'bg-yellow-400 text-yellow-950 shadow-yellow-400/20 group-hover:scale-110'
                            }`}>
                              {locked ? <Lock size={18} /> : <Play size={20} fill="currentColor" className="ml-1" />}
                            </div>

                            <span className={`text-[0.6875rem] font-bold px-1.5 py-0.5 rounded-sm border whitespace-nowrap flex items-center gap-1 transition-colors ${
                              isCompleted 
                                ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' 
                                : 'text-yellow-400 bg-background/80 backdrop-blur-sm border-yellow-400/20'
                            }`}>
                              {isCompleted && <Star size={10} className="fill-yellow-400" />}
                              {isCompleted ? 'OK' : '+1.000 XP'}
                            </span>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <h3 className={`font-headline font-bold text-xl drop-shadow-md transition-colors leading-tight ${
                                locked ? 'text-on-surface-variant' : 'text-on-surface group-hover:text-yellow-400'
                              }`}>
                                {item.title}
                              </h3>
                              {item.duration && (
                                <span className="text-[0.625rem] font-bold text-on-surface-variant/60 uppercase tracking-tighter whitespace-nowrap">
                                  {item.duration}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-on-surface/80 leading-relaxed whitespace-pre-line">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
