import { useCurrentUser } from '@/hooks/useAuth';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useCurrentUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inClient = segments[0] === '(client)';
    const inAdmin = segments[0] === '(admin)';

    if (!user) {
      // Not signed in — send to landing unless already in auth
      if (!inAuth && segments[0] !== undefined) {
        router.replace('/(auth)/login' as any);
      }
    } else {
      const role = profile?.role ?? 'USER';
      // Signed in on splash or auth screen — redirect to correct dashboard
      if (segments[0] === undefined || segments[0] === 'index' || inAuth) {
        if (role === 'ADMIN' || role === 'SUPERADMIN') {
          router.replace('/(admin)' as any);
        } else {
          router.replace('/(client)' as any);
        }
      }
    }
  }, [user, profile, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(client)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </AuthGate>
      <StatusBar style="light" />
      <PortalHost />
    </SafeAreaProvider>
  );
}
