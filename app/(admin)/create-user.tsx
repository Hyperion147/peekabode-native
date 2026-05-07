import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'User (Client)', value: 'USER' },
  { label: 'Agent', value: 'AGENT' },
  { label: 'Admin', value: 'ADMIN' },
];

export default function CreateUserScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Sign up via Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), role } },
      });
      if (signUpError) throw signUpError;

      // Insert into users table
      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          role,
        });
        if (insertError) throw insertError;
      }

      setSuccess(true);
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('USER');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      {/* Header */}
      <View className="px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">Create User</Text>
        <Text className="text-[#8a9e98] text-xs mt-0.5">Add a new user to the platform.</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" keyboardShouldPersistTaps="handled">
        {error && (
          <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        )}
        {success && (
          <View className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-3 mb-4">
            <Text className="text-green-400 text-sm">User created successfully!</Text>
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

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">EMAIL</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-4 border border-[#2a3f38] text-base"
          placeholder="jane@example.com"
          placeholderTextColor="#4a6058"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">TEMPORARY PASSWORD</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-4 border border-[#2a3f38] text-base"
          placeholder="Min. 6 characters"
          placeholderTextColor="#4a6058"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text className="text-[#8a9e98] text-xs font-semibold mb-2 tracking-wide">ROLE</Text>
        <View className="bg-[#1a2e28] rounded-xl border border-[#2a3f38] mb-8 overflow-hidden">
          {ROLES.map((r, i) => (
            <TouchableOpacity
              key={r.value}
              className={`flex-row items-center justify-between px-4 py-3.5 ${i < ROLES.length - 1 ? 'border-b border-[#2a3f38]' : ''}`}
              onPress={() => setRole(r.value)}
            >
              <Text className={`text-base ${role === r.value ? 'text-green-400 font-semibold' : 'text-white'}`}>
                {r.label}
              </Text>
              {role === r.value && <Ionicons name="checkmark-circle" size={18} color="#22c55e" />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-[#c9a96e] rounded-2xl py-4 items-center mb-8"
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Create User</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
