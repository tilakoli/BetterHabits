import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { WalkingProgress, ReadingProgress, MeditationProgress, WaterProgress, GenericProgress } from '@/components/ChallengeProgress';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { HabitParticipation } from '@/types';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const { userData } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [participation, setParticipation] = useState<HabitParticipation | null>(null);

  useEffect(() => {
    if (userData?.habits && id) {
      const challenge = userData.habits[id as string];
      if (challenge) {
        setParticipation({ ...challenge, id: id as string });
      }
    }
  }, [userData, id]);

  const renderProgress = () => {
    if (!participation) return null;

    switch (participation.habitType) {
      case 'walking':
        return <WalkingProgress participation={participation} />;
      case 'reading':
        return <ReadingProgress participation={participation} />;
      case 'meditation':
        return <MeditationProgress participation={participation} />;
      case 'water':
        return <WaterProgress participation={participation} />;
      default:
        return <GenericProgress participation={participation} />;
    }
  };

  if (!participation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Challenge not found
        </Text>
      </View>
    );
  }

  const formatDate = (timestamp: any) => {
    return timestamp?.toDate().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const status = participation.isCompleted ? 'Completed' : 'Given Up';
  const statusColor = participation.isCompleted ? '#27AE60' : '#E74C3C';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Challenge Info */}
        <View style={styles.infoSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <FontAwesome 
              name={participation.isCompleted ? 'check-circle' : 'times-circle'} 
              size={14} 
              color="white" 
            />
            <Text style={styles.statusText}>{status}</Text>
          </View>

          <Text style={[styles.challengeName, { color: colors.text }]}>
            {participation.habitName}
          </Text>

          <Text style={[styles.dateRange, { color: colors.text }]}>
            {formatDate(participation.startDate)} - {formatDate(participation.endDate)}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <FontAwesome name="calendar-check-o" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {participation.totalCompletedDays}
            </Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <FontAwesome name="percent" size={24} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {participation.completionRate}%
            </Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <FontAwesome name="fire" size={24} color="#e74c3c" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {participation.longestStreak}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Progress Visualization */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Progress
          </Text>
          {renderProgress()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  challengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 14,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});