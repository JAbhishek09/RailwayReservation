import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Gender } from '../types/booking';

export interface PassengerFormData {
  name: string;
  age: number;
  gender: Gender;
}

export interface BookingFormValues {
  mode: 'UPI' | 'CARD' | 'NETBANKING';
  passengers: PassengerFormData[];
}

interface PassengerFormProps {
  index: number;
  control: Control<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
  onRemove?: () => void;
  canRemove: boolean;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  index,
  control,
  errors,
  onRemove,
  canRemove,
}) => {
  const passengerErrors = errors.passengers?.[index];

  const genderOptions: { label: string; value: Gender }[] = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' },
  ];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.passengerBadge}>
          <Text style={styles.passengerBadgeText}>Passenger {index + 1}</Text>
        </View>
        {canRemove && onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Name Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Full Name</Text>
        <Controller
          control={control}
          name={`passengers.${index}.name`}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, Boolean(passengerErrors?.name) && styles.inputError]}
              placeholder="e.g. Rahul Sharma"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
            />
          )}
        />
        {passengerErrors?.name && (
          <Text style={styles.errorText}>{passengerErrors.name.message}</Text>
        )}
      </View>

      {/* Age & Gender Row */}
      <View style={styles.row}>
        {/* Age Input */}
        <View style={[styles.fieldContainer, { flex: 0.8, marginRight: 12 }]}>
          <Text style={styles.fieldLabel}>Age</Text>
          <Controller
            control={control}
            name={`passengers.${index}.age`}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, Boolean(passengerErrors?.age) && styles.inputError]}
                placeholder="e.g. 28"
                keyboardType="number-pad"
                onBlur={onBlur}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  onChange(cleaned ? parseInt(cleaned, 10) : '');
                }}
                value={value !== undefined && value !== null ? String(value) : ''}
              />
            )}
          />
          {passengerErrors?.age && (
            <Text style={styles.errorText}>{passengerErrors.age.message}</Text>
          )}
        </View>

        {/* Gender Selection */}
        <View style={[styles.fieldContainer, { flex: 1.2 }]}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <Controller
            control={control}
            name={`passengers.${index}.gender`}
            render={({ field: { onChange, value } }) => (
              <View style={styles.genderRow}>
                {genderOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.genderPill, isSelected && styles.genderPillSelected]}
                      onPress={() => onChange(opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
          {passengerErrors?.gender && (
            <Text style={styles.errorText}>{passengerErrors.gender.message}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  passengerBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  passengerBadgeText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 13,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderPill: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderPillSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});

