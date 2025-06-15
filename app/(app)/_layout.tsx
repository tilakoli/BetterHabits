import { Stack } from 'expo-router';
import { useColorScheme } from '@/utils/components/useColorScheme';
import Colors from '@/constants/Colors';

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
      <Stack.Screen 
        name="habit/[id]" 
        options={{ 
          headerShown: true,
          title: "Habit Details" 
        }} 
      />
    </Stack>
  );
}
