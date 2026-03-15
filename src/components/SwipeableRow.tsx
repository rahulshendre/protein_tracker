import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../constants';

const SWIPE_THRESHOLD = 80;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SWIPE_THRESHOLD,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  const handleDeletePress = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onDelete());
  };

  return (
    <View style={styles.wrapper}>
      {/* Red delete strip only on the right – visible when card swipes left */}
      <View style={[styles.revealRow, { backgroundColor: colors.error }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.deleteRevealButton} onPress={handleDeletePress}>
          <Text style={styles.deleteRevealText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.frontRow, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.xs,
    overflow: 'hidden',
  },
  revealRow: {
    position: 'absolute',
    top: 0,
    right: SPACING.md,
    bottom: 0,
    width: SWIPE_THRESHOLD + 20,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteRevealButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  deleteRevealText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  frontRow: {
    backgroundColor: 'transparent',
  },
});
