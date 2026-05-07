import { useCurrentUser } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import type { Request, ServiceType } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS: { label: string; value: ServiceType | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Showing', value: 'Showing' },
  { label: 'Open House', value: 'Open House' },
  { label: 'Lockbox', value: 'Lockbox Drop' },
  { label: 'Photos', value: 'Photography' },
  { label: 'Report', value: 'Property Report' },
];

const SERVICE_ICONS: Record<string, string> = {
  Showing: 'home',
  'Open House': 'home-outline',
  'Lockbox Drop': 'key',
  Photography: 'camera',
  'Property Report': 'document-text',
};

function OpportunityCard({
  request,
  onPress,
}: {
  request: Request;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 shadow-sm flex-1"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center mb-3">
        <Ionicons name={(SERVICE_ICONS[request.service_type] ?? 'home') as any} size={20} color="#e05c2a" />
      </View>
      <Text className="text-[#0f2820] font-bold text-sm mb-0.5">{request.service_type}</Text>
      <Text className="text-[#6b7f79] text-xs mb-0.5">{request.address}</Text>
      <Text className="text-[#6b7f79] text-xs mb-2">{request.city}, {request.state}</Text>
      <Text className="text-[#6b7f79] text-xs">{request.date}</Text>
      <Text className="text-[#6b7f79] text-xs mb-3">{request.start_time}–{request.end_time}</Text>
      <Text className="text-[#c9a96e] font-extrabold text-base mb-3">${request.compensation}</Text>
      <TouchableOpacity
        className="bg-[#0f2820] rounded-xl py-2 items-center"
        onPress={onPress}
      >
        <Text className="text-white text-xs font-bold">View & Apply</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function DetailModal({
  request,
  visible,
  onClose,
  onApply,
  applying,
}: {
  request: Request | null;
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  applying: boolean;
}) {
  if (!request) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-[#0f1f1a] px-5 pt-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-xl font-bold">Showing Details</Text>
            <Text className="text-[#8a9e98] text-sm">Review before applying.</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#8a9e98" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-[#1a2e28] rounded-2xl p-4 mb-4 border border-[#2a3f38]">
            <Text className="text-white font-bold mb-1">{request.address}</Text>
            <Text className="text-[#8a9e98] text-sm">{request.city}, {request.state} {request.zip}</Text>
            <View className="flex-row mt-3 gap-6">
              <View>
                <Text className="text-[#4a6058] text-xs">Schedule</Text>
                <Text className="text-white text-sm font-semibold">{request.date}</Text>
                <Text className="text-white text-sm">{request.start_time}–{request.end_time}</Text>
              </View>
              <View>
                <Text className="text-[#4a6058] text-xs">Compensation</Text>
                <Text className="text-[#c9a96e] text-xl font-extrabold">${request.compensation}</Text>
              </View>
            </View>
          </View>

          {request.mls_number && (
            <View className="mb-4">
              <Text className="text-[#8a9e98] text-xs font-semibold mb-1 tracking-wide">MLS NUMBER</Text>
              <Text className="text-white">{request.mls_number}</Text>
            </View>
          )}
          {request.access_notes && (
            <View className="mb-4">
              <Text className="text-[#8a9e98] text-xs font-semibold mb-1 tracking-wide">ACCESS NOTES</Text>
              <View className="bg-[#1a2e28] rounded-xl p-3 border border-[#2a3f38]">
                <Text className="text-white text-sm">{request.access_notes}</Text>
              </View>
            </View>
          )}
          {request.additional_notes && (
            <View className="mb-6">
              <Text className="text-[#8a9e98] text-xs font-semibold mb-1 tracking-wide">ADDITIONAL NOTES</Text>
              <View className="bg-[#1a2e28] rounded-xl p-3 border border-[#2a3f38]">
                <Text className="text-white text-sm">{request.additional_notes}</Text>
              </View>
            </View>
          )}

          <View className="flex-row gap-3 pb-8">
            <TouchableOpacity
              className="flex-1 bg-[#1a2e28] rounded-2xl py-4 items-center border border-[#2a3f38]"
              onPress={onClose}
            >
              <Text className="text-[#8a9e98] font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-600 rounded-2xl py-4 items-center"
              onPress={onApply}
              disabled={applying}
            >
              {applying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Confirm & Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function OpportunitiesScreen() {
  const { user } = useCurrentUser();
  const { requests, loading, updateRequestStatus, refresh } = useRequests();
  const [filter, setFilter] = useState<ServiceType | 'All'>('All');
  const [selected, setSelected] = useState<Request | null>(null);
  const [applying, setApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pending = requests.filter(
    (r) =>
      r.status === 'PENDING' &&
      (filter === 'All' || r.service_type === filter)
  );

  const handleApply = async () => {
    if (!selected || !user) return;
    try {
      setApplying(true);
      await updateRequestStatus(selected.id, 'ACTIVE', user.id);
      setSelected(null);
      setSuccessMsg('Applied! Job moved to Active.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setSuccessMsg(e.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#162820]">
      <StatusBar style="light" backgroundColor="#162820" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">Opportunities</Text>
        <TouchableOpacity onPress={refresh}>
          <Ionicons name="refresh" size={20} color="#8a9e98" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row px-4 pb-3 gap-2">
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              className={`px-4 py-1.5 rounded-full ${filter === f.value ? 'bg-green-600' : 'bg-[#1a2e28]'}`}
              onPress={() => setFilter(f.value)}
            >
              <Text className={`text-xs font-semibold ${filter === f.value ? 'text-white' : 'text-[#8a9e98]'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {successMsg && (
        <View className="mx-4 mt-3 bg-green-100 border border-green-300 rounded-xl px-4 py-3">
          <Text className="text-green-700 text-sm">{successMsg}</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c9a96e" size="large" />
        </View>
      ) : pending.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="briefcase-outline" size={52} color="#c5d5d0" />
          <Text className="text-[#0f2820] font-bold text-lg mt-4 text-center">No opportunities right now.</Text>
          <Text className="text-[#6b7f79] text-sm text-center mt-1">Check back soon for new jobs.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* 2-column grid */}
          {Array.from({ length: Math.ceil(pending.length / 2) }).map((_, rowIdx) => (
            <View key={rowIdx} className="flex-row gap-3 mb-3">
              {pending.slice(rowIdx * 2, rowIdx * 2 + 2).map((r) => (
                <OpportunityCard key={r.id} request={r} onPress={() => setSelected(r)} />
              ))}
              {/* Fill empty slot if odd number */}
              {rowIdx * 2 + 1 >= pending.length && <View className="flex-1" />}
            </View>
          ))}
          <View className="h-6" />
        </ScrollView>
      )}

      <DetailModal
        request={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onApply={handleApply}
        applying={applying}
      />
    </SafeAreaView>
  );
}
