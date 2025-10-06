# HabitPro - Data Architecture

## Core Data Models

### 1. User Profile (`UserProfile`)
The central entity representing a user in the system.

```typescript
interface UserProfile {
  uid: string;                     // Unique user ID (from auth provider)
  email: string;
  displayName: string;
  profilePicture?: string;
  createdAt: any;                 // Timestamp of account creation
  stats: {
    totalHabitsCompleted: number;
    totalHabitsStarted: number;
    longestStreak: number;
    currentActiveHabits: number;
    totalDaysTracked: number;
  };
  habits: Record<string, HabitParticipation>; // User's habit participations
  settings: {
    notifications: {
      dailyReminder: boolean;
      reminderTime: string;      // 'HH:mm' format
      streakCelebration: boolean;
      weeklyProgress: boolean;
    };
    privacy: {
      profileVisible: boolean;
      progressVisible: boolean;
    };
  };
}
```

### 2. Habit Template (`HabitTemplate`)
Blueprint for creating habits or challenges.

```typescript
interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;              // in days
  dailyGoal: {
    type: 'number' | 'boolean' | 'time';
    target: number;
    unit: string;                // e.g., 'steps', 'minutes', 'times'
  };
  createdBy: string;             // 'admin' or user ID
  isPublic: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  color: string;
  createdAt: any;
  participantCount: number;
  tags: string[];
}
```

### 3. Challenge (`Challenge`)
Extends HabitTemplate with challenge-specific properties.

```typescript
interface Challenge extends Omit<HabitTemplate, 'id' | 'createdBy' | 'isPublic' | 'createdAt' | 'participantCount'> {
  id: string;
  currentProgress: number;
  goal: number;
  startDate: any;
  endDate: any;
  participants: number;
  isJoined?: boolean;
}
```

### 4. Habit Participation (`HabitParticipation`)
Tracks a user's engagement with a specific habit/challenge.

```typescript
interface HabitParticipation {
  id?: string;                   // Participation ID (document key)
  habitId: string;               // Reference to HabitTemplate/Challenge
  habitName: string;             // Cached for quick access
  startDate: any;
  endDate: any;
  isActive: boolean;
  isCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  totalDays: number;
  completionRate: number;
  lastUpdated: any;
  completedAt?: any;
  dailyProgress: Record<string, DailyProgress>; // Date string as key
}
```

### 5. Daily Progress (`DailyProgress`)
Tracks daily completion status and metrics.

```typescript
interface DailyProgress {
  completed: boolean;
  value: number;                 // Actual value achieved (e.g., steps taken)
  goal: number;                 // Target value for the day
  timestamp: any;
  note?: string;
}
```

## Data Relationships

### User to Habit Participation (One-to-Many)
- Each `UserProfile` can have multiple `HabitParticipation` records
- Stored in `UserProfile.habits` as a map with participation IDs as keys

### Habit Template to Challenge (One-to-One)
- `Challenge` extends `HabitTemplate` with additional properties
- Challenges are specialized habit templates with tracking capabilities

### Habit Participation to Daily Progress (One-to-Many)
- Each `HabitParticipation` contains multiple `DailyProgress` records
- Stored as a map with date strings as keys

## Data Flow

1. **Habit/Challenge Discovery**
   - Users browse available `HabitTemplate` and `Challenge` instances
   - Public templates can be seen by all users

2. **Participation**
   - When a user starts a habit/challenge, a `HabitParticipation` record is created
   - The `participantCount` on the template/challenge is incremented

3. **Daily Tracking**
   - Users log progress through `DailyProgress` records
   - Streaks and completion rates are calculated and updated

4. **Completion**
   - When a habit/challenge is completed, `isCompleted` is set to true
   - User statistics are updated in their profile

## Example Scenarios

### Starting a New Habit
1. User selects a `HabitTemplate`
2. System creates a `HabitParticipation` record
3. Daily tracking begins with `DailyProgress` entries

### Joining a Challenge
1. User selects a `Challenge`
2. System creates a `HabitParticipation` with challenge-specific settings
3. User's progress is tracked against the challenge's duration and goals

### Tracking Progress
1. User logs daily progress
2. System updates the corresponding `DailyProgress`
3. Streaks and completion metrics are recalculated
4. User's statistics in `UserProfile` are updated
