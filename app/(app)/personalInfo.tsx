import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/utils/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/utils/components/useColorScheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import InputField from '@/components/InputField/InputField';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { DB, usersRef } from '@/firebaseConfig';
import { showAlert } from '@/components';

export default function PersonalInfoScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { userData, user: authUser, fetchUserData } = useAuth();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userData?.username || 'User');

  // Sync newUsername with userData.username if it changes externally
  useEffect(() => {
    if (userData?.username && newUsername !== userData.username) {
      setNewUsername(userData.username);
    }
  }, [userData?.username]);

  const user = {
    name: userData?.username || 'User',
    email: userData?.email || 'No email available',
    joinDate: userData?.createdAt || 'Unknown',
    streakCount: 5,
    totalPoints: 876,
  };

  const renderInfoItem = (icon: string, title: string, value: string, onEditPress?: () => void) => (
    <View style={styles.infoItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <FontAwesome name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
          {value}
        </Text>
      </View>
      {onEditPress && (
        <TouchableOpacity onPress={onEditPress} style={styles.editIconBtn}>
          <FontAwesome name="pencil" size={16} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleSaveUsername = async () => {
    if (!authUser || newUsername.trim() === '' || newUsername === userData?.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      const auth = getAuth();
      if (auth.currentUser) {
        // Update display name in Firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: newUsername.trim(),
        });

        // Update username in Firestore
        const userDocRef = doc(usersRef, auth.currentUser.uid);
        await updateDoc(userDocRef, {
          username: newUsername.trim(),
        });

        // Refresh user data in context
        await fetchUserData();

        showAlert({
          title: 'Success',
          message: 'Username updated successfully!',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to update username. Please try again.',
        type: 'error',
      });
    } finally {
      setIsEditingUsername(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => console.log('Edit profile image')} style={styles.editAvatarIcon}>
              <FontAwesome name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>
          {isEditingUsername ? (
            <View style={styles.usernameEditContainer}>
              <InputField
                value={newUsername}
                onChangeText={setNewUsername}
                onBlur={handleSaveUsername}
                autoFocus
                placeholder="Enter new username"
                inputStyle={styles.usernameInput}
                containerStyle={{ flex: 1 }}
              />
              <TouchableOpacity onPress={handleSaveUsername} style={styles.saveButton}>
                <FontAwesome name="check" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.usernameDisplayContainer}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              <TouchableOpacity onPress={() => {
                setIsEditingUsername(true);
                setNewUsername(userData?.username || 'User'); // Ensure current username is set when editing starts
              }} style={styles.editUsernameIcon}>
                <FontAwesome name="pencil" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          {renderInfoItem('envelope', 'Email Address', user.email, () => console.log('Edit email'))}
          {renderInfoItem('calendar', 'Join Date', new Date(user.joinDate).toLocaleDateString())}
          {renderInfoItem('trophy', 'Total Points', user.totalPoints.toString())}
          {renderInfoItem('fire', 'Current Streak', `${user.streakCount} days`)}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
  },
  editIconBtn: {
    padding: 8,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
    alignSelf: 'center',
  },
  usernameInput: {
    flex: 1,
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderColor: '#CCC',
  },
  saveButton: {
    marginLeft: 10,
    padding: 5,
  },
  usernameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editUsernameIcon: {
    marginLeft: 10,
    padding: 5,
  },
}); 