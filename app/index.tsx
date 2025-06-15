import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider/useAuth";

const StartPage = () => {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("[StartPage] Auth State:", { isLoading, isAuthenticated });
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log("[StartPage] User is authenticated, redirecting to home");
        router.replace('/(app)/(tabs)');
      } else {
        console.log("[StartPage] User is not authenticated, redirecting to sign in");
        router.replace('/signIn');
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Welcome to Habit Tracker
      </Text>
      <Text style={{ fontSize: 16, color: "gray", marginBottom: 40 }}>
        Loading your habits...
      </Text>
      <ActivityIndicator size="large" color="gray" />
    </SafeAreaView>
  );
};

export default StartPage;
