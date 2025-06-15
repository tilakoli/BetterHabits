import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, View, StatusBar } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/providers/AuthProvider/useAuth';
import { showAlert } from '@/components/CustomAlert';

export default function SignUp() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSignUp = async () => {
    try {
      const result = await signUp({
        email,
        password,
        userName: name
      });

      if (result.success) {
        // The auth state change will handle the navigation to the home page
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

  const navigateToLogin = () => {
    router.push('/signIn');
  };

  const isFormValid = () => {
    return name.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      password === confirmPassword &&
      termsAccepted;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
              Build habits that build you!
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.formInnerContainer, { maxWidth: 400, width: '100%', alignSelf: 'center' }]}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FontAwesome
                  name="user"
                  size={18}
                  color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FontAwesome
                  name="envelope"
                  size={18}
                  color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email Address"
                  placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FontAwesome
                  name="lock"
                  size={18}
                  color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
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

              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FontAwesome
                  name="lock"
                  size={18}
                  color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colorScheme === 'dark' ? '#555' : '#999'}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <View style={[styles.termsContainer, { marginTop: 8 }]}>
                <TouchableOpacity
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  style={styles.checkboxContainer}
                >
                  {termsAccepted ? (
                    <FontAwesome name="check-square" size={20} color={colors.primary} />
                  ) : (
                    <FontAwesome
                      name="square-o"
                      size={20}
                      color={colorScheme === 'dark' ? '#A0A0A0' : '#666'}
                    />
                  )}
                </TouchableOpacity>
                <Text style={[styles.termsText, {
                  color: colorScheme === 'dark' ? '#E0E0E0' : '#333',
                  flex: 1,
                  marginLeft: 8,
                  lineHeight: 20,
                }]}>
                  I agree to the{' '}
                  <Text style={[styles.termsLink, { color: colors.primary }]} onPress={() => { }}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={[styles.termsLink, { color: colors.primary }]} onPress={() => { }}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: (!isFormValid() || isLoading) ? 0.7 : 1,
                  }
                ]}
                onPress={handleSignUp}
                disabled={!isFormValid() || isLoading}
              >
                <Text style={styles.signUpButtonText}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444' : '#E0E0E0' }]} />
                <Text style={[styles.dividerText, { color: colorScheme === 'dark' ? '#888' : '#999' }]}>or</Text>
                <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444' : '#E0E0E0' }]} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={[styles.socialButton, {
                    backgroundColor: colors.card,
                    borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
                    borderWidth: 1,
                  }]}
                >
                  <FontAwesome name="google" size={18} color="#DB4437" />
                  <Text style={[styles.socialButtonText, { color: colors.text, marginLeft: 8 }]}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, {
                    backgroundColor: colors.card,
                    borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
                    borderWidth: 1,
                    marginTop: 12,
                  }]}
                >
                  <FontAwesome
                    name="apple"
                    size={18}
                    color={colorScheme === 'dark' ? '#FFF' : '#000'}
                  />
                  <Text style={[styles.socialButtonText, { color: colors.text, marginLeft: 8 }]}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                  <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#A0A0A0' : '#666' }]}>
                    Already have an account?{' '}
                    <Text
                      style={[styles.loginText, { color: colors.primary }]}
                      onPress={navigateToLogin}
                    >
                      Sign In
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>


        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  formInnerContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkboxContainer: {
    paddingTop: 2,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginText: {
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 12,
  },
  socialButtonsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
});