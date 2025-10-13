// Core Types
export type GoalType = 'number' | 'boolean' | 'time';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeType = 'walking' | 'reading' | 'running' | 'meditation' | 'water' | 'exercise' | 'generic';

// Daily Progress - Updated for challenge-specific tracking
export interface DailyProgress {
  completed: boolean;
  timestamp: any;
  data?: ChallengeProgressData; // Typed challenge-specific data
}

// Challenge-specific progress data
export type ChallengeProgressData = 
  | { type: 'walking'; steps: number }
  | { type: 'reading'; pagesRead: number; reflection?: string; bookName?: string }
  | { type: 'meditation'; minutes: number; notes?: string }
  | { type: 'water'; glasses: number; ml?: number }
  | { type: 'exercise'; reps: number; difficulty?: string; notes?: string }
  | { type: 'generic' }; // For simple yes/no

// Habit Template (challenge) - Updated with type field
export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ChallengeType; // Added for different challenge types
  duration: number; // in days
  dailyGoal: {
    type: GoalType;
    target: number;
    unit: string;
  };
  // Future: challenge-specific configuration
  config?: {
    // For reading: { unit: 'pages', target: 10 }
    // For running: { unit: 'minutes', target: 15 }
    // For meditation: { unit: 'minutes', target: 10 }
    [key: string]: any;
  };
  createdBy: string; // 'admin' or user ID
  isPublic: boolean;
  difficulty: Difficulty;
  icon: string;
  color: string;
  createdAt: any;
  participantCount: number;
  tags: string[];
}

export interface ChallengeInputConfig {
  fields: ChallengeField[];
  initialPrompt?: string; // e.g., "What book are you reading?"
}

export interface ChallengeField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'textarea' | 'time';
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

// Challenge Type (for walking challenges and similar)
export interface Challenge extends Omit<HabitTemplate, 'id' | 'createdBy' | 'isPublic' | 'createdAt' | 'participantCount'> {
  id: string;
  currentProgress: number;
  goal: number;
  startDate: any;
  endDate: any;
  participants: number;
  isJoined?: boolean;
}

// User's Habit Participation - Simplified
export interface HabitParticipation {
  id?: string; // The participation ID (document key), added for in-app use
  habitId: string;
  habitName: string; // Cached for quick access
  habitType: ChallengeType; // Added for different challenge types
  startDate: any;
  endDate: any;
  duration: number; // Total days for the challenge
  isActive: boolean;
  isCompleted: boolean;
  totalCompletedDays: number;
  totalDays: number;
  completionRate: number;
  lastUpdated: any;
  completedDate?: any; // When the challenge was completed
  dailyProgress: Record<string, DailyProgress>; // Date string (YYYY-MM-DD) as key
  
  // Removed for now (can be added back later):
  // currentStreak: number;
  // longestStreak: number;
  // completedAt?: any;
}


// User Profile - Updated stats
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  createdAt: any;
  stats: {
    totalHabitsCompleted: number;
    totalHabitsStarted: number;
    currentActiveHabits: number; // Should be 0 or 1 with new system
    totalDaysTracked: number;
    // Removed for now (can be added back later):
    // longestStreak: number;
  };
  habits: Record<string, HabitParticipation>; // participationId as key
  settings: {
    notifications: {
      dailyReminder: boolean;
      reminderTime: string; // 'HH:mm' format
      streakCelebration: boolean;
      weeklyProgress: boolean;
    };
    privacy: {
      profileVisible: boolean;
      progressVisible: boolean;
    };
  };
}

// Cross-reference for queries - Updated
export interface UserHabitReference {
  userId: string;
  habitId: string;
  participationId: string; // Added for easier reference
  startDate: any;
  isActive: boolean;
  completionRate: number;
  lastActivity: any;
  isCompleted?: boolean;
  completedDate?: any;
  // Removed for now:
  // currentStreak: number;
}

// Service Response Types
export interface JoinChallengeResponse {
  success: boolean;
  error?: string;
  participationId?: string;
}

export interface RecordProgressResponse {
  success: boolean;
  error?: string;
  challengeCompleted?: boolean;
}

export interface CanJoinChallengeResponse {
  canJoin: boolean;
  activeChallenge?: HabitParticipation;
}

export interface TodayProgressResponse {
  hasProgressToday: boolean;
  completed?: boolean;
}

export interface ChallengeProgressResponse {
  challenge: HabitParticipation | null;
  progressDays: Array<{
    date: string;
    completed: boolean;
    data?: any;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Form Values
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignUpFormValues extends LoginFormValues {
  displayName: string;
  confirmPassword: string;
}

// UI Types
export type TabParamList = {
  home: undefined;
  progress: undefined;
  challenges: undefined;
  profile: undefined;
};

// Navigation Types - Updated with challenge routes
export type RootStackParamList = {
  index: undefined;
  signIn: undefined;
  signUp: undefined;
  forgotPassword: undefined;
  home: undefined;
  habitDetail: { habitId: string };
  habitTrack: { participationId: string };
  challenge: { id: string }; // For challenge/[id].tsx
  'habit-creation': undefined;
  'activity-logging': undefined;
};

// UI State Types
export interface ChallengeCardProps {
  challenge: HabitTemplate;
  onPress: () => void;
  isJoined?: boolean;
}

export interface ProgressCardProps {
  participation: HabitParticipation;
  onPress: () => void;
}

export interface DailyCheckInProps {
  participation: HabitParticipation;
  onComplete: (completed: boolean, data?: any) => void;
  hasProgressToday: boolean;
  todayCompleted?: boolean;
}