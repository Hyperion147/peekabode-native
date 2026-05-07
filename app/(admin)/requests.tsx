import { useRequests } from '@/hooks/useRequests';
import type { Request, RequestStatus, ServiceType } from '@/lib/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
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

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_META: Record<
  RequestStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  PENDING:   { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Pending' },
  ACTIVE:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Active' },
  COMPLETED: { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Completed' },
  CANCELLED: { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Cancelled' },
};

const SERVICE_ICONS: Record<ServiceType, { name: string; bg: string; color: string }> = {
  'Showing':         { name: 'home',              bg: 'bg-orange-100', color: '#ea580c' },
  'Open House':      { name: 'home-outline',       bg: 'bg-amber-100',  color: '#d97706' },
  'Lockbox Drop':    { name: 'key',                bg: 'bg-yellow-100', color: '#ca8a04' },
  'Photography':     { name: 'camera',             bg: 'bg-purple-100', color: '#9333ea' },
  'Property Report': { name: 'document-text',      bg: 'bg-blue-100',   color: '#2563eb' },
};

const STATUS_FILTERS: (RequestStatus | 'ALL')[] = [
  'ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED',
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RequestStatus }) {
  const m = STATUS_META[status];
  return (
    <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${m.bg}`}>
      <View className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      <Text className={`text-[10px] font-bold ${m.text}`}>{m.label}</Text>
    </View>
  );
}

// ─── Summary bar ─────────────────────────────────────────────────────────────
function SummaryBar({ requests }: { requests: Request[] }) {
  const counts = {
    PENDING:   requests.filter((r) => r.status === 'PENDING').length,
    ACTIVE:    requests.filter((r) => r.status === 'ACTIVE').length,
    COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
    CANCELLED: requests.filter((r) => r.status === 'CANCELLED').length,
  };
  const totalEarnings = requests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + parseFloat(r.compensation || '0'), 0);

  return (
    <View className="mx-4 mt-4 mb-2 bg-[#1a2e28] rounded-2xl border border-[#2a3f38] overflow-hidden">
      <View className="flex-row">
        {(Object.entries(counts) as [RequestStatus, number][]).map(([status, count], i) => {
          const m = STATUS_META[status];
          return (
            <View
              key={status}
              className={`flex-1 items-center py-3 ${i < 3 ? 'border-r border-[#2a3f38]' : ''}`}
            >
              <Text className={`text-lg font-extrabold ${m.text.replace('text-', 'text-').replace('700', '400').replace('500', '300')}`}>
                {count}
              </Text>
              <Text className="text-[#4a6058] text-[9px] font-semibold mt-0.5 tracking-wide">
                {m.label.toUpperCase()}
              </Text>
            </View>
          );
        })}
      </View>
      <View className="border-t border-[#2a3f38] px-4 py-2.5 flex-row items-center justify-between">
        <Text className="text-[#4a6058] text-xs">Total completed earnings</Text>
        <Text className="text-[#c9a96e] text-sm font-bold">${totalEarnings.toFixed(0)}</Text>
      </View>
    </View>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({
  request,
  onStatusChange,
}: {
  request: Request;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const statuses: RequestStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
  const svc = SERVICE_ICONS[request.service_type] ?? SERVICE_ICONS['Showing'];

  return (
    <View className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm">
      {/* Main row */}
      <TouchableOpacity
        className="px-4 pt-4 pb-3"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-start gap-3">
          {/* Service icon */}
          <View className={`w-11 h-11 rounded-xl items-center justify-center ${svc.bg}`}>
            <Ionicons name={svc.name as any} size={20} color={svc.color} />
          </View>

          {/* Info */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[#0f2820] font-bold text-sm">{request.service_type}</Text>
              <StatusBadge status={request.status} />
            </View>
            <Text className="text-[#0f2820] text-xs font-medium" numberOfLines={1}>
              {request.address}
            </Text>
            <Text className="text-[#6b7f79] text-xs">
              {request.city}, {request.state} {request.zip}
            </Text>
          </View>
        </View>

        {/* Meta row */}
        <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-gray-50">
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
            <Text className="text-[#6b7f79] text-xs">{request.date}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#9ca3af" />
            <Text className="text-[#6b7f79] text-xs">
              {request.start_time} – {request.end_time}
            </Text>
          </View>
          <View className="flex-row items-center gap-1 ml-auto">
            <Ionicons name="cash-outline" size={12} color="#c9a96e" />
            <Text className="text-[#c9a96e] text-xs font-bold">${request.compensation}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#9ca3af"
          />
        </View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {expanded && (
        <View className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          {/* Detail rows */}
          {[
            request.client_name && { label: 'Client', value: request.client_name },
            request.client_phone && { label: 'Phone', value: request.client_phone },
            request.mls_number && { label: 'MLS #', value: request.mls_number },
            request.access_notes && { label: 'Access', value: request.access_notes },
            request.lockbox_code && { label: 'Lockbox', value: request.lockbox_code },
            request.additional_notes && { label: 'Notes', value: request.additional_notes },
          ]
            .filter(Boolean)
            .map((row: any) => (
              <View key={row.label} className="flex-row gap-2 mb-1.5">
                <Text className="text-[#9ca3af] text-xs w-14">{row.label}</Text>
                <Text className="text-[#0f2820] text-xs flex-1 font-medium">{row.value}</Text>
              </View>
            ))}

          {/* Status changer */}
          <View className="mt-3">
            <TouchableOpacity
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-2.5"
              onPress={() => setStatusOpen(!statusOpen)}
            >
              <Text className="text-[#0f2820] text-xs font-semibold">
                Change status: <Text className="text-green-600">{request.status}</Text>
              </Text>
              <Ionicons
                name={statusOpen ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#6b7f79"
              />
            </TouchableOpacity>

            {statusOpen && (
              <View className="mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
                {statuses.map((s, i) => (
                  <TouchableOpacity
                    key={s}
                    className={`flex-row items-center gap-2.5 px-4 py-3 ${
                      i < statuses.length - 1 ? 'border-b border-gray-100' : ''
                    } ${request.status === s ? 'bg-green-50' : ''}`}
                    onPress={() => {
                      onStatusChange(request.id, s);
                      setStatusOpen(false);
                      setExpanded(false);
                    }}
                  >
                    <View className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
                    <Text
                      className={`text-sm font-semibold ${
                        request.status === s ? 'text-green-600' : 'text-[#0f2820]'
                      }`}
                    >
                      {STATUS_META[s].label}
                    </Text>
                    {request.status === s && (
                      <Ionicons name="checkmark" size={14} color="#16a34a" className="ml-auto" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
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
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      (r.client_name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#162820]">
      <StatusBar style="light" backgroundColor="#162820" />
      {/* Header */}
      <View className="bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row items-center justify-between px-5 py-3">
          <View>
            <Text className="text-white font-bold text-lg">Requests</Text>
            <Text className="text-[#4a6058] text-xs">{requests.length} total</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-[#1a2e28] border border-[#2a3f38] rounded-xl px-3 py-2"
            onPress={refresh}
          >
            <Ionicons name="refresh" size={14} color="#8a9e98" />
            <Text className="text-[#8a9e98] text-xs font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-[#1a2e28] rounded-xl px-3 gap-2 border border-[#2a3f38]">
            <Ionicons name="search" size={15} color="#4a6058" />
            <TextInput
              className="flex-1 text-white py-2.5 text-sm"
              placeholder="Search address, service, client..."
              placeholderTextColor="#4a6058"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={15} color="#4a6058" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pb-3"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s;
            const meta = s !== 'ALL' ? STATUS_META[s as RequestStatus] : null;
            const count =
              s === 'ALL'
                ? requests.length
                : requests.filter((r) => r.status === s).length;
            return (
              <TouchableOpacity
                key={s}
                className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border ${
                  active
                    ? 'bg-green-600 border-green-600'
                    : 'bg-[#1a2e28] border-[#2a3f38]'
                }`}
                onPress={() => setStatusFilter(s)}
              >
                {meta && !active && (
                  <View className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                )}
                <Text
                  className={`text-xs font-semibold ${active ? 'text-white' : 'text-[#8a9e98]'}`}
                >
                  {s === 'ALL' ? 'All' : STATUS_META[s as RequestStatus].label}
                </Text>
                <View
                  className={`px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-green-700' : 'bg-[#0f1f1a]'
                  }`}
                >
                  <Text className="text-[9px] font-bold text-white">{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c9a96e" size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Summary bar */}
          <SummaryBar requests={requests} />

          {/* Results label */}
          <View className="px-4 py-2 flex-row items-center justify-between">
            <Text className="text-[#6b7f79] text-xs">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              {search ? ` for "${search}"` : ''}
            </Text>
            {search || statusFilter !== 'ALL' ? (
              <TouchableOpacity
                onPress={() => { setSearch(''); setStatusFilter('ALL'); }}
              >
                <Text className="text-green-600 text-xs font-semibold">Clear filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Cards */}
          <View className="px-4">
            {filtered.length === 0 ? (
              <View className="items-center py-16">
                <MaterialCommunityIcons
                  name="clipboard-search-outline"
                  size={52}
                  color="#c5d5d0"
                />
                <Text className="text-[#0f2820] font-bold text-base mt-4">
                  No requests found
                </Text>
                <Text className="text-[#6b7f79] text-sm mt-1 text-center">
                  Try adjusting your search or filters.
                </Text>
              </View>
            ) : (
              filtered.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  onStatusChange={updateRequestStatus}
                />
              ))
            )}
          </View>

          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
