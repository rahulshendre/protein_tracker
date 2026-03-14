import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { resetPassword } from '../services/auth';
import { RootStackParamList } from '../navigation/types';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { colors } = useTheme();
  const { signIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const showAlert = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setShowDialog(true);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      showAlert('Login Failed', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      showAlert('Error', 'Please enter your email');
      return;
    }

    setIsResetting(true);
    const { error } = await resetPassword(resetEmail.trim());
    setIsResetting(false);

    if (error) {
      showAlert('Error', error.message);
    } else {
      setShowForgotModal(false);
      setResetEmail('');
      showAlert('Email Sent', 'Check your inbox for reset instructions');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={styles.emoji}>💪</Text>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to sync your progress
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Email"
            placeholderTextColor={colors.disabled}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Password"
            placeholderTextColor={colors.disabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => {
              setResetEmail(email);
              setShowForgotModal(true);
            }}
          >
            <Text style={[styles.forgotText, { color: colors.secondary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Themed Alert Dialog */}
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              {dialogTitle}
            </Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>
              {dialogMessage}
            </Text>
            <TouchableOpacity
              style={[styles.dialogButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowDialog(false)}
            >
              <Text style={styles.dialogButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>
              Enter your email and we'll send you reset instructions.
            </Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="Email"
              placeholderTextColor={colors.disabled}
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButtonHalf, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowForgotModal(false);
                  setResetEmail('');
                }}
              >
                <Text style={[styles.dialogButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButtonHalf, { backgroundColor: colors.primary }]}
                onPress={handleForgotPassword}
                disabled={isResetting}
              >
                <Text style={styles.dialogButtonText}>
                  {isResetting ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  form: {
    gap: SPACING.md,
  },
  input: {
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  forgotText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  dialogButton: {
    width: '100%',
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  dialogButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  dialogButtonHalf: {
    flex: 1,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  modalInput: {
    width: '100%',
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
});
