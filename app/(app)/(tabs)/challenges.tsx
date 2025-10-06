import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, View } from 'react-native';
import { Text } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import ChallengeCard from '@/components/ChallengeCard/ChallengeCard';
import { habitService } from '@/services/habitService';
import { HabitTemplate } from '@/types';
import { useAuth } from '@/providers/AuthProvider/useAuth';

const CATEGORIES = ['All', 'Fitness', 'Learning', 'Wellness', 'Health'];

export default function ChallengesScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  
  const [habits, setHabits] = useState<HabitTemplate[]>([]);
  const [joinedHabitIds, setJoinedHabitIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [joiningHabit, setJoiningHabit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const [publicHabits, userActiveHabits] = await Promise.all([
        habitService.getPublicHabits(),
        habitService.getUserActiveChallenge(user.uid)
      ]);
      
      setHabits(publicHabits);
      const joinedIds = new Set(userActiveHabits?.map(h => h.habitId));
      setJoinedHabitIds(joinedIds);
      
    } catch (err) {
      console.error('Failed to load challenges data:', err);
      setError('Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Filter habits based on search and category
  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      habit.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });
  
  const handleJoinChallenge = async (challenge: HabitTemplate) => {
    if (!user || joinedHabitIds.has(challenge.id)) return;
    
    try {
      setJoiningHabit(challenge.id);
      const result = await habitService.joinHabitChallenge(user.uid, challenge);
      
      if (result.success) {
        setHabits(prev => 
          prev.map(h => 
            h.id === challenge.id 
              ? { ...h, participantCount: (h.participantCount || 0) + 1 } 
              : h
          )
        );
        setJoinedHabitIds(prev => new Set(prev).add(challenge.id));
      } else {
        setError(result.error || 'Failed to join challenge');
      }
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setJoiningHabit(null);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <FontAwesome name="search" size={16} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search challenges..."
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: selectedCategory === category ? colors.primary : colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  { 
                    color: selectedCategory === category ? '#FFF' : colors.text,
                    opacity: selectedCategory === category ? 1 : 0.8
                  }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.challengesContainer}
        contentContainerStyle={styles.challengesContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="search" size={48} color={colors.text} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No challenges found. Try a different search or category.
            </Text>
          </View>
        ) : (
          filteredHabits.map(habit => (
            <ChallengeCard
              key={habit.id}
              challenge={habit}
              onJoin={handleJoinChallenge}
              isJoining={joiningHabit === habit.id}
              isJoined={joinedHabitIds.has(habit.id)}
              featured={false} // Set based on your logic
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  challengesContainer: {
    flex: 1,
  },
  challengesContent: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 40,
  },
});