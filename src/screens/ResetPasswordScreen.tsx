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
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';

export function ResetPasswordScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogSuccess, setDialogSuccess] = useState(false);

  const showAlert = (title: string, message: string, success = false) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogSuccess(success);
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (dialogSuccess) {
      navigation.navigate('Login' as never);
    }
  };

  const handleResetPassword = async () => {
    if (!password.trim()) {
      showAlert('Error', 'Please enter a new password');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });
    
    setIsLoading(false);

    if (error) {
      showAlert('Error', error.message);
    } else {
      showAlert('Success', 'Your password has been updated. Please sign in with your new password.', true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={styles.emoji}>🔐</Text>
        <Text style={[styles.title, { color: colors.text }]}>Set New Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your new password below
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="New Password"
            placeholderTextColor={colors.disabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.disabled}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={[styles.backLinkText, { color: colors.secondary }]}>
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Themed Alert Dialog */}
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={handleDialogClose}
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
              onPress={handleDialogClose}
            >
              <Text style={styles.dialogButtonText}>OK</Text>
            </TouchableOpacity>
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
  backLink: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  backLinkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
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
});
