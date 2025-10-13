# HabitPro 🏃‍♂️

A modern React Native habit tracking application built with Expo and Firebase. Track your daily habits, join challenges, and build lasting positive routines.

## 🚀 Features

- **User Authentication** - Secure sign up/sign in with Firebase Auth
- **Challenge System** - Browse and join habit challenges
- **Daily Progress Tracking** - Simple yes/no completion tracking
- **Streak Counter** - Track your consistency
- **Dark/Light Theme** - Beautiful UI with theme support
- **Real-time Updates** - Live data synchronization with Firebase
- **Single Active Challenge** - Focus on one habit at a time

## 🏗️ Architecture

### Technology Stack
- **Framework**: React Native with Expo Router
- **Language**: TypeScript
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **Navigation**: Expo Router (file-based routing)
- **UI**: Custom themed components
- **Forms**: Formik + Yup validation
- **Icons**: Expo Vector Icons (FontAwesome)

### Key Architecture Patterns
- **Authentication Flow**: User → AuthProvider → Firebase Auth → Protected Routes
- **Data Flow**: UI Components → Services → Firebase Firestore → State Updates
- **Single Active Challenge**: Users can only have one active challenge at a time

## 📁 Project Structure

```
HabitPro/
├── 📱 app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx                  # Root layout with auth & theme providers
│   ├── index.tsx                    # Entry point (redirects to auth/app)
│   ├── signIn.tsx                   # Authentication screens
│   ├── signUp.tsx
│   └── (app)/                       # Protected app routes
│       ├── _layout.tsx              # App layout wrapper
│       ├── (tabs)/                  # Tab navigation
│       │   ├── _layout.tsx          # Tab bar configuration
│       │   ├── index.tsx            # Home screen
│       │   ├── challenges.tsx       # Challenges browser
│       │   └── profile.tsx          # User profile
│       ├── habit/[id].tsx           # Dynamic habit detail pages
│       └── personalInfo.tsx         # User settings
│
├── 🧩 components/                   # Reusable UI components
│   ├── BadgeIcon/                   # Badge display component
│   ├── Button/                      # Custom button component
│   ├── CalendarView/                # Calendar for progress tracking
│   ├── ChallengeCard/               # Challenge display card
│   ├── CustomAlert/                 # Alert dialogs
│   ├── HabitCard/                   # Habit display card
│   ├── InputField/                  # Form input component
│   ├── ProgressCircle/              # Circular progress indicator
│   ├── StepCounter/                 # Step counting component
│   ├── StepGoalModal/               # Goal setting modal
│   ├── StreakCounter/               # Streak display component
│   └── index.ts                     # Component exports
│
├── 🔧 services/                     # Business logic & API calls
│   └── habitService.ts              # Firebase operations for habits
│
├── 🔐 providers/                    # Context providers
│   └── AuthProvider/
│       ├── useAuth.tsx              # Authentication context
│       └── types.ts                 # Auth-related types
│
├── 📊 types/                        # TypeScript type definitions
│   └── index.ts                     # All app types & interfaces
│
├── 🎨 constants/                    # App constants & sample data
│   ├── Colors.ts                    # Theme color definitions
│   └── SampleData.ts                # Mock data for development
│
├── 🛠️ utils/                        # Utility functions & helpers
│   ├── components/                  # Themed component utilities
│   │   ├── ThemeContext.tsx         # Theme management
│   │   ├── Themed.tsx               # Themed base components
│   │   ├── StyledText.tsx           # Custom text component
│   │   └── useColorScheme.ts        # Color scheme hook
│   ├── forms/                       # Form utilities
│   │   ├── BaseForm.tsx             # Base form component
│   │   └── validationSchemas.ts     # Yup validation schemas
│   ├── dateUtils.ts                 # Date manipulation utilities
│   └── habitUtils.ts                # Habit-related utilities
│
├── 🔥 firebaseConfig.js             # Firebase configuration
├── 📦 package.json                  # Dependencies & scripts
├── ⚙️ app.json                      # Expo configuration
└── 📝 README.md                     # Project documentation
```

## 🗄️ Data Models

### Core Entities

