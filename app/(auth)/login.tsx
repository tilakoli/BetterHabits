import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    // In a real app, this would validate and authenticate the user
    try {
      setIsLoading(true);
      // Store login state in AsyncStorage
      await AsyncStorage.setItem('isLoggedIn', 'true');
      // For demo purposes, we'll just navigate to the main app
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error during login:', e);
      alert('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToSignUp = () => {
    router.push('/signup');
  };
  
  const navigateToForgotPassword = () => {
    // In a real app, this would navigate to forgot password screen
    alert('Forgot Password functionality would be implemented here');
  };
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.headerContainer, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome to HabitPro</Text>
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>Log in to continue building better habits</Text>
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: 'transparent' }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
            <FontAwesome name="envelope" size={18} color={colorScheme === 'dark' ? '#999' : '#999'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
            />
          </View>
          
          <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
            <FontAwesome name="lock" size={18} color={colorScheme === 'dark' ? '#999' : '#999'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color={colorScheme === 'dark' ? '#999' : '#999'} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={navigateToForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={!email || !password || isLoading}
        >
          <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>
        
        <View style={[styles.dividerContainer, { backgroundColor: 'transparent' }]}>
          <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444' : '#DDD' }]} />
          <Text style={[styles.dividerText, { color: colorScheme === 'dark' ? '#999' : '#999' }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444' : '#DDD' }]} />
        </View>
        
        <View style={[styles.socialButtonsContainer, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
            <FontAwesome name="google" size={18} color="#DB4437" />
            <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
            <FontAwesome name="apple" size={18} color={colorScheme === 'dark' ? '#FFF' : '#000'} />
            <Text style={[styles.socialButtonText, { color: colors.text }]}>Apple</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.footerContainer, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>Don't have an account?</Text>
          <TouchableOpacity onPress={navigateToSignUp}>
            <Text style={[styles.signUpText, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    color: '#999',
    paddingHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 24,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 