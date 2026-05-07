import { useRequests } from '@/hooks/useRequests';
import type { Request, RequestStatus } from '@/lib/types';
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

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: 'bg-orange-500',
  ACTIVE: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
};

const STATUS_FILTERS: (RequestStatus | 'ALL')[] = ['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

function RequestRow({
  request,
  onStatusChange,
}: {
  request: Request;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const statuses: RequestStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-sm overflow-hidden">
      <View className="px-4 py-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-[#0f2820] font-bold text-sm">{request.service_type}</Text>
            <Text className="text-[#6b7f79] text-xs mt-0.5">{request.address}</Text>
            <Text className="text-[#6b7f79] text-xs">{request.city}, {request.state} {request.zip}</Text>
          </View>
          <View className={`px-2.5 py-0.5 rounded-full ${STATUS_COLORS[request.status]}`}>
            <Text className="text-white text-[10px] font-bold">{request.status}</Text>
          </View>
        </View>

        <View className="flex-row gap-4 mb-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={12} color="#6b7f79" />
            <Text className="text-[#6b7f79] text-xs">{request.date}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#6b7f79" />
            <Text className="text-[#6b7f79] text-xs">{request.start_time}–{request.end_time}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="cash-outline" size={12} color="#c9a96e" />
            <Text className="text-[#c9a96e] text-xs font-bold">${request.compensation}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1 self-start bg-gray-100 rounded-lg px-3 py-1.5"
          onPress={() => setOpen(!open)}
        >
          <Text className="text-[#0f2820] text-xs font-semibold">Update Status</Text>
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
    </View>
  );
}

export default function AdminRequestsScreen() {
  const { requests, loading, updateRequestStatus, refresh } = useRequests();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchSearch =
      !search ||
      r.address.toLowerCase().includes(search.toLowerCase()) ||
      r.service_type.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f0f4f3]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">Requests ({requests.length})</Text>
        <TouchableOpacity onPress={refresh}>
          <Ionicons name="refresh" size={20} color="#8a9e98" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-[#162820]">
        <View className="flex-row items-center bg-[#1a2e28] rounded-xl px-3 gap-2 border border-[#2a3f38]">
          <Ionicons name="search" size={16} color="#4a6058" />
          <TextInput
            className="flex-1 text-white py-2.5 text-sm"
            placeholder="Search address or service..."
            placeholderTextColor="#4a6058"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Status filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row px-4 pb-3 gap-2">
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s}
              className={`px-4 py-1.5 rounded-full ${statusFilter === s ? 'bg-green-600' : 'bg-[#1a2e28]'}`}
              onPress={() => setStatusFilter(s)}
            >
              <Text className={`text-xs font-semibold ${statusFilter === s ? 'text-white' : 'text-[#8a9e98]'}`}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c9a96e" size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="list-outline" size={48} color="#c5d5d0" />
              <Text className="text-[#6b7f79] text-sm mt-3">No requests found.</Text>
            </View>
          ) : (
            filtered.map((r) => (
              <RequestRow key={r.id} request={r} onStatusChange={updateRequestStatus} />
            ))
          )}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
