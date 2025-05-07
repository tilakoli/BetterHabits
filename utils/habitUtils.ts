import { Habit } from '@/types';
import { formatDate, isSameDay } from './dateUtils';

/**
 * Calculate streak based on completion history
 */
export function calculateStreak(completionHistory: Record<string, boolean>): number {
  const today = new Date();
  let currentDate = new Date(today);
  let streak = 0;
  
  // If today is completed, include it in the streak
  const todayFormatted = formatDate(today);
  if (completionHistory[todayFormatted]) {
    streak = 1;
    // Start checking from yesterday
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Check consecutive previous days
  while (true) {
    const dateStr = formatDate(currentDate);
    if (!completionHistory[dateStr]) {
      break;
    }
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

/**
 * Calculate the best streak for a habit
 */
export function calculateBestStreak(completionHistory: Record<string, boolean>): number {
  if (Object.keys(completionHistory).length === 0) return 0;
  
  // Sort dates in ascending order
  const dates = Object.keys(completionHistory)
    .filter(date => completionHistory[date])
    .sort();
  
  if (dates.length === 0) return 0;
  
  let currentStreak = 1;
  let bestStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    
    // Check if dates are consecutive
    prevDate.setDate(prevDate.getDate() + 1);
    
    if (isSameDay(prevDate, currDate)) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return bestStreak;
}

/**
 * Mark a habit as completed for today
 */
export function completeHabitForToday(habit: Habit): Habit {
  const today = formatDate(new Date());
  const updatedHistory = { ...habit.progress.completionHistory };
  updatedHistory[today] = true;
  
  const currentStreak = calculateStreak(updatedHistory);
  const bestStreak = Math.max(currentStreak, habit.progress.bestStreak);
  
  return {
    ...habit,
    progress: {
      ...habit.progress,
      daysCompleted: habit.progress.daysCompleted + 1,
      currentStreak,
      bestStreak,
      completionHistory: updatedHistory,
    },
  };
}

/**
 * Calculate progress percentage for a habit
 */
export function calculateProgressPercentage(habit: Habit): number {
  return (habit.progress.daysCompleted / habit.duration) * 100;
}

/**
 * Check if a habit is complete (all days completed)
 */
export function isHabitComplete(habit: Habit): boolean {
  return habit.progress.daysCompleted >= habit.duration;
}

/**
 * Get motivational quotes
 */
export function getRandomMotivationalQuote(): string {
  const quotes = [
    "The secret of getting ahead is getting started.",
    "A journey of a thousand miles begins with a single step.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Your daily habits define your future.",
    "Small consistent steps lead to massive results over time.",
    "Success is built one day, one habit at a time.",
    "Discipline is choosing between what you want now and what you want most.",
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
} 