export interface Habit {
  id: string;
  name: string;
  type: 'guided' | 'custom';
  category: string;
  frequency: 'daily' | string[]; // daily or array of specific days
  duration: number; // days
  startDate: string;
  progress: {
    daysCompleted: number;
    currentStreak: number;
    bestStreak: number;
    completionHistory: Record<string, boolean>; // date-keyed object of completions
  };
  reminderTime: string;
  rewards: {
    badges: string[];
    points: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  joinDate: string;
  streakCount: number;
  badges: string[];
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  participationCount: number;
  featured: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  ChallengeSelection: undefined;
  HabitCreation: undefined;
  HabitDetail: { habitId: string };
  ActivityLogging: { habitId: string };
  Rewards: undefined;
  Settings: undefined;
  Progress: undefined;
}; 