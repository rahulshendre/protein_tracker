import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/types';

export function PhysiqueDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PhysiqueDetail'>>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const entry = route.params?.entry;

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Entry not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Entry</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="contain" />
        <Text style={[styles.weight, { color: colors.text }]}>{entry.weight} kg</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {format(parseISO(entry.createdAt), 'MMMM d, yyyy')}
        </Text>
        {entry.notes ? (
          <Text style={[styles.notes, { color: colors.text }]}>{entry.notes}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: { fontSize: FONT_SIZES.md },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold' },
  content: { padding: SPACING.md },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: SPACING.md },
  weight: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', marginBottom: SPACING.xs },
  date: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.md },
  notes: { fontSize: FONT_SIZES.md },
});
