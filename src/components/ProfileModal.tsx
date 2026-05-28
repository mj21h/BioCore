import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Target, Zap, Activity, RotateCcw, Star, Camera, Edit2, Check, Download, Upload, Copy } from 'lucide-react';

import { getXPProgressInLevel, getXPForLevel, getBiohackerRank } from '../lib/xp';
import { Profile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  todayXP: number;
  bildungXP: number;
  onUpdateProfile: (updates: Partial<Profile>) => void;
}

export default function ProfileModal({ isOpen, onClose, profile, todayXP, bildungXP, onUpdateProfile }: ProfileModalProps) {
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(profile.name || '');
  const [editAvatar, setEditAvatar] = React.useState(profile.avatarUrl || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importInputRef = React.useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = React.useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [showCodeBackup, setShowCodeBackup] = React.useState(false);
  const [pastedCode, setPastedCode] = React.useState('');

  const handleExportTextCode = () => {
    try {
      const backupData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('biohacker_')) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      
      const jsonString = JSON.stringify(backupData);
      
      // Safe base64 encode supporting UTF-8 (Umlauts, emojis)
      const base64Code = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      
      navigator.clipboard.writeText(base64Code)
        .then(() => {
          setBackupStatus({ 
            type: 'success', 
            message: 'Sicherungscode kopiert! Speichere den Text an einem sicheren Ort (z.B. Notizen/E-Mail).' 
          });
        })
        .catch(() => {
          setBackupStatus({ 
            type: 'error', 
            message: 'Automatisches Kopieren fehlgeschlagen. Bitte markiere den Code manuell.' 
          });
        });

      setTimeout(() => {
        setBackupStatus({ type: null, message: '' });
      }, 7000);
    } catch (error) {
      console.error('Export text code error', error);
      setBackupStatus({ type: 'error', message: 'Fehler beim Generieren des Codes.' });
    }
  };

  const handleImportTextCode = () => {
    if (!pastedCode.trim()) {
      setBackupStatus({ type: 'error', message: 'Bitte füge zuerst deinen Sicherungscode in das Textfeld ein.' });
      return;
    }

    try {
      // Decode UTF-8 safe base64
      const decodedJson = decodeURIComponent(Array.prototype.map.call(atob(pastedCode.trim()), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const data = JSON.parse(decodedJson);
      
      const keys = Object.keys(data);
      const hasBiohackerKeys = keys.some(key => key.startsWith('biohacker_'));
      
      if (!hasBiohackerKeys) {
        setBackupStatus({ type: 'error', message: 'Ungültiger Code. Keine Biohacker-Daten gefunden.' });
        return;
      }
      
      keys.forEach(key => {
        if (key.startsWith('biohacker_') && data[key] !== null) {
          localStorage.setItem(key, data[key]);
        }
      });
      
      setBackupStatus({ type: 'success', message: 'Daten erfolgreich wiederhergestellt! Lade die App neu...' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Import text code error', err);
      setBackupStatus({ type: 'error', message: 'Ungültiger Code. Bitte stelle sicher, dass du den vollständigen Code kopiert hast.' });
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('biohacker_')) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biohacker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Copy to clipboard too as a convenient alternative
      navigator.clipboard.writeText(jsonString)
        .then(() => {
          setBackupStatus({ 
            type: 'success', 
            message: 'Anmeldedaten kopiert & heruntergeladen! Sichere die Datei an einem sicheren Ort.' 
          });
        })
        .catch(() => {
          setBackupStatus({ 
            type: 'success', 
            message: 'Backup-Datei erfolgreich auf dein Gerät heruntergeladen!' 
          });
        });
      
      // Auto clear status after 4 seconds
      setTimeout(() => {
        setBackupStatus({ type: null, message: '' });
      }, 5000);
    } catch (error) {
      console.error('Export error', error);
      setBackupStatus({ type: 'error', message: 'Fehler beim Exportieren der Daten.' });
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        
        const keys = Object.keys(data);
        const hasBiohackerKeys = keys.some(key => key.startsWith('biohacker_'));
        
        if (!hasBiohackerKeys) {
          setBackupStatus({ type: 'error', message: 'Ungültiges Dateiformat. Keine Biohacker-Daten gefunden.' });
          return;
        }
        
        keys.forEach(key => {
          if (key.startsWith('biohacker_') && data[key] !== null) {
            localStorage.setItem(key, data[key]);
          }
        });
        
        setBackupStatus({ type: 'success', message: 'Daten erfolgreich wiederhergestellt! Die App wird neu geladen...' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setBackupStatus({ type: 'error', message: 'Fehler beim Lesen der Backup-Datei.' });
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentTotalXP = profile.totalXP + todayXP + bildungXP;
  
  // Calculate level dynamically based on total XP using exponential formula
  const { 
    currentLevel, 
    progressPercentage 
  } = getXPProgressInLevel(currentTotalXP);
  
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const rank = getBiohackerRank(currentLevel);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline font-bold text-2xl text-on-surface">Lokales Profil</h2>
                <button 
                  onClick={onClose}
                  className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-high mb-4 relative">
                    <img 
                      src={editAvatar || profile.avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded-full opacity-50"></div>
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 right-0 p-2 bg-yellow-400 text-yellow-950 rounded-full shadow-lg active:scale-90 transition-transform"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {isEditing ? (
                  <div className="w-full space-y-4 mt-2">
                    <div className="space-y-1">
                      <label className="text-[0.625rem] uppercase font-bold text-on-surface-variant tracking-widest ml-1">Name</label>
                      <input 
                        type="text"
                        value={editName || ''}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:border-yellow-400 transition-colors"
                        placeholder="Dein Name"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setEditName(profile.name);
                          setEditAvatar(profile.avatarUrl);
                        }}
                        className="flex-1 py-2 text-on-surface-variant font-bold text-sm bg-surface-container-high rounded-xl"
                      >
                        Abbrechen
                      </button>
                      <button 
                        onClick={() => {
                          onUpdateProfile({ name: editName, avatarUrl: editAvatar });
                          setIsEditing(false);
                        }}
                        className="flex-1 py-2 text-yellow-950 font-bold text-sm bg-yellow-400 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        Speichern
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-bold text-3xl text-yellow-400">{profile.name}</h3>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-on-surface-variant hover:text-yellow-400 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <p className="text-on-surface-variant text-sm mt-1">{rank} • Level {currentLevel}</p>
                  </>
                )}
              </div>

              <div className="bg-surface-container-low rounded-2xl p-5 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Level Fortschritt</span>
                  <span className="text-sm font-bold text-yellow-400">{currentTotalXP.toLocaleString('de-DE')} / {xpForNextLevel.toLocaleString('de-DE')} XP</span>
                </div>
                <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                  />
                </div>
                <p className="text-center text-[0.6875rem] text-on-surface-variant mt-3">
                  Noch {(xpForNextLevel - currentTotalXP).toLocaleString('de-DE')} XP bis Level {currentLevel + 1}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-1.5">
                    <Zap size={16} />
                  </div>
                  <span className="text-lg font-bold text-on-surface">{todayXP.toLocaleString('de-DE')}</span>
                  <span className="text-[0.625rem] uppercase tracking-wider font-bold text-on-surface-variant mt-0.5">Heute</span>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-1.5">
                    <Star size={16} />
                  </div>
                  <span className="text-lg font-bold text-on-surface">{bildungXP.toLocaleString('de-DE')}</span>
                  <span className="text-[0.625rem] uppercase tracking-wider font-bold text-on-surface-variant mt-0.5">Bildung</span>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-1.5">
                    <Trophy size={16} />
                  </div>
                  <span className="text-lg font-bold text-on-surface">{profile.totalXP.toLocaleString('de-DE')}</span>
                  <span className="text-[0.625rem] uppercase tracking-wider font-bold text-on-surface-variant mt-0.5">Gesamt</span>
                </div>
              </div>

              {/* Daten sichern & wiederherstellen */}
              <div className="bg-surface-container-low rounded-2xl p-4 mb-6 space-y-4 border border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Daten sichern & wiederherstellen</span>
                </div>
                
                <p className="text-[0.6875rem] text-on-surface-variant leading-relaxed">
                  Sichere deinen gesamten Fortschritt (XP, Level, Routinen, Einkaufsliste), um deine Daten vor einer Neuinstallation oder einem App-Update zu schützen.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 active:scale-95 transition-all rounded-xl font-bold text-xs"
                    title="Als JSON-Sicherungsdatei herunterladen"
                  >
                    <Download size={14} />
                    Datei sichern
                  </button>

                  <label 
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high text-on-surface hover:bg-surface-container-highest cursor-pointer active:scale-95 transition-all rounded-xl font-bold text-xs"
                    title="JSON-Sicherungsdatei hochladen"
                  >
                    <Upload size={14} />
                    Datei laden
                    <input 
                      type="file"
                      ref={importInputRef}
                      onChange={handleImportBackup}
                      accept=".json"
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Trenner und Text-Zahlencode Alternative */}
                <div className="pt-2 border-t border-outline-variant/10 space-y-3">
                  <button
                    onClick={() => setShowCodeBackup(!showCodeBackup)}
                    className="w-full text-left text-[0.6875rem] font-bold text-yellow-400/80 hover:text-yellow-400 transition-colors flex items-center justify-between"
                  >
                    <span>{showCodeBackup ? '▼' : '►'} Sicherung über Text-Code (einfacher auf Handys)</span>
                  </button>

                  {showCodeBackup && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-1"
                    >
                      <button 
                        onClick={handleExportTextCode}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-yellow-400/5 text-yellow-400 hover:bg-yellow-400/15 border border-yellow-400/20 active:scale-95 transition-all rounded-xl font-bold text-xs"
                      >
                        <Copy size={13} />
                        Code erstellen & kopieren
                      </button>

                      <div className="space-y-1.5">
                        <label className="text-[0.625rem] text-on-surface-variant font-medium">Sicherungscode einfügen:</label>
                        <textarea
                          value={pastedCode}
                          onChange={(e) => setPastedCode(e.target.value)}
                          placeholder="Füge hier deinen kopierten Bestätigungscode ein..."
                          className="w-full h-16 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 text-[10px] text-on-surface font-mono resize-none focus:outline-none focus:border-yellow-400/50"
                        />
                        <button 
                          onClick={handleImportTextCode}
                          className="w-full py-2 bg-yellow-400 text-yellow-950 hover:bg-yellow-350 active:scale-95 transition-all rounded-xl font-bold text-xs"
                        >
                          Code aktivieren & laden
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {backupStatus.type && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[0.6875rem] font-medium p-2.5 rounded-lg text-center ${
                      backupStatus.type === 'success' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {backupStatus.message}
                  </motion.div>
                )}
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex items-start gap-3 mb-6">
                <InfoIcon />
                <p className="text-[0.6875rem] text-on-surface-variant leading-relaxed">
                  Dein Fortschritt wird lokal auf diesem Gerät gespeichert. Jeden Tag um Mitternacht werden deine Aufgaben zurückgesetzt und die gesammelten XP deines Tages werden auf dein Gesamtkonto gebucht.
                </p>
              </div>

              {!showResetConfirm ? (
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 text-red-400 font-bold text-sm bg-red-400/5 rounded-xl border border-red-400/20 hover:bg-red-400/10 transition-colors"
                >
                  <RotateCcw size={16} />
                  App zurücksetzen
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-xs text-red-400 font-bold uppercase tracking-wider">Bist du sicher?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="py-3 text-on-surface-variant font-bold text-sm bg-surface-container-high rounded-xl transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="py-3 text-yellow-950 font-bold text-sm bg-red-400 rounded-xl transition-colors"
                    >
                      Ja, löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoIcon() {
  return (
    <div className="text-yellow-400 flex-shrink-0 mt-0.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    </div>
  );
}
