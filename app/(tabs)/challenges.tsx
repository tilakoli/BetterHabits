import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, View, TransparentView } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import ChallengeCard from '@/components/ChallengeCard';
import { sampleChallenges } from '@/constants/SampleData';
import { Challenge } from '@/types';

const CATEGORIES = ['All', 'Mindfulness', 'Fitness', 'Learning', 'Health'];

export default function ChallengesScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [challenges] = useState<Challenge[]>(sampleChallenges);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);
  
  // Filter challenges based on search and category
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      challenge.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });
  
  const handleJoinChallenge = (challengeId: string) => {
    setJoinedChallenges(prev => {
      if (prev.includes(challengeId)) {
        return prev.filter(id => id !== challengeId);
      } else {
        return [...prev, challengeId];
      }
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <FontAwesome name="search" size={16} color={colorScheme === 'dark' ? '#999' : '#999'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search challenges..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategory === category ? colors.primary : colors.card,
                borderColor: selectedCategory === category ? colors.primary : colorScheme === 'dark' ? '#444' : '#DDD',
              }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                styles.categoryText,
                { color: selectedCategory === category ? 'white' : colors.text }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{selectedCategory} Challenges</Text>
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={() => handleJoinChallenge(challenge.id)}
                isJoined={joinedChallenges.includes(challenge.id)}
              />
            ))
          ) : (
            <View style={[
              styles.emptyStateContainer, 
              { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
            ]}>
              <FontAwesome name="search" size={50} color={colors.primary} />
              <Text style={[styles.emptyStateText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                No challenges found matching your criteria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    minWidth: 80,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
}); 