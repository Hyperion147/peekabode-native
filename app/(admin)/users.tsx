import { useUsers } from '@/hooks/useUsers';
import type { AppUser, UserRole } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

const ROLE_COLORS: Record<UserRole, string> = {
  USER: 'bg-blue-500',
  AGENT: 'bg-purple-500',
  ADMIN: 'bg-orange-500',
  SUPERADMIN: 'bg-red-500',
};

function UserRow({
  user,
  onDisable,
  onDelete,
  onRoleChange,
}: {
  user: AppUser;
  onDisable: () => void;
  onDelete: () => void;
  onRoleChange: (role: UserRole) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const roles: UserRole[] = ['USER', 'AGENT', 'ADMIN', 'SUPERADMIN'];

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-sm overflow-hidden">
      <TouchableOpacity
        className="px-4 py-4 flex-row items-center gap-3"
        onPress={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full bg-teal-600 items-center justify-center">
          <Text className="text-white font-bold text-sm">
            {(user.full_name ?? 'U').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[#0f2820] font-bold text-sm">{user.full_name}</Text>
          <Text className="text-[#6b7f79] text-xs">{user.email}</Text>
        </View>
        <View className="items-end gap-1">
          <View className={`px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
            <Text className="text-white text-[10px] font-bold">{user.role}</Text>
          </View>
          <View className={`px-2 py-0.5 rounded-full ${user.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-[10px] font-semibold ${user.status === 'Active' ? 'text-green-700' : 'text-gray-500'}`}>
              {user.status ?? 'Active'}
            </Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-gray-100">
          <Text className="text-[#6b7f79] text-xs mt-3 mb-2">
            Last seen: {user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'Never'}
          </Text>

          {/* Role selector */}
          <Text className="text-[#6b7f79] text-xs font-semibold mb-2 tracking-wide">CHANGE ROLE</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {roles.map((r) => (
              <TouchableOpacity
                key={r}
                className={`px-3 py-1.5 rounded-full border ${user.role === r ? 'bg-[#0f2820] border-[#0f2820]' : 'bg-gray-100 border-gray-200'}`}
                onPress={() => onRoleChange(r)}
              >
                <Text className={`text-xs font-semibold ${user.role === r ? 'text-white' : 'text-[#6b7f79]'}`}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-orange-100 rounded-xl py-2.5 items-center"
              onPress={onDisable}
            >
              <Text className="text-orange-600 text-xs font-bold">
                {user.status === 'Disabled' ? 'Enable' : 'Disable'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-100 rounded-xl py-2.5 items-center"
              onPress={onDelete}
            >
              <Text className="text-red-600 text-xs font-bold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function AdminUsersScreen() {
  const { users, loading, refresh, updateUser, deleteUser } = useUsers();
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDisable = async (user: AppUser) => {
    const newStatus = user.status === 'Disabled' ? 'Active' : 'Disabled';
    await updateUser(user.id, { status: newStatus });
  };

  const handleDelete = (user: AppUser) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.full_name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleRoleChange = async (user: AppUser, role: UserRole) => {
    await updateUser(user.id, { role });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f0f4f3]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">Users ({users.length})</Text>
        <TouchableOpacity onPress={refresh}>
          <Ionicons name="refresh" size={20} color="#8a9e98" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <View className="flex-row items-center bg-[#1a2e28] rounded-xl px-3 gap-2 border border-[#2a3f38]">
          <Ionicons name="search" size={16} color="#4a6058" />
          <TextInput
            className="flex-1 text-white py-2.5 text-sm"
            placeholder="Search by name or email..."
            placeholderTextColor="#4a6058"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#c9a96e" size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="people-outline" size={48} color="#c5d5d0" />
              <Text className="text-[#6b7f79] text-sm mt-3">No users found.</Text>
            </View>
          ) : (
            filtered.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                onDisable={() => handleDisable(u)}
                onDelete={() => handleDelete(u)}
                onRoleChange={(role) => handleRoleChange(u, role)}
              />
            ))
          )}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
