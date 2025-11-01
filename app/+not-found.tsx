import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>This page doesn’t exist.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700'
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontSize: 16
  }
});
