import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, Card, TransparentView } from '@/utils/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { HabitTemplate } from '@/types';

interface ChallengeCardProps {
  challenge: HabitTemplate;
  onJoin?: (challenge: HabitTemplate) => void;
  isJoining?: boolean;
  isJoined?: boolean;
  featured?: boolean;
}

const getDifficultyColor = (difficulty: string, colors: any) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.secondary;
    case 'medium':
      return colors.accent;
    case 'hard':
      return '#e74c3c';
    default:
      return colors.secondary;
  }
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onJoin,
  isJoining = false,
  isJoined = false,
  featured = false
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const difficultyColor = getDifficultyColor(challenge.difficulty, colors);
  
  const handlePress = () => {
    // Navigate to habit detail screen
    router.push(`/habit/${challenge.id}`);
  };
  
  const handleJoin = async () => {
    if (!isJoined && onJoin) {
      await onJoin(challenge);
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return 'heartbeat';
      case 'learning':
        return 'book';
      case 'wellness':
        return 'leaf';
      case 'health':
        return 'medkit';
      default:
        return 'star';
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={isJoining}
    >
      <Card style={[
        styles.container, 
        featured && styles.featuredContainer,
        {borderColor: colors.primary, borderWidth: 2,}
      ]}>
        {featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        
        <TransparentView style={styles.header}>
          <TransparentView style={styles.categoryContainer}>
            <FontAwesome 
              name={getCategoryIcon(challenge.category)} 
              size={16} 
              color={colors.primary} 
            />
            <Text style={[styles.category, { color: colorScheme === 'dark' ? '#AAA' : '#555' }]}>
              {challenge.category}
            </Text>
          </TransparentView>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
          </View>
        </TransparentView>
        
        <Text style={[styles.title, { color: colors.text }]}>{challenge.name}</Text>
        <Text 
          style={[styles.description, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}
          numberOfLines={2}
        >
          {challenge.description}
        </Text>
        
        <TransparentView style={styles.footer}>
          <TransparentView style={styles.statsContainer}>
            <TransparentView style={styles.statItem}>
              <FontAwesome name="calendar" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
                {challenge.duration} days
              </Text>
            </TransparentView>
            <TransparentView style={styles.statItem}>
              <FontAwesome name="users" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
                {challenge.participantCount || 0} joined
              </Text>
            </TransparentView>
          </TransparentView>
          
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              { 
                backgroundColor: isJoined ? colors.secondary : colors.primary,
                opacity: isJoining ? 0.7 : 1
              }
            ]}
            onPress={handleJoin}
            disabled={isJoined || isJoining}
          >
            {isJoining ? (
              <Text style={styles.joinButtonText}>Joining...</Text>
            ) : (
              <Text style={styles.joinButtonText}>
                {isJoined ? 'Joined' : 'Join Challenge'}
              </Text>
            )}
          </TouchableOpacity>
        </TransparentView>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  featuredContainer: {
    borderWidth: 1,
    borderColor: '#FFD700',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: -25,
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
  },
  featuredText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    marginLeft: 4,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChallengeCard;