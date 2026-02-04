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
  // prevUser tracks last known user so we can react to changes
  const prevUser = useRef<any>(undefined);
  // track whether initial mount happened (helps avoid double navigation on mount)
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    // Wait until auth initialization completes
    if (loading) {
      console.debug('[AuthGate] waiting for loading to finish');
      return;
    }

    // If not mounted yet, wait for mount
    if (!mounted.current) return;

    const userChanged = prevUser.current !== user;
    // If it's not the first run and user didn't change, skip
    if (!userChanged && prevUser.current !== undefined) {
      console.debug('[AuthGate] no change in user, skipping navigation', { user });
      return;
    }

    console.debug('[AuthGate] navigating because auth resolved or user changed', { user, prev: prevUser.current });

    // Remember current user for next run
    prevUser.current = user;

    // Hide splash then navigate
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