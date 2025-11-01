import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Modal</Text>
      <Text style={styles.subtitle}>This is a test modal screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 8
  }
});
