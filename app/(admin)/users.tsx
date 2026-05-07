import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/lib/supabase';
import type { AppUser, UserRole } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
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

const ALL_ROLES: UserRole[] = ['USER', 'AGENT', 'ADMIN', 'SUPERADMIN'];

// ─── Add User Dialog ──────────────────────────────────────────────────────────
function AddUserDialog({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DIALOG_ROLES: { label: string; value: UserRole }[] = [
    { label: 'User', value: 'USER' },
    { label: 'Agent', value: 'AGENT' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  const reset = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), role } },
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          role,
        });
        if (insertError) throw insertError;
      }

      reset();
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Backdrop */}
      <TouchableOpacity
        className="flex-1 bg-black/60 justify-center px-5"
        activeOpacity={1}
        onPress={handleClose}
      >
        {/* Card — stop propagation so tapping inside doesn't close */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-white rounded-3xl overflow-hidden">
            {/* Dialog header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <View>
                <Text className="text-[#0f2820] text-lg font-bold">Add User</Text>
                <Text className="text-[#6b7f79] text-xs mt-0.5">Create a new platform account</Text>
              </View>
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                onPress={handleClose}
              >
                <Ionicons name="close" size={16} color="#6b7f79" />
              </TouchableOpacity>
            </View>

            <View className="px-5 py-4">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                  <Text className="text-red-500 text-xs">{error}</Text>
                </View>
              )}

              {/* Full Name */}
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest mb-1.5">
                FULL NAME
              </Text>
              <TextInput
                className="bg-[#f8fafb] border border-[#e2eae7] rounded-xl px-3.5 py-3 text-[#0f2820] text-sm mb-3"
                placeholder="Jane Smith"
                placeholderTextColor="#b0c4bc"
                value={fullName}
                onChangeText={setFullName}
              />

              {/* Email */}
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest mb-1.5">
                EMAIL
              </Text>
              <TextInput
                className="bg-[#f8fafb] border border-[#e2eae7] rounded-xl px-3.5 py-3 text-[#0f2820] text-sm mb-3"
                placeholder="jane@example.com"
                placeholderTextColor="#b0c4bc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password */}
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest mb-1.5">
                TEMP PASSWORD
              </Text>
              <TextInput
                className="bg-[#f8fafb] border border-[#e2eae7] rounded-xl px-3.5 py-3 text-[#0f2820] text-sm mb-3"
                placeholder="Min. 6 characters"
                placeholderTextColor="#b0c4bc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Role pills */}
              <Text className="text-[#0f2820] text-xs font-bold tracking-widest mb-2">ROLE</Text>
              <View className="flex-row gap-2 mb-5">
                {DIALOG_ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    className={`flex-1 py-2 rounded-xl border items-center ${
                      role === r.value
                        ? 'bg-[#0f2820] border-[#0f2820]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => setRole(r.value)}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        role === r.value ? 'text-white' : 'text-[#6b7f79]'
                      }`}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text className="text-[#6b7f79] text-sm font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-[#0f2820] rounded-xl py-3 items-center"
                  onPress={handleCreate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white text-sm font-bold">Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────
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

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-sm overflow-hidden">
      <TouchableOpacity
        className="px-4 py-4 flex-row items-center gap-3"
        onPress={() => setExpanded(!expanded)}
      >
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
          <View
            className={`px-2 py-0.5 rounded-full ${
              user.status === 'Disabled' ? 'bg-gray-100' : 'bg-green-100'
            }`}
          >
            <Text
              className={`text-[10px] font-semibold ${
                user.status === 'Disabled' ? 'text-gray-500' : 'text-green-700'
              }`}
            >
              {user.status ?? 'Active'}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#9ca3af"
        />
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-gray-100">
          <Text className="text-[#6b7f79] text-xs mt-3 mb-3">
            Last seen:{' '}
            {user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'Never'}
          </Text>

          <Text className="text-[#6b7f79] text-xs font-semibold mb-2 tracking-wide">
            CHANGE ROLE
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {ALL_ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                className={`px-3 py-1.5 rounded-full border ${
                  user.role === r
                    ? 'bg-[#0f2820] border-[#0f2820]'
                    : 'bg-gray-100 border-gray-200'
                }`}
                onPress={() => onRoleChange(r)}
              >
                <Text
                  className={`text-xs font-semibold ${
                    user.role === r ? 'text-white' : 'text-[#6b7f79]'
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AdminUsersScreen() {
  const { users, loading, refresh, updateUser, deleteUser } = useUsers();
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
    <SafeAreaView className="flex-1 bg-[#162820]">
      <StatusBar style="light" backgroundColor="#162820" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <Text className="text-white font-bold text-lg">Users ({users.length})</Text>
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-[#c9a96e] rounded-xl px-3.5 py-2"
          onPress={() => setAddDialogOpen(true)}
        >
          <Ionicons name="person-add-outline" size={15} color="#fff" />
          <Text className="text-white text-xs font-bold">Add User</Text>
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
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#4a6058" />
            </TouchableOpacity>
          )}
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
              <Text className="text-[#6b7f79] text-sm mt-3">
                {search ? 'No users match your search.' : 'No users yet.'}
              </Text>
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

      <AddUserDialog
        visible={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={refresh}
      />
    </SafeAreaView>
  );
}
