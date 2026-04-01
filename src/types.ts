import { 
  LayoutGrid, 
  Repeat, 
  Info, 
  Droplets, 
  Sun, 
  Activity, 
  Snowflake, 
  Pill, 
  Moon, 
  ChevronRight, 
  Play,
  Zap,
  AlarmClock,
  Timer,
  Brain,
  Dumbbell,
  Stethoscope,
  Apple
} from 'lucide-react';

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  url?: string;
  isUserAdded?: boolean;
}

export interface ShoppingCategory {
  category: string;
  items: ShoppingItem[];
}

export type Tab = 'dashboard' | 'routines' | 'bildung' | 'einkaufsliste';

export interface RoutineItem {
  id: string;
  title: string;
  value: string;
  icon: string;
  completed: boolean;
  color: string;
  protocol?: string[];
  videoUrl?: string;
  reminderTime?: string; // HH:mm
  reminderSyncWithWecker?: boolean; // For morning routines: Wecker + 5 min
}

export interface Supplement {
  id: string;
  name: string;
  time: 'Morgens' | 'Nach dem Frühstück' | 'Abends';
  icon: string;
  color: string;
  completed?: boolean;
  protocol?: string[];
  value?: string;
  reminderTime?: string; // HH:mm
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  icon: any;
  color: string;
  featured?: boolean;
}

export interface Profile {
  name: string;
  avatarUrl: string;
  level: number;
  totalXP: number;
  lastResetDate: string;
}
