/**
 * XP Calculation Formula (Triangular Numbers)
 * Level 1: 0 XP
 * Level 2: 1,000 XP
 * Level 3: 3,000 XP
 * Level 4: 6,000 XP
 * Level 5: 10,000 XP
 * 
 * Formula: XP = 500 * L * (L - 1)
 */

export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1;
  // L = (1 + sqrt(1 + XP / 125)) / 2
  const level = (1 + Math.sqrt(1 + xp / 125)) / 2;
  return Math.floor(level);
}

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return 500 * level * (level - 1);
}

export function getXPProgressInLevel(totalXP: number): { 
  currentLevel: number; 
  xpInCurrentLevel: number; 
  xpNeededForNextLevel: number; 
  progressPercentage: number;
} {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
  
  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage
  };
}

export function getBiohackerRank(level: number): string {
  if (level >= 50) return "Transhumanist Overlord";
  if (level >= 45) return "Biological Architect";
  if (level >= 40) return "Master Optimizer";
  if (level >= 35) return "Cellular Commander";
  if (level >= 30) return "Metabolic Master";
  if (level >= 25) return "Neural Navigator";
  if (level >= 20) return "Bio-Hacking Veteran";
  if (level >= 15) return "System Specialist";
  if (level >= 10) return "Optimization Adept";
  if (level >= 5) return "Health Explorer";
  return "Biohacker Initiate";
}
