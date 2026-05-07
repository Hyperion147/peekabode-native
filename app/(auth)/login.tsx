import { useSignIn } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    try {
      setError(null);
      await signIn(email.trim(), password);
      // Fetch role and redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        const role = profile?.role ?? 'USER';
        if (role === 'ADMIN' || role === 'SUPERADMIN') {
          router.replace('/(admin)' as any);
        } else {
          router.replace('/(client)' as any);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      <View className="flex-1 px-6 pt-4">
        {/* Back */}
        <TouchableOpacity className="flex-row items-center gap-1 mb-8" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#8a9e98" />
          <Text className="text-[#8a9e98] text-sm">Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View className="flex-row items-center gap-2.5 mb-8">
          <View className="w-10 h-10 rounded-xl bg-green-500 items-center justify-center">
            <Ionicons name="home" size={20} color="#fff" />
          </View>
          <Text className="text-white text-xl font-bold">PeekAbode</Text>
        </View>

        <Text className="text-white text-3xl font-extrabold mb-1">Sign In</Text>
        <Text className="text-[#8a9e98] text-base mb-8">Welcome back.</Text>

        {error && (
          <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">EMAIL</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-4 border border-[#2a3f38] text-base"
          placeholder="you@example.com"
          placeholderTextColor="#4a6058"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">PASSWORD</Text>
        <View className="relative mb-2">
          <TextInput
            className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 border border-[#2a3f38] text-base pr-12"
            placeholder="••••••••"
            placeholderTextColor="#4a6058"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-3.5"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#4a6058" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="self-end mb-8">
          <Text className="text-[#c9a96e] text-sm">Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#c9a96e] rounded-2xl py-4 items-center mb-4"
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base font-bold">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center gap-1 mt-2">
          <Text className="text-[#8a9e98] text-sm">Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
            <Text className="text-green-400 text-sm font-semibold">Create one free →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
