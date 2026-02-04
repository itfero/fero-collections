import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import { showErrorToast, showSuccessToast } from '../lib/utils/toast';
import { useRouter } from 'expo-router';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');

    try {
      // Use email as userId if it looks like email, otherwise use as username
      const email = userId.includes('@') ? userId : `${userId}@example.com`;
      
      await login(email, password);
debugger
      // show toast
      showSuccessToast('Logged in successfully', 'Welcome');

      // Navigation is handled automatically by root layout
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message || 'Login failed';
      setError(errorMsg);
      showErrorToast(errorMsg, 'Login Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Fero</Text>

      <TextInput
        placeholder="User ID"
        style={styles.input}
        onChangeText={setUserId}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.btn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? 'Logging in...' : 'Login Fero'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0c4ef4',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  error: {
    color: 'yellow',
    textAlign: 'center',
    marginBottom: 10,
  },
});