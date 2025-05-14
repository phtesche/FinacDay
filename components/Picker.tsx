import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';
import { colors } from '@/constants/colors';

interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
}

export function Picker({ selectedValue, onValueChange, items, placeholder }: PickerProps) {
  return (
    <View style={styles.container}>
      <RNPicker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        {placeholder && <RNPicker.Item label={placeholder} value="" />}
        {items.map((item) => (
          <RNPicker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </RNPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        paddingVertical: 8,
      },
      android: {
        paddingHorizontal: 8,
      },
      web: {
        paddingHorizontal: 8,
      },
    }),
  },
  picker: {
    ...Platform.select({
      web: {
        height: 45,
        color: colors.textPrimary,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
      },
      default: {
        width: '100%',
        color: colors.textPrimary,
      },
    }),
  },
  pickerItem: {
    color: colors.textPrimary,
    fontFamily: 'Inter-Regular',
  },
});