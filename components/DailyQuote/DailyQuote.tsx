import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';

const QUOTATIONS = [
  "The secret of getting ahead is getting started.",
  "A journey of a thousand miles begins with a single step.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Your daily habits define your future.",
  "Small consistent steps lead to massive results over time.",
  "Success is built one day, one habit at a time.",
  "Discipline is choosing between what you want now and what you want most.",
];

 const  DailyQuote = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const [quote, setQuote] = useState('');
  const [quoteDate, setQuoteDate] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

  // Get today's date as a string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get a random quote from the array
  const getRandomQuote = () => {
    return QUOTATIONS[Math.floor(Math.random() * QUOTATIONS.length)];
  };

  // Initialize or update the daily quote
  const updateDailyQuote = () => {
    const today = getTodayDateString();
    
    // If it's a new day or no quote set, get a new quote
    if (quoteDate !== today) {
      setQuote(getRandomQuote());
      setQuoteDate(today);
    }
  };

  // Handle manual quote refresh with animation
  const handleRefreshQuote = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change quote
      setQuote(getRandomQuote());
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Initialize quote on mount
  useEffect(() => {
    updateDailyQuote();
  }, []);

  // Check for new day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateDailyQuote();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [quoteDate]);

  return (
    <View style={styles.quoteContainer}>
      <Animated.View style={[styles.quoteContent, { opacity: fadeAnim }]}>
        <Text style={[styles.quoteText, { color: colors.text }]}>
          "{quote}"
        </Text>
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRefreshQuote}
        activeOpacity={0.7}
      >
        <FontAwesome 
          name="refresh" 
          size={20} 
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default DailyQuote;

const styles = StyleSheet.create({
  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    color: '#666',
  },
  refreshButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});