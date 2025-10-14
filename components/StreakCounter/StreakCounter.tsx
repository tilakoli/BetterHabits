import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showLongest?: boolean;
  animateChange?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  size = 'medium',
  showLabel = true,
  showLongest = false,
  animateChange = false,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Get dynamic fire color based on streak
  const getStreakColor = (streak: number) => {
    if (streak === 0) return '#95a5a6';
    if (streak < 7) return '#f39c12';
    if (streak < 14) return '#e67e22';
    if (streak < 21) return '#e74c3c';
    return '#c0392b';
  };
  
  // Sizes mapping for different components
  const sizeMap = {
    small: {
      container: { height: 40, paddingHorizontal: 8 },
      iconSize: 16,
      text: { fontSize: 16 },
      label: { fontSize: 12 },
    },
    medium: {
      container: { height: 60, paddingHorizontal: 16 },
      iconSize: 22,
      text: { fontSize: 22 },
      label: { fontSize: 14 },
    },
    large: {
      container: { height: 80, paddingHorizontal: 20 },
      iconSize: 28,
      text: { fontSize: 28 },
      label: { fontSize: 16 },
    },
  };
  
  useEffect(() => {
    if (animateChange && currentStreak > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStreak, animateChange, scaleAnim]);
  
  return (
    <View>
      <View style={[styles.container, sizeMap[size].container]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <FontAwesome 
            name="fire" 
            size={sizeMap[size].iconSize} 
            color={getStreakColor(currentStreak)}
            style={styles.icon}
          />
        </Animated.View>
        <Animated.Text 
          style={[
            styles.countText, 
            sizeMap[size].text,
            { color: colors.text },
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {currentStreak}
        </Animated.Text>
        {showLabel && (
          <Text style={[styles.label, sizeMap[size].label, { color: colors.text }]}>
            Day Streak
          </Text>
        )}
      </View>
      
      {showLongest && longestStreak && longestStreak > currentStreak && (
        <Text style={[styles.longestText, { color: colors.text }]}>
          Best: {longestStreak} days
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 30,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  countText: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  label: {
    fontWeight: '500',
  },
  longestText: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default StreakCounter;