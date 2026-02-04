import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getXPLevel(xp: number): { level: number; progress: number; nextLevel: number } {
  // XP formula: each level requires 100 * level XP
  let level = 1;
  let remainingXP = xp;
  
  while (remainingXP >= 100 * level) {
    remainingXP -= 100 * level;
    level++;
  }
  
  const nextLevelXP = 100 * level;
  const progress = Math.round((remainingXP / nextLevelXP) * 100);
  
  return { level, progress, nextLevel: nextLevelXP - remainingXP };
}
