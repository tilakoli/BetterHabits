import { DB } from '@/firebaseConfig';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  Timestamp,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { HabitTemplate, HabitParticipation, UserProfile, DailyProgress } from '@/types';
import * as Crypto from 'expo-crypto';

const HABITS_COLLECTION = 'habits';
const USER_HABIT_PARTICIPATION_COLLECTION = 'user_habit_participation';

export const habitService = {
  // Fetch all public habits (challenges)
  async getPublicHabits(): Promise<HabitTemplate[]> {
    try {
      const q = query(
        collection(DB, HABITS_COLLECTION),
        where('isPublic', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as HabitTemplate[];
    } catch (error) {
      console.error('Error fetching public habits:', error);
      return [];
    }
  },

  // Get a single habit template by ID
  async getHabitById(habitId: string): Promise<HabitTemplate | null> {
    try {
      const docRef = doc(DB, HABITS_COLLECTION, habitId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as HabitTemplate;
      }
      return null;
    } catch (error) {
      console.error('Error getting habit:', error);
      return null;
    }
  },

  // Check if user can join a new challenge (no active challenges)
  async canUserJoinChallenge(userId: string): Promise<{ canJoin: boolean; activeChallenge?: HabitParticipation }> {
    try {
      const userRef = doc(DB, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { canJoin: true };
      }

      const userData = userSnap.data() as UserProfile;
      const habitsMap = userData.habits || {};

      const activeChallenge = Object.entries(habitsMap)
        .map(([id, data]) => ({ ...data, id }))
        .find(habit => habit.isActive && !habit.isCompleted);

      return { 
        canJoin: !activeChallenge, 
        activeChallenge: activeChallenge || undefined 
      };
    } catch (error) {
      console.error('Error checking if user can join challenge:', error);
      return { canJoin: false };
    }
  },

  // Get user's current active challenge
  async getUserActiveChallenge(userId: string): Promise<HabitParticipation | null> {
    try {
      const { activeChallenge } = await this.canUserJoinChallenge(userId);
      return activeChallenge || null;
    } catch (error) {
      console.error('Error getting user active challenge:', error);
      return null;
    }
  },

  // Join a habit challenge (only if no active challenge)
  async joinHabitChallenge(
    userId: string,
    habitTemplate: HabitTemplate
  ): Promise<{ success: boolean; error?: string; participationId?: string }> {
    
    // Check if user can join a new challenge
    const { canJoin, activeChallenge } = await this.canUserJoinChallenge(userId);
    if (!canJoin) {
      return { 
        success: false, 
        error: `You already have an active challenge: ${activeChallenge?.habitName}. Complete it first to join a new one.` 
      };
    }

    const batch = writeBatch(DB);
    const participationId = Crypto.randomUUID();
    const now = new Date();
    const startDate = Timestamp.fromDate(now);
    const endDate = Timestamp.fromDate(new Date(now.getTime() + (habitTemplate.duration * 24 * 60 * 60 * 1000)));

    // Create simplified participation data
    const participationData: HabitParticipation = {
      habitId: habitTemplate.id,
      habitName: habitTemplate.name,
      habitType: habitTemplate.type || 'generic', // For future challenge types
      startDate: startDate,
      endDate: endDate,
      duration: habitTemplate.duration,
      isActive: true,
      isCompleted: false,
      totalCompletedDays: 0,
      totalDays: habitTemplate.duration,
      completionRate: 0,
      lastUpdated: startDate,
      dailyProgress: {} // Will store date -> { completed: boolean, data?: any }
    };

    // 1. Update user document
    const userRef = doc(DB, 'users', userId);
    batch.update(userRef, {
      [`habits.${participationId}`]: participationData,
      'stats.totalHabitsStarted': increment(1),
      'stats.currentActiveHabits': increment(1),
    });

    // 2. Update habit template participant count
    const habitRef = doc(DB, HABITS_COLLECTION, habitTemplate.id);
    batch.update(habitRef, { participantCount: increment(1) });

    // 3. Create cross-reference for analytics
    const crossRefRef = doc(DB, USER_HABIT_PARTICIPATION_COLLECTION, `${userId}_${habitTemplate.id}`);
    batch.set(crossRefRef, {
      userId: userId,
      habitId: habitTemplate.id,
      participationId: participationId,
      startDate: startDate,
      isActive: true,
      completionRate: 0,
      lastActivity: startDate
    });
    
    try {
      await batch.commit();
      return { success: true, participationId };
    } catch (error) {
      console.error('Error joining habit challenge:', error);
      return { success: false, error: 'Failed to join challenge.' };
    }
  },

  // Record daily progress (simplified for yes/no)
  async recordDailyProgress(
    userId: string,
    participationId: string,
    date: string, // YYYY-MM-DD format
    completed: boolean,
    additionalData?: any // For future challenge-specific data
  ): Promise<{ success: boolean; error?: string; challengeCompleted?: boolean }> {
    
    try {
      const userRef = doc(DB, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userSnap.data() as UserProfile;
      const challenge = userData.habits?.[participationId];
      
      if (!challenge) {
        return { success: false, error: 'Challenge not found' };
      }

      if (!challenge.isActive || challenge.isCompleted) {
        return { success: false, error: 'Challenge is not active' };
      }

      // Update progress for the specific date
   const progressEntry: DailyProgress = {
  completed,
  timestamp: Timestamp.now(),
  ...(additionalData && { data: additionalData }) // Store challenge-specific data
};
      // Calculate new completion stats
      const updatedDailyProgress = {
        ...challenge.dailyProgress,
        [date]: progressEntry
      };

      const completedDays = Object.values(updatedDailyProgress)
        .filter((progress: any) => progress.completed).length;
      
      const newCompletionRate = Math.round((completedDays / challenge.totalDays) * 100);
      
      // Check if challenge is completed (last day + marked complete)
      const today = new Date();
      const challengeEndDate = challenge.endDate.toDate();
      const isLastDay = today >= challengeEndDate;
      const isChallengeCompleted = isLastDay && completed;

      const updatePayload: any = {
        [`habits.${participationId}.dailyProgress.${date}`]: progressEntry,
        [`habits.${participationId}.totalCompletedDays`]: completedDays,
        [`habits.${participationId}.completionRate`]: newCompletionRate,
        [`habits.${participationId}.lastUpdated`]: Timestamp.now(),
      };

      // If challenge is completed, mark it as such
      if (isChallengeCompleted) {
        updatePayload[`habits.${participationId}.isCompleted`] = true;
        updatePayload[`habits.${participationId}.isActive`] = false;
        updatePayload[`habits.${participationId}.completedDate`] = Timestamp.now();
        updatePayload['stats.currentActiveHabits'] = increment(-1);
        updatePayload['stats.totalHabitsCompleted'] = increment(1);
      }

      await updateDoc(userRef, updatePayload);

      // Update cross-reference document
      const crossRefRef = doc(DB, USER_HABIT_PARTICIPATION_COLLECTION, `${userId}_${challenge.habitId}`);
      await updateDoc(crossRefRef, {
        completionRate: newCompletionRate,
        lastActivity: Timestamp.now(),
        ...(isChallengeCompleted && { 
          isActive: false, 
          isCompleted: true,
          completedDate: Timestamp.now()
        })
      });

      return { 
        success: true, 
        challengeCompleted: isChallengeCompleted 
      };

    } catch (error) {
      console.error('Error recording progress:', error);
      return { success: false, error: 'Failed to record progress.' };
    }
  },

  // Get today's progress status for a challenge
  async getTodayProgressStatus(userId: string, participationId: string): Promise<{ hasProgressToday: boolean; completed?: boolean }> {
    try {
      const challenge = await this.getUserActiveChallenge(userId);
      if (!challenge || challenge.id !== participationId) {
        return { hasProgressToday: false };
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const todayProgress = challenge.dailyProgress[today];

      return {
        hasProgressToday: !!todayProgress,
        completed: todayProgress?.completed
      };
    } catch (error) {
      console.error('Error getting today progress status:', error);
      return { hasProgressToday: false };
    }
  },

  // Get challenge progress history
  async getChallengeProgress(userId: string, participationId: string): Promise<{ 
    challenge: HabitParticipation | null; 
    progressDays: Array<{ date: string; completed: boolean; data?: any }> 
  }> {
    try {
      const userRef = doc(DB, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return { challenge: null, progressDays: [] };
      }

      const userData = userSnap.data() as UserProfile;
      const challenge = userData.habits?.[participationId];
      
      if (!challenge) {
        return { challenge: null, progressDays: [] };
      }

      const progressDays = Object.entries(challenge.dailyProgress || {})
        .map(([date, progress]: [string, any]) => ({
          date,
          completed: progress.completed,
          ...(progress.data && { data: progress.data })
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return { 
        challenge: { ...challenge, id: participationId }, 
        progressDays 
      };
    } catch (error) {
      console.error('Error getting challenge progress:', error);
      return { challenge: null, progressDays: [] };
    }
  },

  // Give up on a challenge
  async giveUpChallenge(
    userId: string,
    participationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(DB, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userSnap.data() as UserProfile;
      const challenge = userData.habits?.[participationId];
      
      if (!challenge) {
        return { success: false, error: 'Challenge not found' };
      }

      if (!challenge.isActive) {
        return { success: false, error: 'Challenge is not active' };
      }

      const batch = writeBatch(DB);

      // Update user document - mark challenge as inactive
      batch.update(userRef, {
        [`habits.${participationId}.isActive`]: false,
        [`habits.${participationId}.gaveUpDate`]: Timestamp.now(),
        'stats.currentActiveHabits': increment(-1)
      });

      // Update cross-reference document
      const crossRefRef = doc(DB, USER_HABIT_PARTICIPATION_COLLECTION, `${userId}_${challenge.habitId}`);
      batch.update(crossRefRef, {
        isActive: false,
        gaveUpDate: Timestamp.now()
      });

      // Decrement habit participant count
      const habitRef = doc(DB, HABITS_COLLECTION, challenge.habitId);
      batch.update(habitRef, { participantCount: increment(-1) });

      await batch.commit();
      return { success: true };

    } catch (error) {
      console.error('Error giving up challenge:', error);
      return { success: false, error: 'Failed to give up challenge.' };
    }
  }
};