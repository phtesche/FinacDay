import React from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';

interface KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: any;
}

export function KeyboardAwareScrollView({ children, style }: KeyboardAwareScrollViewProps) {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={[styles.container, style]}>
        <View style={styles.content}>
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, style]}
        contentContainerStyle={styles.content}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});