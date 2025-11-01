import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from 'src/lib/supabase';

export default function HomeScreen() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        console.log('Supabase error:', error.message); // expect "relation 'users' does not exist" for now
      } else {
        console.log('Supabase OK. Sample:', data);
      }
    };
    test();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SONA</Text>
      <Text style={styles.tagline}>Where music happens.</Text>
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
  logo: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 2
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 8
  }
});
