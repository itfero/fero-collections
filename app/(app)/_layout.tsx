import 'react-native-gesture-handler';
import { Slot, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../../lib/auth/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const prevUser = useRef<any>(undefined);

  useEffect(() => {
    // Wait until auth initialization completes
    if (loading) return;

    // If this isn't the first run and the user hasn't changed, skip
    const userChanged = prevUser.current !== user;
    if (!userChanged && prevUser.current !== undefined) {
      return;
    }

    // Remember current user for next run
    prevUser.current = user;

    SplashScreen.hideAsync().catch(() => {});

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