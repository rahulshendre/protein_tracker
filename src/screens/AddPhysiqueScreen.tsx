import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { PhysiqueEntry } from '../types';
import * as physiqueStorage from '../services/physiqueStorage';

export function AddPhysiqueScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (res) => {
        if (res.didCancel || !res.assets?.[0]?.uri) return;
        setImageUri(res.assets[0].uri);
      }
    );
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('Missing photo', 'Please add a photo first.');
      return;
    }
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Invalid weight', 'Enter a valid weight (e.g. 70).');
      return;
    }
    const entry: PhysiqueEntry = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      imageUri,
      weight: w,
      notes: notes.trim(),
    };
    await physiqueStorage.addPhysiqueEntry(entry);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add entry</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.photoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={pickImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <Text style={[styles.photoPlaceholder, { color: colors.textSecondary }]}>Tap to add photo</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.field, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="e.g. 72.5"
            placeholderTextColor={colors.disabled}
          />
        </View>

        <View style={[styles.field, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput, { color: colors.text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor={colors.disabled}
            multiline
          />
        </View>
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
  title: { fontSize: FONT_SIZES.lg, fontWeight: '600' },
  saveButton: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  content: { padding: SPACING.md },
  photoBox: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 280,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: { width: '100%', height: '100%' },
  photoPlaceholder: { fontSize: FONT_SIZES.md },
  field: { borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.xs },
  input: { fontSize: FONT_SIZES.lg },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
});
