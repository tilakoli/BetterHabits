import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, Card, TransparentView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (id: string) => void;
  isJoined?: boolean;
  featured?: boolean;
}

const getDifficultyColor = (difficulty: string, colors: any) => {
  switch (difficulty) {
    case 'easy':
      return colors.secondary;
    case 'medium':
      return colors.accent;
    case 'hard':
      return '#e74c3c'; // a red color for hard
    default:
      return colors.secondary;
  }
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onJoin,
  isJoined: isJoinedProp = false,
  featured = false
}) => {
  const [isJoined, setIsJoined] = useState(isJoinedProp);
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const difficultyColor = getDifficultyColor(challenge.difficulty, colors);
  
  const handlePress = () => {
    // Navigate to habit detail screen
    router.push(`/habit/${challenge.id}`);
  };
  
  const handleJoin = () => {
    if (!isJoined) {
      setIsJoined(true);
      if (onJoin) {
        onJoin(challenge.id);
      }
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mindfulness':
        return 'leaf';
      case 'fitness':
        return 'heartbeat';
      case 'learning':
        return 'book';
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
    >
      <Card style={[
        styles.container, 
        challenge.featured && styles.featuredContainer
      ]}>
        {challenge.featured && (
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
        
        <Text style={styles.title}>{challenge.name}</Text>
        <Text style={[styles.description, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
          {challenge.description}
        </Text>
        
        <TransparentView style={styles.footer}>
          <TransparentView style={styles.statsContainer}>
            <TransparentView style={styles.stat}>
              <FontAwesome name="calendar" size={14} color={colors.text} />
              <Text style={styles.statText}>{challenge.duration} days</Text>
            </TransparentView>
            <TransparentView style={styles.stat}>
              <FontAwesome name="users" size={14} color={colors.text} />
              <Text style={styles.statText}>{challenge.participationCount.toLocaleString()}</Text>
            </TransparentView>
          </TransparentView>
          
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              { backgroundColor: isJoined ? colors.secondary : colors.primary }
            ]}
            onPress={handleJoin}
            disabled={isJoined}
          >
            <Text style={styles.joinButtonText}>
              {isJoined ? 'Joined' : 'Join'}
            </Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  featuredContainer: {
    borderWidth: 2,
    borderColor: '#2D5BFF',
  },
  featuredBadge: {
    position: 'absolute',
    top: -24,
    right: 10,
    backgroundColor: '#2D5BFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  featuredText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  category: {
    fontSize: 14,
    textTransform: 'capitalize',
    color: '#555',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#555',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ChallengeCard; 