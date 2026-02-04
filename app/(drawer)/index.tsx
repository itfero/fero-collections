import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IndexScreen from '../(app)';

export default function HomeScreen() {
  return (
    // <View style={styles.container}>
    //   <Text style={styles.title}>Fero Collections</Text>
    //   <Text style={styles.subtitle}>
    //     Welcome to the brochure app
    //   </Text>
      <IndexScreen />
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
