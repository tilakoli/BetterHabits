import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTheme } from '@/components/ThemeContext';
import StreakCounter from '@/components/StreakCounter';
import BadgeIcon from '@/components/BadgeIcon';
import { sampleBadges } from '@/constants/SampleData';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { toggleTheme, isDarkMode } = useTheme();
  const router = useRouter();
  
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joinDate: '2023-06-15',
    streakCount: 5,
    totalPoints: 876,
  };
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminders: true,
    streakProtectionAlerts: true,
    darkMode: isDarkMode,
    soundEffects: false,
  });

  // Update settings.darkMode when theme changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: isDarkMode,
    }));
  }, [isDarkMode]);
  
  const toggleSetting = (setting: string) => {
    if (setting === 'darkMode') {
      toggleTheme();
    } else {
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof prev],
      }));
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear login state
              await AsyncStorage.removeItem('isLoggedIn');
              // Navigate to login screen
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };
  
  const renderAccountOption = (icon: string, title: string, subtitle?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress} disabled={!onPress}>
      <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}15` }]}>
        <FontAwesome name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      <FontAwesome name="chevron-right" size={16} color="#CCC" />
    </TouchableOpacity>
  );
  
  const renderSettingToggle = (title: string, value: boolean, settingKey: string) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#E0E0E0', true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : '#FFF'}
      />
    </View>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('')}</Text>
            </View>
            <StreakCounter count={user.streakCount} size="small" showLabel={false} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.totalPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sampleBadges.filter(b => b.unlocked).length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          <View style={styles.badgesContainer}>
            {sampleBadges.map(badge => (
              <BadgeIcon
                key={badge.id}
                badge={badge}
                size="medium"
                showName={true}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            {renderAccountOption('user', 'Personal Information')}
            {renderAccountOption('bell', 'Notifications')}
            {renderAccountOption('lock', 'Privacy')}
            {renderAccountOption('question-circle', 'Help & Support')}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionCard}>
            {renderSettingToggle('Notifications', settings.notifications, 'notifications')}
            {renderSettingToggle('Daily Reminders', settings.dailyReminders, 'dailyReminders')}
            {renderSettingToggle('Streak Protection Alerts', settings.streakProtectionAlerts, 'streakProtectionAlerts')}
            {renderSettingToggle('Dark Mode', settings.darkMode, 'darkMode')}
            {renderSettingToggle('Sound Effects', settings.soundEffects, 'soundEffects')}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionCard}>
            {renderAccountOption('info-circle', 'About HabitPro', 'Version 1.0.0')}
            {renderAccountOption('file-text-o', 'Terms of Service')}
            {renderAccountOption('shield', 'Privacy Policy')}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EEE',
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
  },
  logoutText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
}); 