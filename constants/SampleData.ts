import { Challenge, Habit } from '../types';
import { formatDate } from '../utils/dateUtils';

export const sampleChallenges: Challenge[] = [ // Challenges Screen
  {
    id: '6', // TODO: update the challenge Ids in a constant file, as the detail screens components are rendered using the Ids
    name: 'Walking Challenge',
    description: '10,000 steps daily for 22 days to build a consistent walking habit',
    category: 'fitness',
    duration: 22,
    difficulty: 'medium',
    participationCount: 7823,
    featured: true,
  },
];

export const sampleHabits: Habit[] = [];


export const sampleBadges = [
  {
    id: 'first-day',
    name: 'First Day',
    description: 'Completed your first day of a habit',
    icon: 'star',
    unlocked: true,
  },
  {
    id: 'first-week',
    name: 'Week Warrior',
    description: 'Maintained a habit for 7 consecutive days',
    icon: 'fire',
    unlocked: true,
  },
  {
    id: 'first-month',
    name: 'Monthly Master',
    description: 'Maintained a habit for 30 consecutive days',
    icon: 'trophy',
    unlocked: false,
  },
]; 