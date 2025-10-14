## Streak System

### Overview
HabitPro uses a hybrid streak system to motivate consistent daily progress across challenges.

### Streak Types

#### 1. Challenge Streak
- Tracks consecutive completed days within a single challenge
- Resets when you miss a day or start a new challenge
- Max streak = challenge duration (e.g., 22 days for a 22-day challenge)

#### 2. Global Streak
- Tracks total consecutive active days across all challenges
- Continues between challenges with a **2-day grace period**
- Resets to 0 if you miss a day within an active challenge

#### 3. Longest Streak
- Your best global streak ever achieved
- Displayed on profile for motivation

### Streak Rules

**Within Active Challenge:**
- ✅ Complete daily goal → streak +1
- ❌ Miss a day → both challenge and global streaks reset to 0
- Challenge continues (not restarted), only streaks reset

**Between Challenges:**
- You have **2 days** after completing/giving up a challenge to join a new one
- Global streak continues if you join within grace period
- After 2 days, global streak resets

### Milestones & Celebrations
Celebrate when you hit these global streak milestones:
- 🔥 7 days
- 🔥 14 days  
- 🔥 21 days
- 🔥 30 days
- 🔥 60 days
- 🔥 90 days
- 🔥 100 days

A celebration banner appears automatically when you reach a milestone.

### Streak Display

**Fire Color Coding:**
- Gray (0 days) - Start your streak!
- Yellow (1-6 days) - Building momentum
- Orange (7-13 days) - Getting strong
- Red (14-20 days) - On fire!
- Dark Red (21+ days) - Unstoppable!

**Where Streaks Appear:**
- Home screen - Global streak badge
- Profile - Current + longest streaks
- Challenge detail - Challenge-specific streak

### Technical Implementation

Streaks are calculated in `utils/streakUtils.ts` and tracked in:
- `UserProfile.stats.currentStreak` - Global streak
- `UserProfile.stats.longestStreak` - Best global streak
- `HabitParticipation.currentStreak` - Challenge streak
- `HabitParticipation.longestStreak` - Best challenge streak