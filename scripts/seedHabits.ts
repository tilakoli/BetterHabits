import { initializeApp } from 'firebase/app';
const { getFirestore, collection, doc, setDoc, Timestamp, increment, writeBatch } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');

// Type definitions
interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  joinedAt: any;
}

interface DailyGoal {
  type: 'time' | 'number' | 'boolean';
  target: number;
  unit: string;
}

interface HabitTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  dailyGoal: DailyGoal;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  color: string;
  tags: string[];
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  joinedAt: any;
  stats: {
    totalHabitsStarted: number;
    currentActiveHabits: number;
    totalCompletedDays: number;
    longestStreak: number;
    completionRate: number;
  };
  preferences: {
    theme: string;
    notifications: {
      reminders: boolean;
      milestones: boolean;
      social: boolean;
    };
  };
  habits: {};
  createdAt: any;
  updatedAt: any;
}

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('✅ Firebase initialized successfully');

// Sample users
const sampleUsers: UserData[] = [
  {
    uid: 'user_abc_456',
    displayName: 'Alex Johnson',
    email: 'alex@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
    joinedAt: new Date('2024-05-15'),
  },
  {
    uid: 'user_def_789',
    displayName: 'Taylor Smith',
    email: 'taylor@example.com',
    photoURL: 'https://randomuser.me/api/portraits/women/1.jpg',
    joinedAt: new Date('2024-05-20'),
  },
  {
    uid: 'user_ghi_012',
    displayName: 'Jordan Williams',
    email: 'jordan@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/2.jpg',
    joinedAt: new Date('2024-06-01'),
  },
];

// Sample habit templates (these will be public challenges)
const habitTemplates: HabitTemplate[] = [
  {
    id: 'habit_001',
    name: 'Walk 10,000 Steps Daily',
    description: 'Build a consistent walking habit by hitting 10k steps every day for 22 days',
    category: 'fitness',
    duration: 22,
    dailyGoal: {
      type: 'number' as const,
      target: 10000,
      unit: 'steps',
    },
    difficulty: 'medium',
    icon: 'walking',
    color: '#4CAF50',
    tags: ['fitness', 'walking', 'health']
  },
  {
    id: 'habit_002',
    name: 'Read 10 Pages Daily',
    description: 'Develop a daily reading habit and expand your knowledge',
    category: 'learning',
    duration: 22,
    dailyGoal: {
      type: 'number' as const,
      target: 10,
      unit: 'pages',
    },
    difficulty: 'easy',
    icon: 'book',
    color: '#2196F3',
    tags: ['reading', 'learning', 'books']
  },
  {
    id: 'habit_003',
    name: 'Meditate Daily',
    description: 'Practice mindfulness with 10 minutes of daily meditation',
    category: 'wellness',
    duration: 22,
    dailyGoal: {
      type: 'time' as const,
      target: 600, // 10 minutes in seconds
      unit: 'seconds',
    },
    difficulty: 'medium',
    icon: 'meditation',
    color: '#9C27B0',
    tags: ['meditation', 'mindfulness', 'wellness']
  },
  {
    id: 'habit_004',
    name: 'Drink 8 Glasses of Water',
    description: 'Stay hydrated by drinking 8 glasses of water daily',
    category: 'health',
    duration: 22,
    dailyGoal: {
      type: 'number' as const,
      target: 8,
      unit: 'glasses',
    },
    difficulty: 'easy',
    icon: 'water',
    color: '#00BCD4',
    tags: ['health', 'hydration', 'wellness']
  },
];

// Function to create a user document with nested structure
async function createUser(userData: UserData) {
    console.log(`Creating user: ${userData.displayName} (${userData.uid})`);
  
    const userRef = doc(db, 'users', userData.uid);
    const now = Timestamp.now();
  
    const minimalUserDoc = {
      uid: userData.uid,
      displayName: userData.displayName,
      email: userData.email,
      createdAt: now,
    };
  
    console.log('--- DEBUG: Creating minimal user document ---');
    console.log(JSON.stringify(minimalUserDoc, null, 2));
  
    try {
      await setDoc(userRef, minimalUserDoc);
      console.log(`✅ Successfully created user: ${userData.displayName} (${userData.uid})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.uid}:`, error);
      return false;
    }
  }

// Function to create habit templates (public challenges)
async function createHabitTemplate(habitData: HabitTemplate): Promise<void> {
  console.log(`Creating habit template: ${habitData.name}`);

  const habitRef = doc(db, 'habits', habitData.id!);
  const now = Timestamp.now();

  const habitDoc = {
    name: habitData.name,
    description: habitData.description,
    category: habitData.category,
    duration: habitData.duration,
    dailyGoal: habitData.dailyGoal,
    createdBy: "admin", // These are prebuilt challenges
    isPublic: true,
    difficulty: habitData.difficulty,
    icon: habitData.icon,
    color: habitData.color,
    createdAt: now,
    participantCount: 0, // Will be updated when users join
    tags: habitData.tags
  };

  try {
    await setDoc(habitRef, habitDoc);
    console.log(`✅ Created habit template: ${habitData.name}`);
  } catch (error) {
    console.error(`❌ Error creating habit template ${habitData.name}:`, error);
    throw error;
  }
}

