import React, { useState } from 'react';
import { StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, View, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { showAlert } from '@/components/CustomAlert';
import Button from '@/components/Button';

const SignUp = () => {
  const colorScheme = useColorScheme() || 'light';
  const themeColors = Colors[colorScheme as keyof typeof Colors];
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showAlert({
        title: 'Error',
        message: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        title: 'Error',
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (!termsAccepted) {
      showAlert({
        title: 'Error',
        message: 'Please accept the terms and conditions',
        type: 'error'
      });
      return;
    }

    try {
      const result = await signUp({
        email,
        password,
        userName: name
      });

      if (result.success) {
        showAlert({
          title: 'Success',
          message: 'Your account has been created successfully!',
          type: 'success'
        });
      } else {
        showAlert({
          title: 'Error',
          message: result.error || 'Failed to create account. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      showAlert({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
    }
  };

  const navigateToSignIn = () => {
    router.push('/signIn');
  };

  const toggleTermsAccepted = () => {
    setTermsAccepted(!termsAccepted);
  };

  const isFormValid = name && email && password && confirmPassword && termsAccepted && password === confirmPassword;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Sign up to get started
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <FontAwesome 
                name="user" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <FontAwesome 
                name="envelope" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Email Address"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <FontAwesome 
                name="lock" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Password"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { 
              backgroundColor: themeColors.card, 
              borderColor: themeColors.border,
              marginBottom: 24
            }]}>
              <FontAwesome 
                name="lock" 
                size={18} 
                color={colorScheme === 'dark' ? '#A0A0A0' : '#666'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onSubmitEditing={handleSignUp}
              />
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                onPress={toggleTermsAccepted}
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                  { borderColor: colorScheme === 'dark' ? '#555' : '#999' }
                ]}
              >
                {termsAccepted && (
                  <FontAwesome name="check" size={12} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
                I agree to the{' '}
                <Text style={[styles.termsLink, { color: themeColors.primary }]} onPress={() => {
                  showAlert({
                    title: 'Terms of Service',
                    message: 'Our terms of service will be available soon.',
                    type: 'info'
                  });
                }}>Terms of Service</Text> and{' '}
                <Text style={[styles.termsLink, { color: themeColors.primary }]} onPress={() => {
                  showAlert({
                    title: 'Privacy Policy',
                    message: 'Our privacy policy will be available soon.',
                    type: 'info'
                  });
                }}>Privacy Policy</Text>
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              fullWidth
              style={[
                styles.signUpButton,
                { 
                  backgroundColor: themeColors.primary,
                  opacity: isFormValid ? 1 : 0.7,
                }
              ]}
              textStyle={styles.signUpButtonText}
              disabled={!isFormValid || isLoading}
            />

            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
                Already have an account?{' '}
                <Text 
                  style={[styles.signInText, { color: themeColors.primary }]}
                  onPress={navigateToSignIn}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    height: 56,
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
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signUpButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  signInText: {
    fontWeight: '600',
  },
});

export default SignUp;