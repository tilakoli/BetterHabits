import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider/useAuth";

const StartPage = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const initialCheck = useRef(true);
  const navigationHandled = useRef(false);

  useEffect(() => {
    console.log("[StartPage] Auth State:", { isLoading, isAuthenticated });
    
    // Skip if still loading or if we've already handled navigation
    if (isLoading || navigationHandled.current) {
      return;
    }

    // Only run this effect once when the component mounts
    if (initialCheck.current) {
      initialCheck.current = false;
      
      if (isAuthenticated) {
        console.log("[StartPage] User is authenticated, redirecting to home");
        navigationHandled.current = true;
        router.replace('/(app)/(tabs)');
      } else {
        console.log("[StartPage] User is not authenticated, redirecting to sign in");
        navigationHandled.current = true;
        router.replace('/signIn');
      }
    }
  }, [isLoading, isAuthenticated]);

  // Reset navigation handled flag when auth state changes
  useEffect(() => {
    return () => {
      navigationHandled.current = false;
    };
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Welcome to Habit Tracker
      </Text>
      <Text style={{ fontSize: 16, color: "gray", marginBottom: 40 }}>
        {isLoading ? "Loading your habits..." : "Preparing your experience..."}
      </Text>
      <ActivityIndicator size="large" color="gray" />
    </SafeAreaView>
  );
};

export default StartPage;
