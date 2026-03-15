import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { PhysiqueEntry } from '../types';
import * as physiqueStorage from '../services/physiqueStorage';
import * as cloudData from '../services/supabaseData';
import { useAuthStore } from '../stores/authStore';

export function PhysiqueScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<PhysiqueEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async () => {
    const userId = user?.id;
    if (userId) {
      try {
        const list = await cloudData.getCloudPhysiqueEntries(userId);
        setEntries(list);
        await physiqueStorage.setPhysiqueEntries(list);
      } catch {
        const list = await physiqueStorage.getPhysiqueEntries();
        setEntries(list);
      }
    } else {
      const list = await physiqueStorage.getPhysiqueEntries();
      setEntries(list);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, [loadEntries]);

  const renderItem = ({ item }: { item: PhysiqueEntry }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('PhysiqueDetail', { entry: item })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={[styles.weight, { color: colors.text }]}>{item.weight} kg</Text>
        <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.notes || '—'}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {format(parseISO(item.createdAt), 'MMM d, yyyy')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Physique</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, entries.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No entries yet. Tap Add to log a photo, weight & notes.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddPhysique')}
      >
        <Text style={styles.fabText}>+ Add</Text>
      </TouchableOpacity>
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
    marginBottom: SPACING.sm,
  },
  backButton: { fontSize: FONT_SIZES.md },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold' },
  list: { padding: SPACING.md, paddingBottom: 80 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  emptyText: { textAlign: 'center', fontSize: FONT_SIZES.md, paddingVertical: SPACING.xl },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    flexDirection: 'row',
  },
  thumbnail: { width: 100, height: 100 },
  cardBody: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  weight: { fontSize: FONT_SIZES.lg, fontWeight: '600' },
  notes: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  date: { fontSize: FONT_SIZES.xs, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    alignSelf: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  fabText: { color: '#FFF', fontSize: FONT_SIZES.md, fontWeight: '600' },
});
