import { useCurrentUser, useSignOut } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useUsers } from '@/hooks/useUsers';
import type { RequestStatus } from '@/lib/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: 'bg-orange-500',
  ACTIVE: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
};

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
      <Text className="text-white text-[10px] font-bold">{status}</Text>
    </View>
  );
}

export default function AdminOverview() {
  const router = useRouter();
  const { profile } = useCurrentUser();
  const { signOut } = useSignOut();
  const { users, loading: usersLoading } = useUsers();
  const { requests, loading: reqLoading, refresh } = useRequests();

  const pending = requests.filter((r) => r.status === 'PENDING');
  const active = requests.filter((r) => r.status === 'ACTIVE');
  const recent = requests.slice(0, 5);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  const isLoading = usersLoading || reqLoading;

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-green-500 items-center justify-center">
            <Ionicons name="home" size={16} color="#fff" />
          </View>
          <View>
            <Text className="text-white font-bold text-base">PeekAbode Admin</Text>
            <Text className="text-[#4a6058] text-[10px]">{profile?.role}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Text className="text-[#8a9e98] text-sm">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c9a96e" size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-6 pb-2">
            <Text className="text-white text-2xl font-extrabold">Overview</Text>
            <Text className="text-[#8a9e98] text-sm mt-1">Platform at a glance</Text>
          </View>

          {/* Stat cards */}
          <View className="px-5 flex-row flex-wrap gap-3 mt-4 mb-6">
            {[
              { label: 'Total Users', value: users.length, icon: 'people', color: 'bg-blue-900/50', route: '/(admin)/users' },
              { label: 'Total Requests', value: requests.length, icon: 'clipboard-list', color: 'bg-purple-900/50', route: '/(admin)/requests' },
              { label: 'Pending Sync', value: pending.length, icon: 'time', color: 'bg-orange-900/50', route: '/(admin)/requests' },
              { label: 'Live Shows', value: active.length, icon: 'flash', color: 'bg-green-900/50', route: '/(admin)/requests' },
            ].map((s, i) => (
              <TouchableOpacity
                key={i}
                className={`flex-1 min-w-[44%] ${s.color} rounded-2xl p-4 border border-[#2a3f38]`}
                onPress={() => router.push(s.route as any)}
              >
                <Ionicons name={s.icon as any} size={20} color="#c9a96e" />
                <Text className="text-white text-2xl font-extrabold mt-2">{s.value}</Text>
                <Text className="text-[#8a9e98] text-xs mt-0.5">{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Requests */}
          <View className="px-5 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-bold text-base">Recent Requests</Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/requests' as any)}>
                <Text className="text-green-400 text-xs font-semibold">View all →</Text>
              </TouchableOpacity>
            </View>

            {recent.length === 0 ? (
              <View className="bg-[#1a2e28] rounded-2xl p-6 items-center border border-[#2a3f38]">
                <MaterialCommunityIcons name="clipboard-outline" size={36} color="#2a3f38" />
                <Text className="text-[#4a6058] text-sm mt-2">No requests yet.</Text>
              </View>
            ) : (
              recent.map((r) => (
                <View key={r.id} className="bg-[#1a2e28] rounded-2xl p-4 mb-3 border border-[#2a3f38]">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-semibold text-sm flex-1 mr-2">{r.service_type}</Text>
                    <StatusBadge status={r.status} />
                  </View>
                  <Text className="text-[#8a9e98] text-xs">{r.address}, {r.city}, {r.state}</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-[#4a6058] text-xs">{r.date}</Text>
                    <Text className="text-[#c9a96e] text-xs font-bold">${r.compensation}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Quick links */}
          <View className="px-5 mb-8">
            <Text className="text-white font-bold text-base mb-3">Quick Actions</Text>
            <View className="gap-2">
              {[
                { label: 'Manage Users', icon: 'people-outline', route: '/(admin)/users' },
                { label: 'All Requests', icon: 'list-outline', route: '/(admin)/requests' },
                { label: 'Create User', icon: 'person-add-outline', route: '/(admin)/create-user' },
              ].map((a) => (
                <TouchableOpacity
                  key={a.label}
                  className="bg-[#1a2e28] rounded-2xl px-4 py-4 flex-row items-center gap-3 border border-[#2a3f38]"
                  onPress={() => router.push(a.route as any)}
                >
                  <Ionicons name={a.icon as any} size={20} color="#c9a96e" />
                  <Text className="text-white font-semibold flex-1">{a.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4a6058" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
