import { useSignIn } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
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
    <SafeAreaView className="flex-1 bg-[#eef2f0]">
      <StatusBar style="dark" backgroundColor="#eef2f0" />
      <KeyboardAvoidingView
        className="flex-1 justify-center px-5"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Card */}
        <View className="bg-white rounded-3xl px-6 py-8 shadow-sm">
          {/* Title */}
          <Text className="text-[#0f2820] text-3xl font-extrabold text-center mb-1">
            Sign In
          </Text>
          <Text className="text-[#6b7f79] text-sm text-center mb-7">
            Welcome back. Enter your credentials to continue.
          </Text>

          {/* Error */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-500 text-sm">{error}</Text>
            </View>
          )}

          {/* Email */}
          <Text className="text-[#0f2820] text-xs font-bold tracking-widest mb-2">
            EMAIL ADDRESS
          </Text>
          <TextInput
            className="bg-[#f8fafb] border border-[#e2eae7] rounded-2xl px-4 py-3.5 text-[#0f2820] text-base mb-5"
            placeholder="you@work.com"
            placeholderTextColor="#b0c4bc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password row */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[#0f2820] text-xs font-bold tracking-widest">PASSWORD</Text>
            <TouchableOpacity>
              <Text className="text-green-600 text-xs font-semibold">Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-[#f8fafb] border border-[#e2eae7] rounded-2xl flex-row items-center px-4 mb-6">
            <TextInput
              className="flex-1 py-3.5 text-[#0f2820] text-base"
              placeholder="••••••••"
              placeholderTextColor="#b0c4bc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            className="bg-[#0f2820] rounded-2xl py-4 items-center mb-6"
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Footer link */}
          <View className="flex-row justify-center gap-1">
            <Text className="text-[#6b7f79] text-sm">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
              <Text className="text-green-600 text-sm font-bold">Create one free</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
