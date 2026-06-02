import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Routines from './components/Routines';
import Bildung from './components/Bildung';
import ShoppingList from './components/ShoppingList';
import ProfileModal from './components/ProfileModal';
import UndoToast from './components/UndoToast';
import Onboarding from './components/Onboarding';
import { Tab, RoutineItem, Supplement, ShoppingCategory } from './types';
import confetti from 'canvas-confetti';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GROUPS, LIBRARY_ITEMS } from './constants/bildung';

import { getLevelFromXP } from './lib/xp';
import { rescheduleAllNativeNotifications, checkNotificationPermission, getSystemNextAlarm } from './lib/notifications';

import { INITIAL_MORNING_ROUTINES, INITIAL_EVENING_ROUTINES, INITIAL_DAILY_TASKS, INITIAL_SUPPLEMENTS, SHOPPING_LIST_CATEGORIES } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);
  
  // Capacitor Initialization
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#111317' });
    }
  }, []);

  // Lifted States
  const [routines, setRoutines] = useLocalStorage('biohacker_routines', INITIAL_MORNING_ROUTINES);
  const [supplements, setSupplements] = useLocalStorage('biohacker_supplements', INITIAL_SUPPLEMENTS);
  const [eveningRoutines, setEveningRoutines] = useLocalStorage('biohacker_eveningRoutines', INITIAL_EVENING_ROUTINES);
  const [dailyTasks, setDailyTasks] = useLocalStorage('biohacker_dailyTasks', INITIAL_DAILY_TASKS);
  const [shoppingList, setShoppingList] = useLocalStorage<any[]>('biohacker_shoppingList', SHOPPING_LIST_CATEGORIES);

  // Migration: Ensure new shopping list items are added (excluding redundant similar entries)
  useEffect(() => {
    if (!shoppingList || shoppingList.length === 0) return;

    const itemsToAdd = [
      { category: 'Milchprodukte', item: { id: 'd10', name: 'Griechischer Joghurt', completed: false } },
      { category: 'Gemüse', item: { id: 'v11', name: 'Wild Heidelbeeren', completed: false } },
      { category: 'Gemüse', item: { id: 'v12', name: 'Ingwer', completed: false } },
      { category: 'Fleisch', item: { id: 'm12', name: 'Rinderhackfleisch', completed: false } },
      { category: 'Fleisch', item: { id: 'm13', name: 'Ribeye Steak', completed: false } },
      { category: 'Käse', item: { id: 'c9', name: 'Bergkäse', completed: false } },
      { category: 'Gemüse', item: { id: 'v13', name: 'Karotten', completed: false } },
      { category: 'Gemüse', item: { id: 'v14', name: 'Gurke', completed: false } },
      { category: 'Gemüse', item: { id: 'v15', name: 'Sauerkraut', completed: false } },
      { category: 'Gemüse', item: { id: 'v16', name: 'Zucchini', completed: false } },
      { category: 'Nüsse & Samen', item: { id: 'n6', name: 'Macadamia-Nüsse', completed: false } },
      { category: 'Nüsse & Samen', item: { id: 'n7', name: 'Chiasamen', completed: false } },
      { category: 'Nüsse & Samen', item: { id: 'n8', name: 'Flohsamenschalen', completed: false } },
      { category: 'Nüsse & Samen', item: { id: 'n9', name: 'Mandelmus', completed: false } },
      { category: 'Nüsse & Samen', item: { id: 'n10', name: 'Leinsamenmehl', completed: false } }
    ];

    let changed = false;
    const newList = [...shoppingList];

    itemsToAdd.forEach(({ category, item }) => {
      const catIndex = newList.findIndex(c => c.category === category);
      if (catIndex !== -1) {
        const hasItem = newList[catIndex].items.some((i: any) => i.name.toLowerCase() === item.name.toLowerCase());
        if (!hasItem) {
          newList[catIndex].items.push(item);
          changed = true;
        }
      }
    });

    if (changed) {
      setShoppingList(newList);
    }
  }, [shoppingList, setShoppingList]);

  // Migration: Automatically search and remove similar/duplicate entries, migrate Getreide-Alternativen to Nüsse & Samen
  useEffect(() => {
    if (!shoppingList || shoppingList.length === 0) return;

    let changed = false;
    let getreideItems: any[] = [];

    // 1. Remove Getreide-Alternativen and extract its items
    let filteredList = shoppingList.filter(cat => {
      if (cat.category === 'Getreide-Alternativen') {
        getreideItems = cat.items || [];
        changed = true;
        return false;
      }
      return true;
    });

    // Ensure Nüsse & Samen exists to hold the migrated/moved items
    let nuesseSamenIndex = filteredList.findIndex(cat => cat.category === 'Nüsse & Samen');
    if (nuesseSamenIndex === -1 && getreideItems.length > 0) {
      const initialNuesseSamen = SHOPPING_LIST_CATEGORIES.find(cat => cat.category === 'Nüsse & Samen');
      if (initialNuesseSamen) {
        filteredList.push({ ...initialNuesseSamen, items: [] });
        nuesseSamenIndex = filteredList.length - 1;
        changed = true;
      }
    }

    // Merge extracted items into Nüsse & Samen safely
    if (getreideItems.length > 0 && nuesseSamenIndex !== -1) {
      const nuesseSamenCat = { ...filteredList[nuesseSamenIndex] };
      nuesseSamenCat.items = [...nuesseSamenCat.items];

      getreideItems.forEach((subItem: any) => {
        const nameLower = subItem.name.trim().toLowerCase();
        const existingItemIndex = nuesseSamenCat.items.findIndex(
          (i: any) => i.name.trim().toLowerCase() === nameLower
        );

        if (existingItemIndex === -1) {
          nuesseSamenCat.items.push({
            id: 'n_mig_' + subItem.id,
            name: subItem.name,
            completed: subItem.completed || false
          });
          changed = true;
        } else {
          if (subItem.completed && !nuesseSamenCat.items[existingItemIndex].completed) {
            nuesseSamenCat.items[existingItemIndex].completed = true;
            changed = true;
          }
        }
      });

      filteredList[nuesseSamenIndex] = nuesseSamenCat;
    }

    // 2. Clear exact duplicates and similar entries in categories, and handle cross-category misplacement (like Kürbiskerne left behind)
    const hasNuesseSamen = filteredList.some(cat => cat.category === 'Nüsse & Samen');
    
    const newList = filteredList.map(cat => {
      const items = [...cat.items];
      const initialLength = items.length;

      // Check current category item existence
      const hasHaehnchenbrust = items.some(i => i.name.toLowerCase() === 'hähnchenbrust');
      const hasRinderleberWeide = items.some(i => i.name.toLowerCase() === 'rinderleber (weiderind)');
      const hasEierDetail = items.some(i => i.name.toLowerCase() === 'eier (insb. eigelb)');
      const hasLachsWild = items.some(i => i.name.toLowerCase() === 'lachs (wild)');
      const hasSardinenOel = items.some(i => i.name.toLowerCase() === 'sardinen in olivenöl');
      const hasKnochenbrueheSelbst = items.some(i => i.name.toLowerCase() === 'knochenbrühe selbstgemacht');

      const filteredItems = items.filter(i => {
        const nameLower = i.name.trim().toLowerCase();

        // Cross-category checks: If we have 'Nüsse & Samen', remove moved item names from all other categories
        if (cat.category !== 'Nüsse & Samen' && hasNuesseSamen) {
          if (
            nameLower === 'kürbiskerne' ||
            nameLower === 'chiasamen' ||
            nameLower === 'flohsamenschalen' ||
            nameLower === 'mandelmus' ||
            nameLower === 'leinsamenmehl'
          ) {
            return false;
          }
        }

        // 1. We remove 'hähnchen' if we already have 'hähnchenbrust'
        if (nameLower === 'hähnchen' && hasHaehnchenbrust) return false;

        // 2. We remove generic rinderleber / rindfleisch(leber) if we already have 'rinderleber (weiderind)'
        if ((nameLower === 'rinderleber' || nameLower === 'rindfleisch (leber)') && hasRinderleberWeide) return false;

        // 3. We remove simple 'eier' if we have 'eier (insb. eigelb)'
        if (nameLower === 'eier' && hasEierDetail) return false;

        // 4. We remove 'wildlachs' if we have 'lachs (wild)'
        if (nameLower === 'wildlachs' && hasLachsWild) return false;

        // 5. We remove 'sardinen' if we have 'sardinen in olivenöl'
        if (nameLower === 'sardinen' && hasSardinenOel) return false;

        // 6. We remove generic 'knochenbrühe' if we have 'knochenbrühe selbstgemacht'
        if (nameLower === 'knochenbrühe' && hasKnochenbrueheSelbst) return false;

        return true;
      });

      // Simple case-insensitive exact duplicate check within the single category
      const seenNames = new Set<string>();
      const uniqueItems = filteredItems.filter(i => {
        const nameKey = i.name.trim().toLowerCase();
        if (seenNames.has(nameKey)) {
          return false;
        }
        seenNames.add(nameKey);
        return true;
      });

      if (uniqueItems.length !== initialLength) {
        changed = true;
      }
      return {
        ...cat,
        items: uniqueItems
      };
    });

    if (changed) {
      setShoppingList(newList);
    }
  }, [shoppingList, setShoppingList]);

  // Migration: Ensure shopping list has all categories from constants
  useEffect(() => {
    if (!shoppingList || shoppingList.length === 0) {
      setShoppingList(SHOPPING_LIST_CATEGORIES);
      return;
    }

    const missingCategories = SHOPPING_LIST_CATEGORIES.filter(
      initialCat => !shoppingList.some(cat => cat.category === initialCat.category)
    );
    
    if (missingCategories.length > 0) {
      setShoppingList([
        ...shoppingList,
        ...missingCategories
      ]);
    }
  }, [shoppingList, setShoppingList]);

  // Migration: Update evening routine name and time if it's the old one
  useEffect(() => {
    const oldTitle = 'Blaulichtfilter & Regeneration';
    const oldTime = 'AB 21:30';
    const newTitle = 'Bildschirme ausschalten';
    const newTime = 'AB 20:00';

    const needsUpdate = eveningRoutines.some(
      routine => routine.title === oldTitle && routine.value === oldTime
    );

    if (needsUpdate) {
      setEveningRoutines(
        eveningRoutines.map(routine =>
          routine.title === oldTitle && routine.value === oldTime
            ? { ...routine, title: newTitle, value: newTime }
            : routine
        )
      );
    }
  }, [eveningRoutines, setEveningRoutines]);

  // Migration: Update Power Wasser routine
  useEffect(() => {
    const oldTitle = 'Wasser, Zitrone, Salz & Kollagen';
    const newTitle = 'Power Wasser';
    const newProtocol = [
      'Zuerst Zähne putzen!',
      '200–300 ml Wasser (Raumtemperatur)',
      'Saft einer halben Zitrone hinzufügen',
      'Eine Prise Meersalz & 3-4g Creapure einrühren',
      '1 Portion hydrolysiertes Kollagenpulver einrühren',
      'Mit Strohhalm zügig trinken (Zahnschmelzschutz)',
      'Anschließend Mund ausspülen'
    ];

    const needsUpdate = routines.some(r => r.title === oldTitle);

    if (needsUpdate) {
      setRoutines(
        routines.map(r =>
          r.title === oldTitle
            ? { ...r, title: newTitle, protocol: newProtocol }
            : r
        )
      );
    }
  }, [routines, setRoutines]);

  // Migration: Rename Spazieren to Bewegen
  useEffect(() => {
    const oldTitle = 'Spazieren';
    const newTitle = 'Bewegen';
    
    const needsUpdate = dailyTasks.some(t => t.title === oldTitle);
    if (needsUpdate) {
      setDailyTasks(dailyTasks.map(t => t.title === oldTitle ? { ...t, title: newTitle } : t));
    }
  }, [dailyTasks, setDailyTasks]);

  // Migration: Remove Kaffee mit Creapure
  useEffect(() => {
    const titleToRemove = 'Kaffee mit Creapure';
    const hasRoutine = routines.some(r => r.title === titleToRemove || r.title === 'Kaffee mit Kreatin');

    if (hasRoutine) {
      setRoutines(routines.filter(r => r.title !== titleToRemove && r.title !== 'Kaffee mit Kreatin'));
    }
  }, [routines, setRoutines]);

  // Migration: Add 25 Squats (m_squats and e_squats) if missing
  useEffect(() => {
    const hasMorningSquats = routines.some(r => r.id === 'm_squats' || r.title === '25 Kniebeugen');
    if (!hasMorningSquats) {
      setRoutines([
        ...routines,
        {
          id: 'm_squats',
          title: '25 Kniebeugen',
          value: '25 WDH',
          icon: 'Activity',
          completed: false,
          color: 'text-yellow-400',
          protocol: [
            'Stelle die Füße schulterbreit auf',
            'Gehe tief in die Hocke, halte den Rücken gerade',
            'Knie zeigen leicht nach außen',
            'Atme beim Runtergehen ein, beim Aufstehen kräftig aus',
            'Absolviere 25 saubere Wiederholungen'
          ],
          videoUrl: 'https://youtu.be/BwvW80PHk88?si=JKFeOp2seH34uEym',
          reminderTime: '08:00',
          reminderSyncWithWecker: true
        }
      ]);
    }

    const hasEveningSquats = eveningRoutines.some(r => r.id === 'e_squats' || r.title === '25 Kniebeugen');
    if (!hasEveningSquats) {
      setEveningRoutines([
        ...eveningRoutines,
        {
          id: 'e_squats',
          title: '25 Kniebeugen',
          value: '25 WDH',
          icon: 'Activity',
          completed: false,
          color: 'text-yellow-400',
          protocol: [
            'Stelle die Füße schulterbreit auf',
            'Gehe tief in die Hocke, halte den Rücken gerade',
            'Knie zeigen leicht nach außen',
            'Atme beim Runtergehen ein, beim Aufstehen kräftig aus',
            'Absolviere 25 saubere Wiederholungen'
          ],
          videoUrl: 'https://youtu.be/BwvW80PHk88?si=JKFeOp2seH34uEym',
          reminderTime: '20:30'
        }
      ]);
    }
  }, [routines, eveningRoutines, setRoutines, setEveningRoutines]);

  // Migration: Rename Kreatin to Creapure in all routines and supplements
  useEffect(() => {
    let changed = false;
    
    const updateProtocol = (protocol?: string[]) => {
      if (!protocol) return protocol;
      const newProtocol = protocol.map(line => line.replace(/Kreatin/g, 'Creapure'));
      if (JSON.stringify(newProtocol) !== JSON.stringify(protocol)) {
        changed = true;
        return newProtocol;
      }
      return protocol;
    };

    const updatedRoutines = routines.map(r => ({
      ...r,
      title: r.title.replace(/Kreatin/g, 'Creapure'),
      protocol: updateProtocol(r.protocol)
    }));

    const updatedEveningRoutines = eveningRoutines.map(r => ({
      ...r,
      title: r.title.replace(/Kreatin/g, 'Creapure'),
      protocol: updateProtocol(r.protocol)
    }));

    const updatedDailyTasks = dailyTasks.map(r => ({
      ...r,
      title: r.title.replace(/Kreatin/g, 'Creapure'),
      protocol: updateProtocol(r.protocol)
    }));

    const updatedSupplements = supplements.map(s => {
      const newName = s.name.replace(/Kreatin/g, 'Creapure');
      if (newName !== s.name) changed = true;
      return { ...s, name: newName };
    });

    if (changed) {
      setRoutines(updatedRoutines);
      setEveningRoutines(updatedEveningRoutines);
      setDailyTasks(updatedDailyTasks);
      setSupplements(updatedSupplements);
    }
  }, [routines, eveningRoutines, dailyTasks, supplements, setRoutines, setEveningRoutines, setDailyTasks, setSupplements]);

  const [profile, setProfile] = useLocalStorage('biohacker_profile', {
    name: 'Biohacker',
    avatarUrl: 'https://picsum.photos/seed/biohacker/200/200',
    level: 1,
    totalXP: 0,
    lastResetDate: new Date().toDateString()
  });

  const [todayXP, setTodayXP] = useLocalStorage('biohacker_todayXP', 0);
  const [completedVideos, setCompletedVideos] = useLocalStorage<string[]>('biohacker_completed_videos', []);
  const [fireworksTriggered, setFireworksTriggered] = useLocalStorage('biohacker_fireworks_triggered', false);
  
  const bildungXP = (() => {
    const baseXP = completedVideos.length * 1000;
    const bonusXP = GROUPS.reduce((acc, group) => {
      const isCompleted = group.itemIds.every(id => completedVideos.includes(id));
      return isCompleted ? acc + group.bonus : acc;
    }, 0);
    return baseXP + bonusXP;
  })();

  const hasPendingFortschritt = routines.some(r => !r.completed) || 
                                supplements.some(s => !s.completed) || 
                                eveningRoutines.some(r => !r.completed) || 
                                dailyTasks.some(t => !t.completed);

  const hasPendingBildung = LIBRARY_ITEMS.some(item => !completedVideos.includes(item.id));
  
  // Trigger fireworks when 100% completion is reached
  useEffect(() => {
    const allItems = [...routines, ...supplements, ...eveningRoutines, ...dailyTasks];
    const hasItems = allItems.length > 0;
    
    if (hasItems && !hasPendingFortschritt && !fireworksTriggered) {
      // Big burst
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'],
        zIndex: 1000
      });

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6'],
          zIndex: 1000
        });
      }, 250);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f59e0b', '#ef4444'],
          zIndex: 1000
        });
      }, 400);

      setFireworksTriggered(true);
    } else if (hasPendingFortschritt) {
      setFireworksTriggered(false);
    }
  }, [hasPendingFortschritt, fireworksTriggered, routines, supplements, eveningRoutines, dailyTasks, setFireworksTriggered]);

  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('biohacker_firstVisit', true);
  
  const [wakeUpTime, setWakeUpTime] = useLocalStorage('biohacker_wakeUpTime', '07:00');
  const [weckerSyncEnabled, setWeckerSyncEnabled] = useLocalStorage('biohacker_weckerSync', false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('biohacker_notifications', false);
  const [sentNotifications, setSentNotifications] = useLocalStorage<string[]>('biohacker_sent_notifications', []);
  const [lastResetDate, setLastResetDate] = useLocalStorage('biohacker_last_reset_date', new Date().toDateString());

  // Enable notifications by default on first visit if permission is granted
  useEffect(() => {
    const checkPerms = async () => {
      if (isFirstVisit === false) {
        const granted = await checkNotificationPermission();
        if (granted) {
          setNotificationsEnabled(true);
        }
      }
    };
    checkPerms();
  }, [isFirstVisit, setNotificationsEnabled]);

  // Synchronisieren des Weckers vom Android System
  useEffect(() => {
    if (!weckerSyncEnabled) return;

    const syncAlarm = async () => {
      const systemAlarm = await getSystemNextAlarm();
      if (systemAlarm) {
        setWakeUpTime(systemAlarm);
        console.log('Wecker erfolgreich synchronisiert:', systemAlarm);
      }
    };

    // Beim Laden und Einschalten ausführen
    syncAlarm();

    // Auch ausführen wenn das Fenster wieder fokussiert wird (Benutzer kommt zurück in die App)
    window.addEventListener('focus', syncAlarm);
    return () => {
      window.removeEventListener('focus', syncAlarm);
    };
  }, [weckerSyncEnabled, setWakeUpTime]);

  // Undo System
  const [lastDeleted, setLastDeleted] = useState<{
    item: any;
    type: 'morning' | 'evening' | 'daily' | 'supplement' | 'shopping';
    catIndex?: number;
    index?: number;
  } | null>(null);

  const triggerUndo = (item: any, type: any, catIndex?: number, index?: number) => {
    setLastDeleted({ item, type, catIndex, index });
  };

  const handleUndo = () => {
    if (!lastDeleted) return;

    const { item, type, catIndex, index } = lastDeleted;

    switch (type) {
      case 'morning':
        setRoutines([...routines, item]);
        break;
      case 'evening':
        setEveningRoutines([...eveningRoutines, item]);
        break;
      case 'daily':
        setDailyTasks([...dailyTasks, item]);
        break;
      case 'supplement':
        setSupplements([...supplements, item]);
        break;
      case 'shopping':
        if (catIndex !== undefined && index !== undefined) {
          const newList = [...shoppingList];
          newList[catIndex] = {
            ...newList[catIndex],
            items: [...newList[catIndex].items]
          };
          newList[catIndex].items.splice(index, 0, item);
          setShoppingList(newList);
        }
        break;
    }
    setLastDeleted(null);
  };

  // Keep values in ref to avoid race conditions and stale closures during dynamic daily reset
  const checkNewDayStateRef = useRef({ profile, todayXP, bildungXP, routines, supplements, eveningRoutines, dailyTasks });
  useEffect(() => {
    checkNewDayStateRef.current = { profile, todayXP, bildungXP, routines, supplements, eveningRoutines, dailyTasks };
  }, [profile, todayXP, bildungXP, routines, supplements, eveningRoutines, dailyTasks]);

  // Check for new day on mount and periodically
  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toDateString();
      const current = checkNewDayStateRef.current;
      if (current.profile.lastResetDate !== today) {
        // It's a new day!
        // Add only todayXP (from tasks) to totalXP. 
        // libraryXP is cumulative and handled separately in currentTotalXP calculation.
        let newTotalXP = current.profile.totalXP + current.todayXP;
        
        // Calculate new level
        let newLevel = getLevelFromXP(newTotalXP + current.bildungXP);

        setProfile({
          ...current.profile,
          level: newLevel,
          totalXP: newTotalXP,
          lastResetDate: today
        });

        // Reset todayXP
        setTodayXP(0);

        // Reset completion status of all tasks
        const resetItems = (items: any[]) => items.map(item => ({ ...item, completed: false }));
        
        setRoutines(resetItems(current.routines));
        setSupplements(resetItems(current.supplements));
        setEveningRoutines(resetItems(current.eveningRoutines));
        setDailyTasks(resetItems(current.dailyTasks));
        
        // Reset sent notifications for the new day
        setSentNotifications([]);
        setFireworksTriggered(false);
        setLastResetDate(today);
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [setProfile, setTodayXP, setRoutines, setSupplements, setEveningRoutines, setDailyTasks, setSentNotifications, setFireworksTriggered, setLastResetDate]);

  // Check for routine reminders
  useEffect(() => {
    const checkReminders = () => {
      if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const today = now.toDateString();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const allItems = [
        ...routines.map(r => ({ ...r, type: 'Morgen-Routine' })),
        ...eveningRoutines.map(r => ({ ...r, type: 'Abend-Routine' })),
        ...dailyTasks.map(t => ({ ...t, type: 'Tagesaufgabe' })),
        ...supplements.map(s => ({ ...s, title: s.name, type: 'Supplement' }))
      ];

      allItems.forEach(item => {
        let reminderTime = item.reminderTime;

        // Handle Wecker Sync (+5 min)
        if ('reminderSyncWithWecker' in item && item.reminderSyncWithWecker) {
          const [h, m] = wakeUpTime.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m + 5, 0);
          reminderTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }

        if (reminderTime && currentTime === reminderTime) {
          const notificationId = `${today}_${item.id}`;
          if (!sentNotifications.includes(notificationId)) {
            const notif = new Notification(`Erinnerung: ${item.title}`, {
              body: `Zeit für deine ${item.type}: ${item.title}.`,
              icon: '/favicon.ico'
            });
            notif.onclick = () => window.focus();
            setSentNotifications(prev => [...prev, notificationId]);
          }
        }
      });

      // Also check the main wake-up notification if weckerSyncEnabled is on
      if (weckerSyncEnabled && currentTime === wakeUpTime) {
        const wakeUpId = `${today}_wakeup`;
        if (!sentNotifications.includes(wakeUpId)) {
          const notif = new Notification('Guten Morgen! ☀️', {
            body: 'Zeit für dein Biohacking-Protokoll. Starte optimal in den Tag!',
            icon: '/favicon.ico'
          });
          notif.onclick = () => window.focus();
          setSentNotifications(prev => [...prev, wakeUpId]);
        }
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [routines, eveningRoutines, dailyTasks, supplements, wakeUpTime, notificationsEnabled, weckerSyncEnabled, sentNotifications, setSentNotifications]);

  // Handle native notifications rescheduling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    if (!notificationsEnabled) {
      rescheduleAllNativeNotifications([]);
      return;
    }

    const scheduleItems: any[] = [];
    
    // 1. Regular Wake Up Time
    if (weckerSyncEnabled && wakeUpTime) {
      scheduleItems.push({
        id: 'wakeup',
        title: 'Guten Morgen! ☀️',
        body: 'Zeit für dein Biohacking-Protokoll. Starte optimal in den Tag!',
        time: wakeUpTime
      });
    }

    // 2. All Routines & Supplements
    const allItems = [
      ...routines.map(r => ({ ...r, type: 'Morgen-Routine' })),
      ...eveningRoutines.map(r => ({ ...r, type: 'Abend-Routine' })),
      ...dailyTasks.map(t => ({ ...t, type: 'Tagesaufgabe' })),
      ...supplements.map(s => ({ ...s, title: s.name, type: 'Supplement' }))
    ];

    allItems.forEach(item => {
      // Spezieller Fall für "Wasser trinken" (Mehrmals täglich)
      if (item.id === 'd1' || item.title.toLowerCase().includes('wasser trinken')) {
        const waterTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
        waterTimes.forEach((time, index) => {
          scheduleItems.push({
            id: `${item.id}_${index}`,
            title: `Erinnerung: ${item.title}`,
            body: `Gib deinem Körper was er braucht. Zeit für ein Glas Wasser! 💧`,
            time: time
          });
        });
        return;
      }

      let reminderTime = item.reminderTime;

      // Handle Wecker Sync (+5 min)
      if ('reminderSyncWithWecker' in item && item.reminderSyncWithWecker) {
        const [h, m] = wakeUpTime.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m + 5, 0);
        reminderTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }

      if (reminderTime) {
        scheduleItems.push({
          id: item.id,
          title: `Erinnerung: ${item.title}`,
          body: `Zeit für deine ${item.type}: ${item.title}.`,
          time: reminderTime
        });
      }
    });

    rescheduleAllNativeNotifications(scheduleItems);
  }, [routines, eveningRoutines, dailyTasks, supplements, wakeUpTime, notificationsEnabled, weckerSyncEnabled]);

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      earnedXP={todayXP + bildungXP}
      profile={profile}
      onOpenProfile={() => setIsProfileOpen(true)}
      hasPendingFortschritt={hasPendingFortschritt}
      hasPendingBildung={hasPendingBildung}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          setEarnedXP={setTodayXP} 
          routines={routines}
          setRoutines={setRoutines}
          supplements={supplements}
          setSupplements={setSupplements}
          eveningRoutines={eveningRoutines}
          setEveningRoutines={setEveningRoutines}
          dailyTasks={dailyTasks}
          setDailyTasks={setDailyTasks}
          wakeUpTime={wakeUpTime}
        />
      )}
      {activeTab === 'routines' && (
        <Routines 
          routines={routines}
          setRoutines={setRoutines}
          supplements={supplements}
          setSupplements={setSupplements}
          eveningRoutines={eveningRoutines}
          setEveningRoutines={setEveningRoutines}
          dailyTasks={dailyTasks}
          setDailyTasks={setDailyTasks}
          wakeUpTime={wakeUpTime}
          setWakeUpTime={setWakeUpTime}
          weckerSyncEnabled={weckerSyncEnabled}
          setWeckerSyncEnabled={setWeckerSyncEnabled}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          onDelete={triggerUndo}
        />
      )}
      {activeTab === 'einkaufsliste' && (
        <ShoppingList 
          shoppingList={shoppingList}
          setShoppingList={setShoppingList}
          supplements={supplements}
          setSupplements={setSupplements}
          routines={routines}
          setRoutines={setRoutines}
          eveningRoutines={eveningRoutines}
          setEveningRoutines={setEveningRoutines}
          dailyTasks={dailyTasks}
          setDailyTasks={setDailyTasks}
          onDelete={triggerUndo}
        />
      )}
      {activeTab === 'bildung' && (
        <Bildung 
          completedVideos={completedVideos} 
          setCompletedVideos={setCompletedVideos} 
        />
      )}
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={profile}
        todayXP={todayXP}
        bildungXP={bildungXP}
        onUpdateProfile={(updates) => setProfile({ ...profile, ...updates })}
      />

      <AnimatePresence>
        {isFirstVisit && (
          <Onboarding 
            onComplete={() => setIsFirstVisit(false)} 
            setNotificationsEnabled={setNotificationsEnabled}
          />
        )}
      </AnimatePresence>

      <UndoToast 
        isVisible={!!lastDeleted}
        message={`${lastDeleted?.item?.title || lastDeleted?.item?.name} gelöscht`}
        onUndo={handleUndo}
        onClose={() => setLastDeleted(null)}
      />
    </Layout>
  );
}
