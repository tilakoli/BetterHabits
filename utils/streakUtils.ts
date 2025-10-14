import { HabitParticipation } from '@/types';

// Calculate streak for a specific challenge
export const calculateChallengeStreak = (participation: HabitParticipation): number => {
  const today = new Date().toISOString().split('T')[0];
  const dailyProgress = participation.dailyProgress || {};
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Count backwards from today
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const progress = dailyProgress[dateStr];
    
    // Stop if no progress or not completed
    if (!progress || !progress.completed) {
      break;
    }
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Stop if we go before challenge start date
    if (currentDate < participation.startDate.toDate()) {
      break;
    }
  }
  
  return streak;
};

// Calculate longest streak in a challenge
export const calculateLongestChallengeStreak = (participation: HabitParticipation): number => {
  const dailyProgress = participation.dailyProgress || {};
  const dates = Object.keys(dailyProgress).sort();
  
  let longest = 0;
  let current = 0;
  
  for (let i = 0; i < dates.length; i++) {
    const progress = dailyProgress[dates[i]];
    
    if (progress.completed) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  
  return longest;
};

// Check if within grace period (2 days after challenge ends)
export const isWithinGracePeriod = (lastActiveDate: string): boolean => {
  const last = new Date(lastActiveDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays <= 2;
};

// Get streak milestone (7, 14, 21, 30, etc.)
export const getStreakMilestone = (streak: number): number | null => {
  const milestones = [7, 14, 21, 30, 60, 90, 100];
  
  if (milestones.includes(streak)) {
    return streak;
  }
  
  return null;
};