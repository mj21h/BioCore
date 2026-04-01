import { useState } from 'react';
import { AlarmClock, Timer, Plus, X, Activity, Trash2, Pill, Edit2, Bell, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_MORNING_ROUTINES, INITIAL_EVENING_ROUTINES, INITIAL_DAILY_TASKS, INITIAL_SUPPLEMENTS } from '../constants';
import { RoutineItem, Supplement } from '../types';
import { ICON_MAP, SELECTABLE_ICONS } from '../lib/icons';

export default function Routines({
  routines,
  setRoutines,
  supplements,
  setSupplements,
  eveningRoutines,
  setEveningRoutines,
  dailyTasks,
  setDailyTasks,
  wakeUpTime,
  setWakeUpTime,
  weckerSyncEnabled,
  setWeckerSyncEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
  onDelete
}: {
  routines: RoutineItem[];
  setRoutines: (r: RoutineItem[]) => void;
  supplements: Supplement[];
  setSupplements: (s: Supplement[]) => void;
  eveningRoutines: RoutineItem[];
  setEveningRoutines: (r: RoutineItem[]) => void;
  dailyTasks: RoutineItem[];
  setDailyTasks: (t: RoutineItem[]) => void;
  wakeUpTime: string;
  setWakeUpTime: (t: string) => void;
  weckerSyncEnabled: boolean;
  setWeckerSyncEnabled: (e: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (e: boolean) => void;
  onDelete: (item: any, type: string) => void;
}) {
  const [activeGroup, setActiveGroup] = useState<'morning' | 'evening' | 'daily'>('daily');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newProtocol, setNewProtocol] = useState('');
  const [newGroup, setNewGroup] = useState<'morning' | 'daily' | 'supplement' | 'evening'>('morning');
  const [newIcon, setNewIcon] = useState('Activity');
  const [newTime, setNewTime] = useState<'Morgens' | 'Nach dem Frühstück' | 'Abends'>('Morgens');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderSync, setNewReminderSync] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

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
    return Activity;
  };

  const getIconString = (item: any, initialArray: any[]): string => {
    if (typeof item.icon === 'string') return item.icon;
    const initial = initialArray.find(i => i.id === item.id);
    if (initial && typeof initial.icon === 'string') return initial.icon;
    return 'Activity';
  };

  const mappedRoutines = routines.map(r => ({ ...r, icon: getIcon(r, INITIAL_MORNING_ROUTINES) }));
  const mappedEveningRoutines = eveningRoutines.map(r => ({ ...r, icon: getIcon(r, INITIAL_EVENING_ROUTINES) }));
  const mappedDailyTasks = dailyTasks.map(t => ({ ...t, icon: getIcon(t, INITIAL_DAILY_TASKS) }));
  const mappedSupplements = supplements.map(s => ({ ...s, icon: getIcon(s, INITIAL_SUPPLEMENTS) }));

  const openAddModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewComment('');
    setNewProtocol('');
    setNewGroup('morning');
    setNewIcon('Activity');
    setNewTime('Morgens');
    setNewReminderTime('');
    setNewReminderSync(false);
    setIsIconPickerOpen(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any, group: 'morning' | 'daily' | 'supplement' | 'evening') => {
    const originalItem = [...routines, ...dailyTasks, ...supplements, ...eveningRoutines].find(r => r.id === item.id) || item;
    
    let initialArray: any[] = [];
    if (group === 'morning') initialArray = INITIAL_MORNING_ROUTINES;
    else if (group === 'daily') initialArray = INITIAL_DAILY_TASKS;
    else if (group === 'supplement') initialArray = INITIAL_SUPPLEMENTS;
    else if (group === 'evening') initialArray = INITIAL_EVENING_ROUTINES;

    setEditingId(item.id);
    setNewTitle(item.title || item.name || '');
    setNewComment(item.value || '');
    setNewTime(item.time || 'Morgens');
    setNewReminderTime(item.reminderTime || '');
    setNewReminderSync(!!item.reminderSyncWithWecker);
    setNewProtocol(item.protocol?.join('\n') || '');
    setNewGroup(group);
    setNewIcon(getIconString(originalItem, initialArray));
    setIsIconPickerOpen(false);
    setIsModalOpen(true);
  };

  const handleSaveRoutine = () => {
    if (!newTitle.trim()) return;
    
    const id = editingId || crypto.randomUUID();

    const cleanRoutines = routines.filter(r => r.id !== id);
    const cleanDaily = dailyTasks.filter(r => r.id !== id);
    const cleanSupplements = supplements.filter(r => r.id !== id);
    const cleanEvening = eveningRoutines.filter(r => r.id !== id);

    if (newGroup === 'supplement') {
      const oldItem = [...routines, ...dailyTasks, ...supplements, ...eveningRoutines].find(r => r.id === id) || { completed: false, color: 'text-yellow-400' };
      const updatedProtocol = newProtocol.split('\n').filter(line => line.trim() !== '');
      const newItem: Supplement = {
        id,
        name: newTitle,
        time: newTime,
        icon: newIcon,
        color: oldItem.color || 'text-yellow-400',
        completed: oldItem.completed || false,
        value: newComment,
        protocol: updatedProtocol.length > 0 ? updatedProtocol : undefined,
        reminderTime: newReminderTime || undefined
      };
      setSupplements([...cleanSupplements, newItem]);
      setRoutines(cleanRoutines);
      setDailyTasks(cleanDaily);
      setEveningRoutines(cleanEvening);
    } else {
      const oldItem = [...routines, ...dailyTasks, ...eveningRoutines].find(r => r.id === id) || { completed: false, color: 'text-yellow-400', icon: 'Activity' };
      const updatedProtocol = newProtocol.split('\n').filter(line => line.trim() !== '');
      
      const newItem: RoutineItem = {
        id,
        title: newTitle,
        value: newComment,
        icon: newIcon,
        completed: oldItem.completed || false,
        color: oldItem.color || 'text-yellow-400',
        protocol: updatedProtocol.length > 0 ? updatedProtocol : undefined,
        reminderTime: newReminderTime || undefined,
        reminderSyncWithWecker: newGroup === 'morning' ? newReminderSync : undefined
      };

      if (newGroup === 'morning') setRoutines([...cleanRoutines, newItem]);
      else setRoutines(cleanRoutines);

      if (newGroup === 'daily') setDailyTasks([...cleanDaily, newItem]);
      else setDailyTasks(cleanDaily);

      if (newGroup === 'evening') setEveningRoutines([...cleanEvening, newItem]);
      else setEveningRoutines(cleanEvening);

      setSupplements(cleanSupplements);
    }

    setIsModalOpen(false);
  };

  const handleDeleteRoutine = () => {
    if (!editingId) return;
    
    const morningItem = routines.find(r => r.id === editingId);
    const dailyItem = dailyTasks.find(r => r.id === editingId);
    const supplementItem = supplements.find(r => r.id === editingId);
    const eveningItem = eveningRoutines.find(r => r.id === editingId);

    if (morningItem) onDelete(morningItem, 'morning');
    else if (dailyItem) onDelete(dailyItem, 'daily');
    else if (supplementItem) onDelete(supplementItem, 'supplement');
    else if (eveningItem) onDelete(eveningItem, 'evening');

    setRoutines(routines.filter(r => r.id !== editingId));
    setDailyTasks(dailyTasks.filter(r => r.id !== editingId));
    setSupplements(supplements.filter(r => r.id !== editingId));
    setEveningRoutines(eveningRoutines.filter(r => r.id !== editingId));
    setIsModalOpen(false);
  };

  const handleToggleNotifications = async () => {
    try {
      if (!notificationsEnabled) {
        if ('Notification' in window) {
          let permission = Notification.permission;
          
          if (permission === 'default') {
            permission = await Notification.requestPermission();
          }
          
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            const notif = new Notification('Erinnerungen aktiviert! 🚀', {
              body: `Du wirst nun an deine Routinen erinnert.`,
              icon: '/favicon.ico'
            });
            notif.onclick = () => window.focus();
          } else if (permission === 'denied') {
            alert('Benachrichtigungen wurden blockiert. Bitte aktiviere sie in den Browsereinstellungen (Klick auf das Schloss-Icon in der Adressleiste), um Erinnerungen zu erhalten.');
          }
        } else {
          alert('Dein Browser unterstützt leider keine Push-Benachrichtigungen.');
        }
      } else {
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      alert('Fehler beim Aktivieren der Benachrichtigungen. Bitte versuche es erneut.');
    }
  };

  const testNotification = () => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('Test: Guten Morgen! ☀️', {
        body: 'Zeit für deine Morgen-Routine. Starte optimal in den Tag!',
        icon: '/favicon.ico'
      });
      notif.onclick = () => window.focus();
    } else {
      alert('Bitte aktiviere zuerst die Push-Benachrichtigungen.');
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-1 block font-medium">System-Optimierung</span>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Routinen</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-950 px-4 py-2 rounded-sm flex items-center gap-2 font-headline font-bold text-sm active:scale-95 transition-transform"
        >
          <Plus size={18} />
          Hinzufügen
        </button>
      </div>

      {/* Routine Lists */}
      <div className="space-y-8">
        <RoutineGroup title="Tagesaufgaben" items={mappedDailyTasks} group="daily" onEdit={openEditModal} />
        <RoutineGroup title="Morgen-Routine" items={mappedRoutines} group="morning" onEdit={openEditModal} />
        <RoutineGroup title="Supplemente" items={mappedSupplements} group="supplement" onEdit={openEditModal} />
        <RoutineGroup title="Abend-Routine" items={mappedEveningRoutines} group="evening" onEdit={openEditModal} />
        
        {routines.length === 0 && dailyTasks.length === 0 && supplements.length === 0 && eveningRoutines.length === 0 && (
          <div className="bg-surface-container-low p-8 rounded-sm text-center border border-dashed border-outline-variant/30">
            <Activity size={32} className="mx-auto text-on-surface-variant/50 mb-3" />
            <p className="text-on-surface-variant text-sm">Keine Routinen konfiguriert.</p>
            <p className="text-on-surface-variant/70 text-xs mt-1">Klicke auf "Hinzufügen", um eine neue Routine zu erstellen.</p>
          </div>
        )}
      </div>

      {/* Notification Engine */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-8 bg-yellow-400"></div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Benachrichtigungs-Engine</h3>
        </div>
        
        <div className="bg-surface-container-low rounded-sm overflow-hidden divide-y divide-outline-variant/10">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm bg-surface-container-highest flex items-center justify-center text-yellow-400">
                <AlarmClock size={20} />
              </div>
              <div>
                <p className="font-medium text-base text-on-surface">Wecker Sync</p>
                <p className="text-[0.6875rem] text-on-surface/50">Uhrzeit für Morgen-Routinen</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="bg-surface-container-highest border border-outline-variant/20 rounded-lg px-2 py-1 text-sm text-on-surface focus:outline-none focus:border-yellow-400"
              />
              <button 
                onClick={() => setWeckerSyncEnabled(!weckerSyncEnabled)}
                className={`w-12 h-6 rounded-full relative p-1 flex items-center transition-colors ${weckerSyncEnabled ? 'bg-yellow-400 justify-end' : 'bg-surface-container-highest justify-start'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-colors ${weckerSyncEnabled ? 'bg-yellow-950' : 'bg-on-surface-variant'}`}></div>
              </button>
            </div>
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm bg-surface-container-highest flex items-center justify-center text-yellow-400">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-medium text-base text-on-surface">Routine-Erinnerungen</p>
                <p className="text-[0.6875rem] text-on-surface/50">Push-Benachrichtigungen für deine Einträge</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {notificationsEnabled && (
                <button 
                  onClick={testNotification}
                  className="text-xs font-medium text-yellow-400 hover:text-yellow-400/80 transition-colors px-2 py-1 rounded-sm bg-yellow-400/10"
                >
                  Testen
                </button>
              )}
              <button 
                onClick={handleToggleNotifications}
                className={`w-12 h-6 rounded-full relative p-1 flex items-center transition-colors ${notificationsEnabled ? 'bg-yellow-400 justify-end' : 'bg-surface-container-highest justify-start'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-colors ${notificationsEnabled ? 'bg-yellow-950' : 'bg-on-surface-variant'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Status Graphic */}
        <div className="h-32 w-full bg-surface-container-lowest rounded-sm border border-outline-variant/5 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 50 Q 100 20, 200 50 T 400 50" fill="none" stroke="#facc15" strokeWidth="1" />
              <path d="M0 60 Q 100 30, 200 60 T 400 60" fill="none" stroke="#eab308" strokeWidth="1" />
            </svg>
          </div>
          <div className="z-10 text-center">
            <span className="text-[0.625rem] text-on-surface/40 block mb-1 tracking-widest font-bold">ROUTINE-STATUS</span>
            <span className="font-headline text-lg font-bold text-yellow-400">AKTIV</span>
          </div>
        </div>
      </section>

      {/* Add/Edit Routine Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
                    {editingId ? 'Routine bearbeiten' : 'Neue Routine'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Icon auswählen</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                        className="w-full flex items-center justify-between bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
                            {(() => {
                              const IconComp = ICON_MAP[newIcon] || Activity;
                              return <IconComp size={20} />;
                            })()}
                          </div>
                          <span className="font-medium">{newIcon}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isIconPickerOpen ? 180 : 0 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isIconPickerOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 p-3 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl grid grid-cols-6 gap-2 max-h-60 overflow-y-auto"
                          >
                            {SELECTABLE_ICONS.map((iconName) => {
                              const IconComp = ICON_MAP[iconName];
                              return (
                                <button
                                  key={iconName}
                                  onClick={() => {
                                    setNewIcon(iconName);
                                    setIsIconPickerOpen(false);
                                  }}
                                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                    newIcon === iconName 
                                      ? 'bg-yellow-400 text-yellow-950 scale-110 shadow-lg' 
                                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                                  }`}
                                >
                                  <IconComp size={20} />
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Titel</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="z.B. Abend-Winddown"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      {newGroup === 'supplement' ? 'Zeitpunkt' : 'Routine-Gruppe'}
                    </label>
                    <div className="relative">
                      {newGroup === 'supplement' ? (
                        <select 
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value as any)}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors appearance-none"
                        >
                          <option value="Morgens">Morgens</option>
                          <option value="Nach dem Frühstück">Nach dem Frühstück</option>
                          <option value="Abends">Abends</option>
                        </select>
                      ) : (
                        <select 
                          value={newGroup}
                          onChange={(e) => setNewGroup(e.target.value as any)}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors appearance-none"
                        >
                          <option value="daily">Tagesaufgaben</option>
                          <option value="morning">Morgen-Routine</option>
                          <option value="supplement">Supplemente</option>
                          <option value="evening">Abend-Routine</option>
                        </select>
                      )}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Kommentar / Info (z.B. 200ml)</label>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="z.B. 200ml oder 10 min"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Protokoll (eine Zeile pro Schritt)</label>
                    <textarea 
                      value={newProtocol}
                      onChange={(e) => setNewProtocol(e.target.value)}
                      placeholder="Schritt 1&#10;Schritt 2..."
                      rows={4}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Bell size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Erinnerung</span>
                      </div>
                      {newGroup === 'morning' && (
                        <button 
                          onClick={() => setNewReminderSync(!newReminderSync)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-sm transition-colors ${newReminderSync ? 'bg-yellow-400 text-yellow-950' : 'bg-surface-container-highest text-on-surface-variant'}`}
                        >
                          {newReminderSync ? 'Sync mit Wecker (+5m)' : 'Feste Zeit'}
                        </button>
                      )}
                    </div>

                    {!newReminderSync ? (
                      <div className="flex items-center gap-3">
                        <input 
                          type="time" 
                          value={newReminderTime}
                          onChange={(e) => setNewReminderTime(e.target.value)}
                          className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-yellow-400"
                        />
                        <button 
                          onClick={() => setNewReminderTime('')}
                          className="p-2 text-on-surface-variant hover:text-error transition-colors"
                          title="Erinnerung löschen"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-on-surface-variant italic">
                        Erinnerung erfolgt automatisch 5 Minuten nach der Wecker-Zeit ({wakeUpTime}).
                      </div>
                    )}
                  </div>


                  <div className="pt-2 gap-3 flex flex-col">
                    <button 
                      onClick={handleSaveRoutine}
                      disabled={!newTitle.trim()}
                      className="w-full bg-yellow-400 text-yellow-950 font-headline font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                    >
                      {editingId ? 'Änderungen speichern' : 'Routine speichern'}
                    </button>
                    
                    {editingId && (
                      <button 
                        onClick={handleDeleteRoutine}
                        className="w-full flex items-center justify-center gap-2 text-error font-headline font-bold py-3 rounded-xl bg-error/10 hover:bg-error/20 active:scale-[0.98] transition-all"
                      >
                        <Trash2 size={18} />
                        Löschen
                      </button>
                    )}
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

function RoutineGroup({ title, items, group, onEdit }: any) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-[0.6875rem] tracking-wider uppercase text-yellow-400 mb-3 font-medium">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item: any) => {
          const IconComponent = item.icon || Pill;
          return (
            <RoutineCard 
              key={item.id}
              title={item.title || item.name}
              comment={item.value || item.time}
              icon={<IconComponent size={20} className="text-yellow-400" />}
              onClick={() => onEdit(item, group)}
            />
          );
        })}
      </div>
    </section>
  );
}

function RoutineCard({ title, icon, comment, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-surface-container-low p-5 rounded-sm group hover:bg-surface-container-high transition-colors relative cursor-pointer"
    >
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <div className="p-2 text-on-surface-variant/50 group-hover:text-yellow-400 transition-colors rounded-full">
          <Edit2 size={16} />
        </div>
        <div className="p-2">
          {icon}
        </div>
      </div>
      <div className="pr-24">
        <h3 className="font-headline text-lg font-bold flex-1 break-all hyphens-auto">{title}</h3>
      </div>
    </div>
  );
}
