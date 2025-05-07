import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface StreakCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animateChange?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  count,
  size = 'medium',
  showLabel = true,
  animateChange = false,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
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
    if (animateChange) {
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
  }, [count, animateChange, scaleAnim]);
  
  return (
    <View style={[styles.container, sizeMap[size].container]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <FontAwesome 
          name="fire" 
          size={sizeMap[size].iconSize} 
          color={colors.accent}
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
        {count}
      </Animated.Text>
      {showLabel && (
        <Text style={[styles.label, sizeMap[size].label, { color: colors.text }]}>
          Day {count === 1 ? 'Streak' : 'Streak'}
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
});

export default StreakCounter; 