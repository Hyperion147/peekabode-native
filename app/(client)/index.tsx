import { useCurrentUser, useSignOut } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useSupportRequest } from '@/hooks/useSupportRequest';
import type { Request, ServiceType } from '@/lib/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-orange-500',
    ACTIVE: 'bg-blue-500',
    COMPLETED: 'bg-green-500',
    CANCELLED: 'bg-gray-500',
  };
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${map[status] ?? 'bg-gray-500'}`}>
      <Text className="text-white text-[10px] font-bold">{status}</Text>
    </View>
  );
}

// ─── Service icon helper ──────────────────────────────────────────────────────
function serviceIcon(type: string, size = 18, color = '#c9a96e') {
  const map: Record<string, string> = {
    Showing: 'home',
    'Open House': 'home-outline',
    'Lockbox Drop': 'key',
    Photography: 'camera',
    'Property Report': 'document-text',
  };
  return <Ionicons name={(map[type] ?? 'home') as any} size={size} color={color} />;
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  request,
  onAccept,
  onDecline,
}: {
  request: Request;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View className="bg-[#1a2e28] rounded-2xl p-4 mb-3 border border-[#2a3f38]">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {serviceIcon(request.service_type)}
          <Text className="text-white font-bold text-sm">{request.service_type}</Text>
        </View>
        <Text className="text-[#c9a96e] font-bold">${request.compensation}</Text>
      </View>
      <Text className="text-[#8a9e98] text-sm mb-0.5">{request.address}</Text>
      <Text className="text-[#8a9e98] text-xs mb-3">
        {request.city}, {request.state} · {request.date} · {request.start_time}–{request.end_time}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-green-600 rounded-xl py-2.5 items-center"
          onPress={onAccept}
        >
          <Text className="text-white text-sm font-bold">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#2a3f38] rounded-xl py-2.5 items-center"
          onPress={onDecline}
        >
          <Text className="text-[#8a9e98] text-sm font-bold">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Support Modal ────────────────────────────────────────────────────────────
function SupportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { submitSupportRequest, loading } = useSupportRequest();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    try {
      setError(null);
      await submitSupportRequest(subject, message);
      setSent(true);
      setTimeout(() => { setSent(false); setSubject(''); setMessage(''); onClose(); }, 1500);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-[#0f1f1a] px-5 pt-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-xl font-bold">Contact Support</Text>
            <Text className="text-[#8a9e98] text-sm">Let us know what you need help with.</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#8a9e98" />
          </TouchableOpacity>
        </View>

        {error && (
          <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        )}
        {sent && (
          <View className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-3 mb-4">
            <Text className="text-green-400 text-sm">Request sent!</Text>
          </View>
        )}

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">SUBJECT *</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-4 border border-[#2a3f38]"
          placeholder="e.g. Booking issue"
          placeholderTextColor="#4a6058"
          value={subject}
          onChangeText={setSubject}
        />

        <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">MESSAGE *</Text>
        <TextInput
          className="bg-[#1a2e28] text-white rounded-xl px-4 py-3.5 mb-6 border border-[#2a3f38]"
          placeholder="Describe your issue..."
          placeholderTextColor="#4a6058"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={{ minHeight: 120 }}
        />

        <TouchableOpacity
          className="bg-[#c9a96e] rounded-2xl py-4 items-center"
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text className="text-white font-bold text-base">Send Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type DashboardTab = 'feed' | 'pending' | 'active' | 'history';

const QUICK_ACTIONS: { icon: string; label: string; type: ServiceType }[] = [
  { icon: 'home', label: 'Showing', type: 'Showing' },
  { icon: 'home-outline', label: 'Open House', type: 'Open House' },
  { icon: 'key', label: 'Lockbox', type: 'Lockbox Drop' },
  { icon: 'camera', label: 'Photos', type: 'Photography' },
  { icon: 'document-text', label: 'Report', type: 'Property Report' },
];

export default function ClientDashboard() {
  const router = useRouter();
  const { profile } = useCurrentUser();
  const { signOut } = useSignOut();
  const { requests, loading, updateRequestStatus, refresh } = useRequests();
  const [activeTab, setActiveTab] = useState<DashboardTab>('feed');
  const [supportOpen, setSupportOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const activeRequests = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'ACTIVE'
  );
  const upcoming = requests.filter(
    (r) => (r.status === 'PENDING' || r.status === 'ACTIVE') && r.date >= today
  );
  const pending = requests.filter((r) => r.status === 'PENDING');
  const active = requests.filter((r) => r.status === 'ACTIVE');
  const completed = requests.filter((r) => r.status === 'COMPLETED');

  const tabData: Record<DashboardTab, Request[]> = {
    feed: pending,
    pending,
    active,
    history: requests.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED'),
  };

  const handleAccept = async (id: string) => {
    try {
      const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
      await updateRequestStatus(id, 'ACTIVE', user?.id);
      setSuccessMsg('Job accepted!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e: any) {
      setSuccessMsg(e.message);
    }
  };

  const handleDecline = async (id: string) => {
    await updateRequestStatus(id, 'CANCELLED');
    setSuccessMsg('Job declined.');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-green-500 items-center justify-center">
            <Ionicons name="home" size={16} color="#fff" />
          </View>
          <Text className="text-white font-bold text-base">PeekAbode</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Text className="text-[#8a9e98] text-sm">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-white text-2xl font-extrabold">
            Welcome back 👋
          </Text>
          <Text className="text-[#8a9e98] text-sm mt-1">
            {profile?.full_name ?? 'Here\'s what\'s happening...'}
          </Text>
        </View>

        {successMsg && (
          <View className="mx-5 mb-3 bg-green-900/40 border border-green-700 rounded-xl px-4 py-3">
            <Text className="text-green-400 text-sm">{successMsg}</Text>
          </View>
        )}

        {/* Stat cards 2×2 */}
        <View className="px-5 flex-row flex-wrap gap-3 mb-5">
          {[
            { label: 'Active Requests', value: activeRequests.length, color: 'bg-blue-900/50', icon: 'flash', route: '/(client)/bookings/index' },
            { label: 'Upcoming', value: upcoming.length, color: 'bg-green-900/50', icon: 'calendar', route: '/(client)/bookings/index' },
            { label: 'Opportunities', value: requests.length, color: 'bg-purple-900/50', icon: 'briefcase', route: '/(client)/opportunities/index' },
            { label: 'Total Earned', value: '$0.00', color: 'bg-yellow-900/50', icon: 'cash', route: null },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              className={`flex-1 min-w-[44%] ${s.color} rounded-2xl p-4 border border-[#2a3f38]`}
              onPress={() => s.route && router.push(s.route as any)}
            >
              <Ionicons name={s.icon as any} size={20} color="#c9a96e" />
              <Text className="text-white text-2xl font-extrabold mt-2">{s.value}</Text>
              <Text className="text-[#8a9e98] text-xs mt-0.5">{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-5">
          <Text className="text-white font-bold text-base px-5 mb-3">Quick Actions</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_ACTIONS}
            keyExtractor={(item) => item.type}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-[#1a2e28] rounded-2xl p-4 items-center border border-[#2a3f38] w-24"
                onPress={() => router.push({ pathname: '/(client)/new-request/index' as any, params: { type: item.type } })}
              >
                <View className="w-10 h-10 rounded-xl bg-[#0f1f1a] items-center justify-center mb-2">
                  <Ionicons name={item.icon as any} size={20} color="#c9a96e" />
                </View>
                <Text className="text-white text-xs font-semibold text-center">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Agent Dashboard */}
        <View className="px-5 mb-3">
          <Text className="text-white font-bold text-base mb-3">Agent Dashboard</Text>

          {/* Mini stats */}
          <View className="bg-[#1a2e28] rounded-2xl p-4 flex-row justify-between mb-4 border border-[#2a3f38]">
            {[
              { label: 'Pending', value: pending.length, color: 'text-orange-400' },
              { label: 'Active', value: active.length, color: 'text-blue-400' },
              { label: 'Done', value: completed.length, color: 'text-green-400' },
            ].map((s) => (
              <View key={s.label} className="items-center flex-1">
                <Text className={`text-xl font-extrabold ${s.color}`}>{s.value}</Text>
                <Text className="text-[#8a9e98] text-xs mt-0.5">{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Tab pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {([
                { key: 'feed', label: 'Jobs Feed' },
                { key: 'pending', label: 'Pending' },
                { key: 'active', label: 'Active' },
                { key: 'history', label: 'History' },
              ] as { key: DashboardTab; label: string }[]).map((t) => (
                <TouchableOpacity
                  key={t.key}
                  className={`px-4 py-2 rounded-full border ${
                    activeTab === t.key
                      ? 'bg-green-600 border-green-600'
                      : 'bg-transparent border-[#2a3f38]'
                  }`}
                  onPress={() => setActiveTab(t.key)}
                >
                  <Text className={`text-sm font-semibold ${activeTab === t.key ? 'text-white' : 'text-[#8a9e98]'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Job list */}
          {loading ? (
            <ActivityIndicator color="#c9a96e" className="py-8" />
          ) : tabData[activeTab].length === 0 ? (
            <View className="items-center py-10">
              <MaterialCommunityIcons name="briefcase-outline" size={40} color="#2a3f38" />
              <Text className="text-[#4a6058] text-sm mt-3">No jobs here yet.</Text>
            </View>
          ) : (
            tabData[activeTab].map((r) => (
              <JobCard
                key={r.id}
                request={r}
                onAccept={() => handleAccept(r.id)}
                onDecline={() => handleDecline(r.id)}
              />
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Support FAB */}
      <TouchableOpacity
        className="absolute bottom-20 right-5 bg-[#c9a96e] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => setSupportOpen(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>

      <SupportModal visible={supportOpen} onClose={() => setSupportOpen(false)} />
    </SafeAreaView>
  );
}
