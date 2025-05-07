import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignUp = async () => {
    // In a real app, this would validate and create the user account
    try {
      setIsLoading(true);
      // Store login state in AsyncStorage
      await AsyncStorage.setItem('isLoggedIn', 'true');
      // For demo purposes, we'll just navigate to the main app
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error during signup:', e);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToLogin = () => {
    router.push('/login');
  };
  
  const isFormValid = () => {
    return name.trim() !== '' && 
           email.trim() !== '' && 
           password.trim() !== '' && 
           password === confirmPassword && 
           termsAccepted;
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
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>Sign up to track and build better habits</Text>
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: 'transparent' }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
            <FontAwesome name="user" size={18} color={colorScheme === 'dark' ? '#999' : '#999'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
            />
          </View>
          
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
          
          <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
            <FontAwesome name="lock" size={18} color={colorScheme === 'dark' ? '#999' : '#999'} style={styles.inputIcon} />
         
             <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.termsContainer, { backgroundColor: 'transparent' }]}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkboxContainer, { backgroundColor: 'transparent' }]}>
              {termsAccepted ? (
                <FontAwesome name="check-square" size={20} color={colors.primary} />
              ) : (
                <FontAwesome name="square-o" size={20} color={colorScheme === 'dark' ? '#999' : '#999'} />
              )}
            </View>
            <Text style={[styles.termsText, { color: colorScheme === 'dark' ? '#EEE' : '#333' }]}>
              I agree to the <Text style={[styles.termsLink, { color: colors.primary }]}>Terms of Service</Text> and <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.signUpButton, 
            { backgroundColor: colors.primary },
            (!isFormValid() || isLoading) && styles.disabledButton
          ]}
          onPress={handleSignUp}
          disabled={!isFormValid() || isLoading}
        >
          <Text style={styles.signUpButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
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
          <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>Already have an account?</Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={[styles.loginText, { color: colors.primary }]}>Log In</Text>
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkboxContainer: {
    marginRight: 10,
    paddingTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signUpButton: {
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
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
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
  loginText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 