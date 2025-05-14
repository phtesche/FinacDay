import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  type = 'primary',
  style,
  textStyle,
  isLoading = false,
  disabled = false,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    type === 'primary' && styles.primaryButton,
    type === 'secondary' && styles.secondaryButton,
    type === 'danger' && styles.dangerButton,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    type === 'primary' && styles.primaryButtonText,
    type === 'secondary' && styles.secondaryButtonText,
    type === 'danger' && styles.dangerButtonText,
    disabled && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={type === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  primaryButtonText: {
    color: colors.white,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  dangerButtonText: {
    color: colors.white,
  },
  disabledButtonText: {
    color: colors.textTertiary,
  },
});