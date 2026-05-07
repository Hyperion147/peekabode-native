import { useSignUp } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleOpen, setRoleOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    try {
      setError(null);
      await signUp(fullName.trim(), email.trim(), password, ROLES[roleIndex].value);
      router.replace('/(client)' as any);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
        <TouchableOpacity className="flex-row items-center gap-1 mb-8" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#8a9e98" />
          <Text className="text-[#8a9e98] text-sm">Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2.5 mb-8">
          <View className="w-10 h-10 rounded-xl bg-green-500 items-center justify-center">
            <Ionicons name="home" size={20} color="#fff" />
          </View>
          <Text className="text-white text-xl font-bold">PeekAbode</Text>
        </View>

        <Text className="text-white text-3xl font-extrabold mb-1">Create Account</Text>
        <Text className="text-[#8a9e98] text-base mb-8">Free to join.</Text>

        {error && (
          <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">FULL NAME</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-4 border border-[#2a3f38] text-base"
          placeholder="Jane Smith"
          placeholderTextColor="#4a6058"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">WORK EMAIL</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-4 border border-[#2a3f38] text-base"
          placeholder="you@example.com"
          placeholderTextColor="#4a6058"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">I AM A...</Text>
        <TouchableOpacity
          className="bg-[#1a2e28] rounded-xl px-4 py-3.5 mb-1 border border-[#2a3f38] flex-row justify-between items-center"
          onPress={() => setRoleOpen(!roleOpen)}
        >
          <Text className="text-white text-base">{ROLES[roleIndex].label}</Text>
          <Ionicons name={roleOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#8a9e98" />
        </TouchableOpacity>
        {roleOpen && (
          <View className="bg-[#1a2e28] border border-[#2a3f38] rounded-xl mb-4 overflow-hidden">
            {ROLES.map((r, i) => (
              <TouchableOpacity
                key={i}
                className={`px-4 py-3.5 ${i < ROLES.length - 1 ? 'border-b border-[#2a3f38]' : ''}`}
                onPress={() => { setRoleIndex(i); setRoleOpen(false); }}
              >
                <Text className={`text-base ${i === roleIndex ? 'text-green-400 font-semibold' : 'text-white'}`}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide mt-2">PASSWORD</Text>
        <View className="relative mb-8">
          <TextInput
            className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 border border-[#2a3f38] text-base pr-12"
            placeholder="••••••••"
            placeholderTextColor="#4a6058"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity className="absolute right-4 top-3.5" onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#4a6058" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-[#c9a96e] rounded-2xl py-4 items-center mb-4"
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text className="text-white text-base font-bold">Create Free Account</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center gap-1 mb-12">
          <Text className="text-[#8a9e98] text-sm">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
            <Text className="text-green-400 text-sm font-semibold">Sign In →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
