import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { TreatmentDetailScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useTreatmentStore } from '../stores/treatment-store';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatRelativeTime, parseISO } from '../utils/date-helpers';

export function TreatmentDetailScreen({
  navigation,
  route,
}: TreatmentDetailScreenProps): React.JSX.Element {
  const db = useDatabase();
  const store = useTreatmentStore();
  const { id } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const treatment = useMemo(() => {
    return store.treatments.find((t) => t.id === id) ?? null;
  }, [id, store.treatments]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Treatment Details',
    });
  }, [navigation]);

  const handleEdit = (): void => {
    navigation.navigate('TreatmentForm', { id });
  };

  const handleDelete = async (): Promise<void> => {
    setShowDeleteDialog(false);
    try {
      await store.remove(db, id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete treatment. Please try again.');
    }
  };

  const handleSetEffective = async (
    value: boolean | null
  ): Promise<void> => {
    try {
      await store.update(db, id, { effective: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update effectiveness.');
    }
  };

  if (!treatment) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Treatment not found.</Text>
      </View>
    );
  }

  const date = parseISO(treatment.timestamp);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {treatment.type.charAt(0).toUpperCase() +
                treatment.type.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Name</Text>
          <Text style={styles.fieldValue}>{treatment.name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValue}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Logged</Text>
          <Text style={styles.fieldValue}>
            {formatRelativeTime(treatment.timestamp)}
          </Text>
        </View>

        {treatment.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <Text style={styles.notesText}>{treatment.notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.effectivenessCard}>
        <Text style={styles.effectivenessTitle}>Was this effective?</Text>
        <View style={styles.effectivenessRow}>
          <TouchableOpacity
            style={[
              styles.effectivenessButton,
              treatment.effective === true && styles.effectivenessButtonYes,
            ]}
            onPress={() => handleSetEffective(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.effectivenessButtonText,
                treatment.effective === true &&
                  styles.effectivenessButtonTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.effectivenessButton,
              treatment.effective === false && styles.effectivenessButtonNo,
            ]}
            onPress={() => handleSetEffective(false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.effectivenessButtonText,
                treatment.effective === false &&
                  styles.effectivenessButtonTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.effectivenessButton,
              treatment.effective === null &&
                styles.effectivenessButtonUnknown,
            ]}
            onPress={() => handleSetEffective(null)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.effectivenessButtonText,
                treatment.effective === null &&
                  styles.effectivenessButtonTextActive,
              ]}
            >
              Unknown
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteDialog(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Treatment"
        message="Are you sure you want to delete this treatment? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#999999',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  fieldValue: {
    fontSize: 14,
    color: '#333333',
  },
  typeBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  notesSection: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  effectivenessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  effectivenessTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  effectivenessRow: {
    flexDirection: 'row',
    gap: 10,
  },
  effectivenessButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  effectivenessButtonYes: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  effectivenessButtonNo: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  effectivenessButtonUnknown: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
  effectivenessButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  effectivenessButtonTextActive: {
    fontWeight: '600',
    color: '#333333',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});
