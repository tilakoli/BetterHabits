import { Stack } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function AuthLayout() {
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="habit/[id]"
        options={{
          headerShown: true,
          title: "Habit Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="habit-creation"
        options={{
          headerShown: true,
          title: "Create Habit",
        }}
      />
      <Stack.Screen
        name="habit-edit/[id]"
        options={{
          headerShown: true,
          title: "Edit Habit",
        }}
      />
      <Stack.Screen
        name="activity-logging"
        options={{
          headerShown: true,
          title: "Complete Activity",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="challenge/[id]"
        options={{
          headerShown: true,
          title: "Challenge Details",
        }}
      />
    </Stack>
  );
}
