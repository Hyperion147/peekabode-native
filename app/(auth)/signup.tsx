import { useSignUp } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROLES = [
  { label: 'Property Manager', value: 'USER' },
  { label: 'Real Estate Agent', value: 'USER' },
  { label: 'Broker', value: 'USER' },
];

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading } = useSignUp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleIndex, setRoleIndex] = useState<number | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Full name, email and password are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      setError(null);
      const role = roleIndex !== null ? ROLES[roleIndex].value : 'USER';
      await signUp(fullName.trim(), email.trim(), password, role);
      router.replace('/(client)' as any);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#eef2f0]">
      <StatusBar style="dark" backgroundColor="#eef2f0" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card */}
          <View className="bg-white rounded-3xl px-6 py-8 shadow-sm">
            {/* Title */}
            <Text className="text-[#0f2820] text-3xl font-extrabold mb-1">
              Create Account
            </Text>
            <Text className="text-[#6b7f79] text-sm mb-7">
              Free to join. No credit card required.
            </Text>

            {/* Error */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-500 text-sm">{error}</Text>
              </View>
            )}

            {/* Full Name */}
            <View className="flex-row items-center gap-1 mb-2">
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest">FULL NAME</Text>
              <Text className="text-red-500 text-xs font-bold">*</Text>
            </View>
            <TextInput
              className="bg-[#f8fafb] border border-[#e2eae7] rounded-2xl px-4 py-3.5 text-[#0f2820] text-base mb-5"
              placeholder="Jane Smith"
              placeholderTextColor="#b0c4bc"
              value={fullName}
              onChangeText={setFullName}
              autoCorrect={false}
            />

            {/* Work Email */}
            <View className="flex-row items-center gap-1 mb-2">
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest">WORK EMAIL</Text>
              <Text className="text-red-500 text-xs font-bold">*</Text>
            </View>
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

            {/* Role */}
            <Text className="text-[#0f2820] text-xs font-bold tracking-widest mb-2">I AM A...</Text>
            <TouchableOpacity
              className="bg-[#f8fafb] border border-[#e2eae7] rounded-2xl px-4 py-3.5 flex-row justify-between items-center mb-1"
              onPress={() => setRoleOpen(!roleOpen)}
            >
              <Text className={`text-base ${roleIndex !== null ? 'text-[#0f2820]' : 'text-[#b0c4bc]'}`}>
                {roleIndex !== null ? ROLES[roleIndex].label : 'Select your role (optional)'}
              </Text>
              <Ionicons
                name={roleOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {roleOpen && (
              <View className="bg-white border border-[#e2eae7] rounded-2xl mb-4 overflow-hidden shadow-sm">
                {ROLES.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    className={`px-4 py-3.5 ${i < ROLES.length - 1 ? 'border-b border-[#f0f4f3]' : ''}`}
                    onPress={() => {
                      setRoleIndex(i);
                      setRoleOpen(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        roleIndex === i ? 'text-green-600 font-semibold' : 'text-[#0f2820]'
                      }`}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Password */}
            <View className="flex-row items-center gap-1 mb-2 mt-1">
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest">PASSWORD</Text>
              <Text className="text-red-500 text-xs font-bold">*</Text>
            </View>
            <TextInput
              className="bg-[#f8fafb] border border-[#e2eae7] rounded-2xl px-4 py-3.5 text-[#0f2820] text-base mb-6"
              placeholder="At least 8 characters"
              placeholderTextColor="#b0c4bc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Submit */}
            <TouchableOpacity
              className="bg-[#0f2820] rounded-2xl py-4 items-center mb-4"
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Create Free Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-[#9ca3af] text-xs text-center mb-5">
              By creating an account you agree to our{' '}
              <Text className="text-green-600 font-semibold">Terms</Text> and{' '}
              <Text className="text-green-600 font-semibold">Privacy Policy</Text>.
            </Text>

            {/* Footer link */}
            <View className="flex-row justify-center gap-1">
              <Text className="text-[#6b7f79] text-sm">Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
                <Text className="text-green-600 text-sm font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