#### UserProfile
```typescript
interface UserProfile {
  uid: string;                     // Unique user ID
  email: string;
  displayName: string;
  profilePicture?: string;
  createdAt: any;
  stats: {
    totalHabitsCompleted: number;
    totalHabitsStarted: number;
    currentActiveHabits: number;
    totalDaysTracked: number;
  };
  habits: Record<string, HabitParticipation>;
  settings: {
    notifications: {
      dailyReminder: boolean;
      reminderTime: string;
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

#### HabitTemplate
```typescript
interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ChallengeType;
  duration: number; // in days
  dailyGoal: {
    type: 'number' | 'boolean' | 'time';
    target: number;
    unit: string;
  };
  createdBy: string;
  isPublic: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  color: string;
  createdAt: any;
  participantCount: number;
  tags: string[];
}
```

#### HabitParticipation
```typescript
interface HabitParticipation {
  id?: string;
  habitId: string;
  habitName: string;
  habitType: ChallengeType;
  startDate: any;
  endDate: any;
  duration: number;
  isActive: boolean;
  isCompleted: boolean;
  totalCompletedDays: number;
  totalDays: number;
  completionRate: number;
  lastUpdated: any;
  completedDate?: any;
  dailyProgress: Record<string, DailyProgress>;
}
```

### Key Relationships
- **User → HabitParticipation** (One-to-Many)
- **HabitTemplate → Challenge** (One-to-One)
- **HabitParticipation → DailyProgress** (One-to-Many)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HabitPro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase config to `firebaseConfig.js`
   - Set up environment variables for Firebase keys

4. **Start the development server**
   ```bash
   npm start
   ```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run web version
- `npm test` - Run Jest tests
- `npm run build:apk` - Build Android APK
- `npm run build:app-bundle` - Build Android App Bundle

## 🔧 Development

### Key Features Implementation

#### Authentication
- Firebase Authentication with email/password
- Persistent login state with AsyncStorage
- Automatic navigation based on auth state

#### Challenge System
- Browse public habit templates
- Join challenges (one at a time)
- Track daily progress
- View completion statistics

#### Data Management
- Real-time Firestore integration
- Optimistic UI updates
- Error handling and retry logic

### Code Structure

#### Components
- **Reusable UI components** in `/components`
- **Themed components** with dark/light mode support
- **Type-safe props** with TypeScript interfaces

#### Services
- **Centralized business logic** in `/services`
- **Firebase operations** abstracted into service functions
- **Error handling** and response formatting

#### State Management
- **React Context** for global state
- **Local state** for component-specific data
- **Custom hooks** for reusable logic

## 🎨 Theming

The app supports both light and dark themes with:
- **Dynamic color switching**
- **System preference detection**
- **Consistent theming** across all components
- **Custom color palette** defined in `constants/Colors.ts`

## 📱 Platform Support

- **iOS** - Native iOS app
- **Android** - Native Android app
- **Web** - Progressive Web App (PWA)

## 🔒 Security

- **Firebase Authentication** for user management
- **Firestore Security Rules** for data protection
- **Input validation** with Yup schemas
- **Secure API key management** with environment variables

## 🧪 Testing

- **Jest** for unit testing
- **React Native Testing Library** for component testing
- **Expo testing utilities** for integration testing

## 📦 Dependencies

### Core Dependencies
- `expo` (~53.0.4) - React Native framework
- `react` (19.0.0) - React library
- `react-native` (0.79.1) - React Native
- `firebase` (^11.9.0) - Backend services
- `expo-router` (~5.0.3) - Navigation

### UI & Forms
- `formik` (^2.4.6) - Form handling
- `yup` (^1.6.1) - Validation schemas
- `@expo/vector-icons` (^14.1.0) - Icon library
- `react-native-svg` (^15.11.2) - SVG support

### Development
- `typescript` (~5.8.3) - Type safety
- `jest` (^29.2.1) - Testing framework
- `@types/react` (~19.0.10) - TypeScript definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Kagami** - *Initial work* - [GitHub](https://github.com/kagami14)

## 🙏 Acknowledgments

- Expo team for the amazing React Native framework
- Firebase team for the backend services
- React Native community for the ecosystem
