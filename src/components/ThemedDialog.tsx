import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ThemedDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: DialogButton[];
  onClose: () => void;
}

export function ThemedDialog({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {}, style: 'default' }],
  onClose,
}: ThemedDialogProps) {
  const { colors } = useTheme();

  const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return { backgroundColor: colors.error };
      case 'cancel':
        return { backgroundColor: colors.border };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getButtonTextColor = (style?: 'default' | 'cancel' | 'destructive') => {
    if (style === 'cancel') {
      return { color: colors.text };
    }
    return { color: '#FFFFFF' };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
          <View style={[
            styles.buttonContainer,
            buttons.length > 1 && styles.buttonRow
          ]}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  buttons.length > 1 && styles.buttonHalf,
                  getButtonStyle(button.style),
                ]}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
              >
                <Text style={[styles.buttonText, getButtonTextColor(button.style)]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonHalf: {
    flex: 1,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
