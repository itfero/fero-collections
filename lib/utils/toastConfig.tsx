import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const toastConfig = {
  // custom success type
  success: ({ text1, text2 }: any) => (
    <View style={styles.containerSuccess}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={styles.containerError}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),
};

const styles = StyleSheet.create({
  containerSuccess: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1e8e3e',
    marginHorizontal: 16,
  },
  containerError: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#c0392b',
    marginHorizontal: 16,
  },
  title: { color: '#fff', fontWeight: '700' },
  message: { color: '#fff', marginTop: 4 },
});

export default toastConfig;