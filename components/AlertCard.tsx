import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';

interface AlertCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress?: () => void;
  type?: 'warning' | 'error' | 'info' | 'success';
}

export function AlertCard({ title, description, icon, onPress, type = 'info' }: AlertCardProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return `${colors.warning}10`;
      case 'error':
        return `${colors.error}10`;
      case 'success':
        return `${colors.accent}10`;
      case 'info':
      default:
        return `${colors.primary}10`;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'success':
        return colors.accent;
      case 'info':
      default:
        return colors.primary;
    }
  };

  const renderContent = () => (
    <View style={[
      styles.container,
      { backgroundColor: getBackgroundColor(), borderLeftColor: getBorderColor() }
    ]}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
});