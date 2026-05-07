import { useCurrentUser, useSignOut } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const JOB_TITLES = [
  'Property Manager',
  'Real Estate Agent',
  'Broker',
  'Listing Agent',
  'Buyer\'s Agent',
  'Team Lead',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, loading } = useCurrentUser();
  const { signOut } = useSignOut();

  const [fullName, setFullName] = useState('');
  const [titleIndex, setTitleIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      const idx = JOB_TITLES.indexOf(profile.job_title ?? '');
      setTitleIndex(idx >= 0 ? idx : 0);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      await supabase
        .from('users')
        .update({ full_name: fullName, job_title: JOB_TITLES[titleIndex] })
        .eq('id', user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'A password reset link will be sent to your email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: async () => {
            if (user?.email) {
              await supabase.auth.resetPasswordForEmail(user.email);
              Alert.alert('Sent', 'Check your email for the reset link.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f1f1a] items-center justify-center">
        <ActivityIndicator color="#c9a96e" size="large" />
      </SafeAreaView>
    );
  }

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPERADMIN';

  return (
    <SafeAreaView className="flex-1 bg-[#162820]">
      <StatusBar style="light" backgroundColor="#162820" />
      {/* Header */}
      <View className="px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">My Profile</Text>
        <Text className="text-[#8a9e98] text-xs mt-0.5">Update your name and preferences.</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
        {isAdmin && (
          <View className="bg-purple-100 border border-purple-300 rounded-xl px-3 py-2 mb-4 self-start">
            <Text className="text-purple-700 text-xs font-bold">{profile?.role}</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-100 border border-red-300 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}
        {saved && (
          <View className="bg-green-100 border border-green-300 rounded-xl px-4 py-3 mb-4">
            <Text className="text-green-700 text-sm">Profile saved!</Text>
          </View>
        )}

        {/* Identity */}
        <Text className="text-[#6b7f79] text-xs font-bold tracking-widest mb-3">IDENTITY</Text>
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="text-[#6b7f79] text-xs font-semibold mb-1.5 tracking-wide">FULL NAME</Text>
          <TextInput
            className="bg-[#f8fafb] text-[#0f2820] rounded-xl px-4 py-3 border border-gray-200 text-base mb-4"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
          />
          <Text className="text-[#6b7f79] text-xs font-semibold mb-1.5 tracking-wide">EMAIL</Text>
          <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 flex-row items-center justify-between">
            <Text className="text-[#6b7f79] text-base">{user?.email}</Text>
            <Ionicons name="lock-closed" size={14} color="#9ca3af" />
          </View>
          <Text className="text-[#9ca3af] text-xs mt-1">Email cannot be changed. Contact support.</Text>
        </View>

        {/* Job Title */}
        <Text className="text-[#6b7f79] text-xs font-bold tracking-widest mb-3">JOB TITLE</Text>
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => setTitleIndex((i) => (i - 1 + JOB_TITLES.length) % JOB_TITLES.length)}
            >
              <Ionicons name="chevron-back" size={18} color="#0f2820" />
            </TouchableOpacity>
            <Text className="text-[#0f2820] font-bold text-base flex-1 text-center">
              {JOB_TITLES[titleIndex]}
            </Text>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => setTitleIndex((i) => (i + 1) % JOB_TITLES.length)}
            >
              <Ionicons name="chevron-forward" size={18} color="#0f2820" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        <Text className="text-[#6b7f79] text-xs font-bold tracking-widest mb-3">SECURITY</Text>
        <View className="bg-white rounded-2xl mb-5 shadow-sm overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center gap-3 px-4 py-4"
            onPress={handleChangePassword}
          >
            <Ionicons name="key-outline" size={20} color="#0f2820" />
            <Text className="text-[#0f2820] font-semibold flex-1">Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity
          className="bg-[#c9a96e] rounded-2xl py-4 items-center mb-4"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <Text className="text-white font-bold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Danger zone */}
        <Text className="text-[#6b7f79] text-xs font-bold tracking-widest mb-3">DANGER ZONE</Text>
        <View className="bg-white rounded-2xl mb-5 shadow-sm overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center gap-3 px-4 py-4"
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center mb-10">
          <Text className="text-[#6b7f79] text-sm">Need help? <Text className="text-green-600 font-semibold">Contact support</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
