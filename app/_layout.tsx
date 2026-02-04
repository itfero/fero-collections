import 'react-native-gesture-handler';
import { Slot, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../lib/auth/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (loading || hasNavigated.current) return;

    hasNavigated.current = true;
    SplashScreen.hideAsync().catch(() => {});
debugger
    if (user) {
      router.replace('/(drawer)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [loading, user, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

