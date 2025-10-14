import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/utils/components/Themed";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/utils/components/useColorScheme";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider/useAuth";
import InputField from "@/components/InputField/InputField";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { DB, usersRef } from "@/firebaseConfig";
import { showAlert } from "@/components";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import EditFieldBottomSheet from "@/components/BottomSheetModals/EditFieldBottomSheet";
import PasswordChangeBottomSheet from "@/components/BottomSheetModals/PasswordChangeBottomSheet";

export default function PersonalInfoScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { userData, user: authUser, fetchUserData } = useAuth();

  // Bottom sheet refs
  const fullNameSheetRef = useRef<any>(null);
  const emailSheetRef = useRef<any>(null);
  const passwordSheetRef = useRef<any>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveFullName = async (newFullName: string) => {
    if (!authUser) throw new Error("User not authenticated");

    const auth = getAuth();
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: newFullName,
      });

      const userDocRef = doc(usersRef, auth.currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: newFullName,
      });

      await fetchUserData();
      showAlert({
        title: "Success",
        message: "Full name updated successfully!",
        type: "success",
      });
    }
  };

  const handleSaveEmail = async (newEmail: string) => {
    if (!authUser) throw new Error("User not authenticated");

    // Require password for email change
    return new Promise<void>((resolve, reject) => {
      Alert.prompt(
        "Confirm Password",
        "Enter your current password to change your email",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => reject(new Error("Cancelled")),
          },
          {
            text: "Confirm",
            onPress: async (password) => {
              try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user || !user.email || !password) {
                  throw new Error("Invalid credentials");
                }

                // Reauthenticate
                const credential = EmailAuthProvider.credential(
                  user.email,
                  password
                );
                await reauthenticateWithCredential(user, credential);

                // Update email
                await updateEmail(user, newEmail);

                // Update in Firestore
                const userDocRef = doc(usersRef, user.uid);
                await updateDoc(userDocRef, {
                  email: newEmail,
                });

                await fetchUserData();
                showAlert({
                  title: "Success",
                  message: "Email updated successfully!",
                  type: "success",
                });
                resolve();
              } catch (error: any) {
                let errorMessage = "Failed to update email";
                if (error.code === "auth/wrong-password") {
                  errorMessage = "Incorrect password";
                } else if (error.code === "auth/email-already-in-use") {
                  errorMessage = "Email already in use";
                }
                reject(new Error(errorMessage));
              }
            },
          },
        ],
        "secure-text"
      );
    });
  };

  const validateFullName = (value: string): string | null => {
    if (value.trim().length === 0) {
      return "Full name cannot be empty";
    }
    if (value.trim().length < 2) {
      return "Full name must be at least 2 characters";
    }
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (value.trim().length === 0) {
      return "Email cannot be empty";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert("Error", "User not found");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            setIsChangingPassword(false);
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          },
        },
      ]);
    } catch (error: any) {
      let errorMessage = "Failed to change password";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInfoItem = (
    icon: string,
    title: string,
    value: string,
    onEditPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.infoItem}
      onPress={onEditPress}
      disabled={!onEditPress}
      activeOpacity={onEditPress ? 0.6 : 1}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.primary}15` },
        ]}
      >
        <FontAwesome name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text
          style={[
            styles.infoValue,
            { color: colorScheme === "dark" ? "#A0A0A0" : "#666" },
          ]}
        >
          {value}
        </Text>
      </View>
      {onEditPress && (
        <FontAwesome
          name="chevron-right"
          size={16}
          color={colors.text}
          style={{ opacity: 0.3 }}
        />
      )}
    </TouchableOpacity>
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {(userData?.displayName || userData?.username || "User")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.userName, { color: colors.text }]}>
              @{userData?.username || "user"}
            </Text>
          </View>

          {/* Account Info Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account Information
            </Text>
            {renderInfoItem(
              "user",
              "Full Name",
              userData?.username || "Not set",
              () => fullNameSheetRef.current?.expand()
            )}
            {renderInfoItem(
              "envelope",
              "Email Address",
              userData?.email || "No email",
              () => emailSheetRef.current?.expand()
            )}
            {renderInfoItem(
              "calendar",
              "Member Since",
              formatDate(userData?.createdAt)
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Stats
            </Text>
            {renderInfoItem(
              "fire",
              "Current Streak",
              `${userData?.stats?.currentStreak || 0} days`
            )}
            {renderInfoItem(
              "trophy",
              "Longest Streak",
              `${userData?.stats?.longestStreak || 0} days`
            )}
            {renderInfoItem(
              "check-circle",
              "Challenges Completed",
              `${userData?.stats?.totalHabitsCompleted || 0}`
            )}
            {renderInfoItem(
              "clock-o",
              "Total Days Tracked",
              `${userData?.stats?.totalDaysTracked || 0}`
            )}
          </View>

          {/* Change Password Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Security
            </Text>
            <TouchableOpacity
              style={[
                styles.changePasswordButton,
                { backgroundColor: colors.card },
              ]}
              onPress={() => passwordSheetRef.current?.expand()}
            >
              <FontAwesome name="lock" size={18} color={colors.primary} />
              <Text style={[styles.changePasswordText, { color: colors.text }]}>
                Change Password
              </Text>
              <FontAwesome name="chevron-right" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Sheets */}
        <EditFieldBottomSheet
          bottomSheetRef={fullNameSheetRef}
          title="Edit Full Name"
          fieldLabel="Full Name"
          currentValue={userData?.username || ""}
          placeholder="Enter your full name"
          maxLength={50}
          onSave={handleSaveFullName}
          validate={validateFullName}
          helperText="This is how your name will appear to others"
        />

        <EditFieldBottomSheet
          bottomSheetRef={emailSheetRef}
          title="Edit Email"
          fieldLabel="Email Address"
          currentValue={userData?.email || ""}
          placeholder="Enter your email"
          keyboardType="email-address"
          onSave={handleSaveEmail}
          validate={validateEmail}
          helperText="You'll need to confirm your password to change your email"
        />

        <PasswordChangeBottomSheet bottomSheetRef={passwordSheetRef} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  changePasswordText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  passwordForm: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  passwordActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  savePasswordButton: {},
  savePasswordButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
