// import { Slot, useRouter } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect, useRef, useState } from 'react';
// import { AuthProvider, useAuth } from '../lib/AuthContext';

// SplashScreen.preventAutoHideAsync().catch(() => {});

// function AuthGate() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   const hasNavigated = useRef(false);
//   const [mounted, setMounted] = useState(false);

//   // 1️⃣ Mark layout as mounted
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // 2️⃣ Navigate ONLY after mount + auth resolved
//   useEffect(() => {
//     if (!mounted || loading || hasNavigated.current) return;

//     hasNavigated.current = true;

//     SplashScreen.hideAsync().catch(() => {});

//     if (user) {
//       router.replace('/(app)');
//     } else {
//       router.replace('/(auth)/login');
//     }
//   }, [mounted, loading, user]);

//   // 3️⃣ Slot MUST always render
//   return <Slot />;
// }

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <AuthGate />
//     </AuthProvider>
//   );
// }
// import { Slot } from 'expo-router';
// import { AuthProvider } from '../lib/AuthContext';

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <Slot />
//     </AuthProvider>
//   );
// }
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