// Function to simulate a user joining a habit (for demo data)
async function simulateUserJoiningHabit(userId: string, habitId: string, daysAgo: number = 0): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date();
  const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  const participationId = uuidv4();

  // Get habit template for reference
  const habitRef = doc(db, 'habits', habitId);
  
  try {
    // 1. Add habit to user's nested habits
    const userRef = doc(db, 'users', userId);
    
    // Generate some sample progress data
    const dailyProgress: any = {};
    const completedDays = Math.floor(Math.random() * Math.min(daysAgo + 1, 10)); // Random progress
    
    for (let i = 0; i < completedDays; i++) {
      const progressDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateKey = progressDate.toISOString().split('T')[0];
      
      dailyProgress[dateKey] = {
        completed: Math.random() > 0.2, // 80% completion rate
        value: habitId === 'habit_001' ? Math.floor(Math.random() * 5000) + 8000 : // steps
               habitId === 'habit_002' ? Math.floor(Math.random() * 10) + 8 : // pages
               habitId === 'habit_003' ? Math.floor(Math.random() * 300) + 500 : // seconds
               Math.floor(Math.random() * 3) + 6, // glasses
        goal: habitId === 'habit_001' ? 10000 :
              habitId === 'habit_002' ? 10 :
              habitId === 'habit_003' ? 600 :
              8,
        timestamp: Timestamp.fromDate(progressDate)
      };
    }

    const currentStreak = Math.floor(Math.random() * completedDays);
    
    batch.update(userRef, {
      [`habits.${participationId}`]: {
        habitId: habitId,
        habitName: habitTemplates.find(h => h.id === habitId)?.name || "Unknown Habit",
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(new Date(startDate.getTime() + (22 * 24 * 60 * 60 * 1000))),
        isActive: true,
        isCompleted: false,
        currentStreak: currentStreak,
        longestStreak: currentStreak,
        totalCompletedDays: completedDays,
        totalDays: 22,
        completionRate: (completedDays / Math.min(daysAgo + 1, 22)) * 100,
        lastUpdated: Timestamp.now(),
        dailyProgress: dailyProgress
      },
      'stats.totalHabitsStarted': increment(1),
      'stats.currentActiveHabits': increment(1),
      'stats.totalDaysTracked': increment(completedDays)
    });

    // 2. Create cross-reference for analytics
    const crossRefRef = doc(db, 'user_habit_participation', `${userId}_${habitId}`);
    batch.set(crossRefRef, {
      userId: userId,
      habitId: habitId,
      startDate: Timestamp.fromDate(startDate),
      isActive: true,
      currentStreak: currentStreak,
      completionRate: (completedDays / Math.min(daysAgo + 1, 22)) * 100,
      lastActivity: Timestamp.now()
    });

    // 3. Update habit participant count
    batch.update(habitRef, {
      participantCount: increment(1)
    });

    await batch.commit();
    console.log(`✅ User ${userId} joined habit ${habitId}`);
    
  } catch (error) {
    console.error(`❌ Error adding habit to user:`, error);
    throw error;
  }
}

async function seedData(): Promise<void> {
  try {
    console.log('\n🚀 Starting to seed data...');

    // 1. Create sample users
    console.log('\n👥 Creating sample users...');
    const createdUsers = [];

    for (const user of sampleUsers) {
      try {
        await createUser(user);
        createdUsers.push(user);
      } catch (error) {
        console.error(`❌ Failed to create user ${user.uid}:`, error);
        continue;
      }
    }

    console.log(`✅ Successfully created ${createdUsers.length} users`);
    // 2. Create habit templates
    return
    console.log('\n📝 Creating habit templates...');
    let createdHabits = 0;

    for (const habit of habitTemplates) {
      try {
        await createHabitTemplate(habit);
        createdHabits++;
      } catch (error) {
        console.error(`❌ Failed to create habit template ${habit.name}:`, error);
        continue;
      }
    }

    console.log(`✅ Successfully created ${createdHabits} habit templates`);

    // 3. Simulate some users joining habits (for demo data)
    console.log('\n🎯 Simulating user participation...');
    
    // User 1 joins 2 habits
    await simulateUserJoiningHabit('user_abc_456', 'habit_001', 7); // 7 days ago
    await simulateUserJoiningHabit('user_abc_456', 'habit_002', 5); // 5 days ago
    
    // User 2 joins 1 habit
    await simulateUserJoiningHabit('user_def_789', 'habit_001', 3); // 3 days ago
    
    // User 3 joins 3 habits
    await simulateUserJoiningHabit('user_ghi_012', 'habit_002', 10); // 10 days ago
    await simulateUserJoiningHabit('user_ghi_012', 'habit_003', 8); // 8 days ago
    await simulateUserJoiningHabit('user_ghi_012', 'habit_004', 2); // 2 days ago

    console.log('\n🎉 Successfully seeded data!');
    console.log(`- Created ${createdUsers.length} users`);
    console.log(`- Created ${createdHabits} habit templates`);
    console.log(`- Simulated user participation with progress data`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();