import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { Badge } from '@/types';

interface BadgeIconProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showName?: boolean;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({
  badge,
  size = 'medium',
  onPress,
  showName = false,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const sizeMap = {
    small: {
      container: 40,
      iconSize: 20,
      nameStyle: { fontSize: 10 },
    },
    medium: {
      container: 60,
      iconSize: 30,
      nameStyle: { fontSize: 12 },
    },
    large: {
      container: 80,
      iconSize: 40,
      nameStyle: { fontSize: 14 },
    },
  };
  
  const currentSize = sizeMap[size];
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.wrapper}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View 
        style={[
          styles.container,
          { 
            width: currentSize.container,
            height: currentSize.container,
            backgroundColor: badge.unlocked ? colors.primary : '#E0E0E0',
            opacity: badge.unlocked ? 1 : 0.7,
          }
        ]}
      >
        <FontAwesome 
          name={badge.icon as any} 
          size={currentSize.iconSize} 
          color={badge.unlocked ? 'white' : '#999'} 
        />
        
        {!badge.unlocked && (
          <View style={styles.lockedOverlay}>
            <FontAwesome name="lock" size={currentSize.iconSize / 2} color="#777" />
          </View>
        )}
      </View>
      
      {showName && (
        <Text 
          style={[
            styles.badgeName, 
            currentSize.nameStyle,
            { color: badge.unlocked ? colors.text : '#999' }
          ]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 8,
  },
  container: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 999,
  },
  badgeName: {
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80,
  },
});

export default BadgeIcon; 