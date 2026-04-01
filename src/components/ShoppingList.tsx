import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Circle, Plus, Trash2, X, ExternalLink, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SHOPPING_LIST_CATEGORIES, INITIAL_SUPPLEMENTS, INITIAL_MORNING_ROUTINES, INITIAL_EVENING_ROUTINES, INITIAL_DAILY_TASKS } from '../constants';
import { ShoppingCategory, ShoppingItem, Supplement, RoutineItem } from '../types';

export default function ShoppingList({
  shoppingList,
  setShoppingList,
  supplements,
  setSupplements,
  routines,
  setRoutines,
  eveningRoutines,
  setEveningRoutines,
  dailyTasks,
  setDailyTasks,
  onDelete
}: {
  shoppingList: ShoppingCategory[];
  setShoppingList: (list: ShoppingCategory[]) => void;
  supplements: Supplement[];
  setSupplements: (s: Supplement[]) => void;
  routines: RoutineItem[];
  setRoutines: (r: RoutineItem[]) => void;
  eveningRoutines: RoutineItem[];
  setEveningRoutines: (r: RoutineItem[]) => void;
  dailyTasks: RoutineItem[];
  setDailyTasks: (r: RoutineItem[]) => void;
  onDelete: (item: any, type: string, catIndex: number, index: number) => void;
}) {
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [selectedItemForRoutine, setSelectedItemForRoutine] = useState<ShoppingItem | null>(null);
  const [routineTime, setRoutineTime] = useState('Morgens');
  const [routineGroup, setRoutineGroup] = useState<'morning' | 'daily' | 'supplement' | 'evening'>('supplement');

  const toggleItem = (catIndex: number, itemIndex: number) => {
    const category = shoppingList[catIndex];
    if (category.category === 'Supplemente') return;
    
    const item = category.items[itemIndex];
    if (item.url) return;

    const newCategories = [...shoppingList];
    newCategories[catIndex] = {
      ...newCategories[catIndex],
      items: [...newCategories[catIndex].items]
    };
    newCategories[catIndex].items[itemIndex] = {
      ...newCategories[catIndex].items[itemIndex],
      completed: !newCategories[catIndex].items[itemIndex].completed
    };
    setShoppingList(newCategories);
  };

  const addItem = (catIndex: number) => {
    const name = newItemName[catIndex];
    if (!name?.trim()) return;

    const newCategories = [...shoppingList];
    newCategories[catIndex] = {
      ...newCategories[catIndex],
      items: [...newCategories[catIndex].items]
    };
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      completed: false,
      isUserAdded: true
    };
    newCategories[catIndex].items.push(newItem);
    setShoppingList(newCategories);
    setNewItemName({ ...newItemName, [catIndex]: '' });
  };

  const deleteItem = (catIndex: number, itemIndex: number) => {
    const item = shoppingList[catIndex].items[itemIndex];
    onDelete(item, 'shopping', catIndex, itemIndex);
    
    const newCategories = [...shoppingList];
    newCategories[catIndex] = {
      ...newCategories[catIndex],
      items: [...newCategories[catIndex].items]
    };
    newCategories[catIndex].items.splice(itemIndex, 1);
    setShoppingList(newCategories);
  };

  const openRoutineModal = (item: ShoppingItem) => {
    setSelectedItemForRoutine(item);
    setRoutineTime('Morgens');
    setRoutineGroup('supplement');
    setIsRoutineModalOpen(true);
  };

  const handleSaveToRoutine = () => {
    if (!selectedItemForRoutine) return;
    
    const id = Math.random().toString(36).substr(2, 9);

    if (routineGroup === 'supplement') {
      const newSupps = [...supplements];
      
      if (!newSupps.some(s => s.name.toLowerCase() === selectedItemForRoutine.name.toLowerCase())) {
        newSupps.push({
          id,
          name: selectedItemForRoutine.name,
          time: routineTime,
          icon: 'Pill',
          color: 'text-yellow-400',
          completed: false
        });
        setSupplements(newSupps);
        alert(`${selectedItemForRoutine.name} wurde zu deinen Supplementen hinzugefügt! 💊`);
      } else {
        alert(`${selectedItemForRoutine.name} ist bereits in deinen Supplementen vorhanden.`);
      }
    } else {
      const newItem = {
        id,
        title: selectedItemForRoutine.name,
        value: routineTime,
        icon: 'Activity',
        completed: false,
        color: 'text-yellow-400'
      };

      if (routineGroup === 'morning') {
        setRoutines([...routines, newItem]);
      } else if (routineGroup === 'evening') {
        setEveningRoutines([...eveningRoutines, newItem]);
      } else if (routineGroup === 'daily') {
        setDailyTasks([...dailyTasks, newItem]);
      }
      
      alert(`${selectedItemForRoutine.name} wurde zu deinen Routinen hinzugefügt! 🚀`);
    }

    setIsRoutineModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-1 block font-medium">Ernährung</span>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Einkaufsliste</h2>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-yellow-400">
          <ShoppingCart size={24} />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {shoppingList.map((category, catIndex) => {
          const catCheckedCount = category.items.filter(item => item.completed).length;
          const isSupplements = category.category === 'Supplemente';

          return (
            <div key={catIndex} className="bg-surface-container-low rounded-sm overflow-hidden">
              <div className="p-4 bg-surface-container-highest flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <h3 className="font-headline font-bold text-on-surface">{category.category}</h3>
                  {!isSupplements && (
                    <span className="text-[0.6875rem] font-medium text-on-surface-variant bg-background/30 px-2 py-0.5 rounded-full">
                      {catCheckedCount} / {category.items.length}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-surface-container-low">
                <AnimatePresence initial={false}>
                  {category.items.map((item, itemIndex) => {
                    const isSupplementItem = isSupplements;
                    const hasUrl = !!item.url;
                    
                    return (
                      <motion.div 
                        key={item.id} 
                        layout
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative overflow-hidden group border-b border-surface-container-highest last:border-0"
                      >
                        <div 
                          onClick={() => !isSupplementItem && toggleItem(catIndex, itemIndex)}
                          className={`relative p-4 flex items-center justify-between gap-2 sm:gap-4 transition-colors bg-surface-container-low ${isSupplementItem ? 'cursor-default' : 'cursor-pointer hover:bg-surface-container-high'}`}
                        >
                          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            {isSupplementItem ? (
                              <div className="w-[22px] h-[22px] flex items-center justify-center text-yellow-400">
                                <Pill size={18} />
                              </div>
                            ) : (
                              <button className={`flex-shrink-0 transition-colors ${item.completed ? 'text-yellow-400' : 'text-on-surface-variant/50'}`}>
                                {item.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                              </button>
                            )}
                            
                            {hasUrl ? (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-base text-on-surface hover:text-yellow-400 transition-colors flex items-center gap-2 flex-1 break-all hyphens-auto"
                              >
                                {item.name}
                                <ExternalLink size={12} className="opacity-50 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className={`text-base transition-all flex-1 break-all hyphens-auto ${item.completed ? 'text-on-surface-variant line-through opacity-70' : 'text-on-surface'}`}>
                                {item.name}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isSupplementItem && (
                              <button 
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRoutineModal(item);
                                }}
                                className="text-[0.6875rem] font-bold text-yellow-950 bg-yellow-400 px-3 py-1 rounded-sm hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
                              >
                                <Plus size={12} />
                                Routine
                              </button>
                            )}
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(catIndex, itemIndex);
                              }}
                              className="p-2 text-on-surface-variant/40 hover:text-red-400 transition-colors"
                              title="Löschen"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {/* Add Item Input */}
                <div className="p-4 bg-background/20">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Neuer Eintrag..."
                      value={newItemName[catIndex] || ''}
                      onChange={(e) => setNewItemName({ ...newItemName, [catIndex]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addItem(catIndex)}
                      className="flex-1 bg-surface-container-highest text-on-surface text-sm px-3 py-2 rounded-sm border border-outline-variant/30 focus:outline-none focus:border-yellow-400"
                    />
                    <button 
                      onClick={() => addItem(catIndex)}
                      className="p-2 bg-yellow-400 text-yellow-950 rounded-sm hover:bg-yellow-500 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine Modal */}
      <AnimatePresence>
        {isRoutineModalOpen && selectedItemForRoutine && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoutineModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/20 rounded-t-3xl z-[70] max-w-md mx-auto overflow-hidden pb-safe"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline font-bold text-2xl text-on-surface">
                    Routine anlegen
                  </h2>
                  <button 
                    onClick={() => setIsRoutineModalOpen(false)}
                    className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Titel</label>
                    <input 
                      type="text" 
                      value={selectedItemForRoutine.name}
                      readOnly
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none opacity-70"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Gruppe</label>
                    <div className="relative">
                      <select 
                        value={routineGroup}
                        onChange={(e) => setRoutineGroup(e.target.value as any)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors appearance-none"
                      >
                        <option value="daily">Tagesaufgaben</option>
                        <option value="morning">Morgen-Routine</option>
                        <option value="supplement">Supplemente</option>
                        <option value="evening">Abend-Routine</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      {routineGroup === 'supplement' ? 'Zeitpunkt' : 'Kommentar'}
                    </label>
                    <textarea 
                      value={routineTime}
                      onChange={(e) => setRoutineTime(e.target.value)}
                      placeholder={routineGroup === 'supplement' ? 'z.B. Morgens, 1 Kapsel...' : 'Optionale Notizen...'}
                      rows={3}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleSaveToRoutine}
                      className="w-full bg-yellow-400 text-yellow-950 font-headline font-bold py-4 rounded-xl active:scale-[0.98] transition-all"
                    >
                      In Routinen speichern
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
