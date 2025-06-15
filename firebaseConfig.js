// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, setPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Clear persisted auth state (useful for logout)
export const clearPersistedAuthState = async () => {
  try {
    // Sign out first
    await auth.signOut();
    
    // Switch to in-memory persistence temporarily
    await setPersistence(auth, inMemoryPersistence);
    
    // Clear any remaining auth state
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => key.startsWith('firebase:authUser'));
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
    }
    
    // Switch back to AsyncStorage persistence
    await setPersistence(auth, getReactNativePersistence(AsyncStorage));
    
    return true;
  } catch (error) {
    console.error('Error clearing persisted auth state:', error);
    return false;
  }
};

export const DB = getFirestore(app)
export const usersRef = collection(DB, 'users')
export const habitsRef = collection(DB, 'habits')