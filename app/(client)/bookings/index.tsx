import { useCurrentUser } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import type { Request, RequestStatus } from '@/lib/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabKey = 'all' | 'active' | 'completed' | 'cancelled' | 'as_agent';

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: 'bg-orange-500',
  ACTIVE: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
};

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
      <Text className="text-white text-[10px] font-bold">{status}</Text>
    </View>
  );
}

function BookingRow({
  request,
  onStatusChange,
}: {
  request: Request;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const statuses: RequestStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-[#0f2820] font-bold text-sm">{request.address}</Text>
          <Text className="text-[#6b7f79] text-xs">{request.city}, {request.state} {request.zip}</Text>
        </View>
        <StatusBadge status={request.status} />
      </View>
      <View className="flex-row gap-4 mb-3">
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={13} color="#6b7f79" />
          <Text className="text-[#6b7f79] text-xs">{request.date}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={13} color="#6b7f79" />
          <Text className="text-[#6b7f79] text-xs">{request.start_time}–{request.end_time}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="cash-outline" size={13} color="#6b7f79" />
          <Text className="text-[#6b7f79] text-xs">${request.compensation}</Text>
        </View>
      </View>
      <TouchableOpacity
        className="flex-row items-center gap-1 self-start bg-gray-100 rounded-lg px-3 py-1.5"
        onPress={() => setOpen(!open)}
      >
        <Text className="text-[#0f2820] text-xs font-semibold">Change Status</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#0f2820" />
      </TouchableOpacity>
      {open && (
        <View className="mt-2 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
          {statuses.map((s, i) => (
            <TouchableOpacity
              key={s}
              className={`px-4 py-2.5 ${i < statuses.length - 1 ? 'border-b border-gray-200' : ''}`}
              onPress={() => { onStatusChange(request.id, s); setOpen(false); }}
            >
              <Text className={`text-sm font-semibold ${request.status === s ? 'text-green-600' : 'text-[#0f2820]'}`}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { requests, loading, updateRequestStatus, refresh } = useRequests();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'as_agent', label: 'As Agent' },
  ];

  const filtered = requests.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return r.status === 'PENDING' || r.status === 'ACTIVE';
    if (activeTab === 'completed') return r.status === 'COMPLETED';
    if (activeTab === 'cancelled') return r.status === 'CANCELLED';
    if (activeTab === 'as_agent') return r.agent_id === user?.id;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f0f4f3]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">My Bookings</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={20} color="#8a9e98" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#c9a96e] rounded-xl px-3 py-1.5 flex-row items-center gap-1"
            onPress={() => router.push('/(client)/new-request/index' as any)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text className="text-white text-xs font-bold">New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row px-4 pb-3 gap-2">
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              className={`px-4 py-1.5 rounded-full ${activeTab === t.key ? 'bg-green-600' : 'bg-[#1a2e28]'}`}
              onPress={() => setActiveTab(t.key)}
            >
              <Text className={`text-xs font-semibold ${activeTab === t.key ? 'text-white' : 'text-[#8a9e98]'}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c9a96e" size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="calendar-blank-outline" size={52} color="#c5d5d0" />
          <Text className="text-[#0f2820] font-bold text-lg mt-4 text-center">No bookings found.</Text>
          <Text className="text-[#6b7f79] text-sm text-center mt-1 mb-6">
            You haven't created any requests yet.
          </Text>
          <TouchableOpacity
            className="bg-[#c9a96e] rounded-2xl px-6 py-3"
            onPress={() => router.push('/(client)/new-request/index' as any)}
          >
            <Text className="text-white font-bold">Create your first request</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {filtered.map((r) => (
            <BookingRow
              key={r.id}
              request={r}
              onStatusChange={updateRequestStatus}
            />
          ))}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
