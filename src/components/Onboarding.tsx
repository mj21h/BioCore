import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Settings,
  Repeat,
  ShoppingCart, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Bell,
  ShieldCheck,
  X
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Willkommen, Biohacker!',
    description: 'Diese App ist dein persönlicher Begleiter zur Optimierung deiner körperlichen und geistigen Performance.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  },
  {
    id: 'dashboard',
    title: 'Fortschritt',
    description: 'Hier siehst du deinen täglichen Fortschritt. Sammle XP für jede erledigte Aufgabe und steigere dein Level.',
    icon: Repeat,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10'
  },
  {
    id: 'routines',
    title: 'Routinen & Aufgaben',
    description: 'Verwalte deine Morgen- und Abendroutinen sowie tägliche Aufgaben und Supplemente. Alles ist anpassbar.',
    icon: Settings,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  },
  {
    id: 'shopping',
    title: 'Einkaufsliste',
    description: 'Behalte den Überblick über notwendige Lebensmittel und Supplemente für dein Biohacking-Protokoll.',
    icon: ShoppingCart,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10'
  },
  {
    id: 'education',
    title: 'Bildung',
    description: 'Vertiefe dein Wissen in der Datenbank. Schließe Video-Level ab, um Boni freizuschalten und dein Wissen zu erweitern.',
    icon: BookOpen,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10'
  },
  {
    id: 'permissions',
    title: 'Berechtigungen',
    description: 'Erlaube Benachrichtigungen und Wecker-Sync, damit dich die App optimal an deine Routinen erinnern kann.',
    icon: Bell,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  }
];

export default function Onboarding({ onComplete, setNotificationsEnabled }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  const requestPermissions = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
    // Alarm permission simulation
    setShowPermissionPopup(false);
    onComplete();
  };

  const nextStep = async () => {
    if (currentStep === STEPS.length - 1) {
      setShowPermissionPopup(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-[100] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-sm w-full bg-surface border border-outline-variant/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {STEPS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-yellow-400' : 'w-2 bg-surface-container-highest'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className={`w-20 h-20 ${step.bgColor} rounded-3xl mx-auto mb-6 flex items-center justify-center ${step.color} shadow-lg`}>
              <Icon size={40} />
            </div>
            
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-3">
              {step.title}
            </h2>
            
            <p className="text-on-surface-variant mb-10 leading-relaxed min-h-[80px]">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button 
              onClick={prevStep}
              className="flex-1 bg-surface-container-high text-on-surface font-headline font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              Zurück
            </button>
          )}
          
          <button 
            onClick={nextStep}
            className={`flex-[2] ${currentStep === STEPS.length - 1 ? 'bg-green-500 text-green-950' : 'bg-yellow-400 text-yellow-950'} font-headline font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/10`}
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                Starten
                <CheckCircle2 size={20} />
              </>
            ) : (
              <>
                Weiter
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Permission Popup Simulation */}
        <AnimatePresence>
          {showPermissionPopup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-surface border border-outline-variant/20 rounded-3xl p-6 shadow-2xl max-w-[280px] w-full text-center"
                >
                  <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                    Berechtigungen erteilen?
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-6">
                    Möchtest du "Biohacker App" erlauben, dir Mitteilungen zu senden und auf deinen Wecker zuzugreifen?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={requestPermissions}
                      className="w-full bg-yellow-400 text-yellow-950 font-headline font-bold py-3 rounded-xl active:scale-[0.98] transition-all"
                    >
                      Erlauben
                    </button>
                    <button
                      onClick={() => {
                        setShowPermissionPopup(false);
                        onComplete();
                      }}
                      className="w-full text-on-surface-variant font-headline font-bold py-3 rounded-xl active:scale-[0.98] transition-all"
                    >
                      Nicht erlauben
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
