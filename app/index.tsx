import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      <StatusBar barStyle="light-content" backgroundColor="#0f1f1a" />

      <View className="flex-1 px-6 justify-between py-10">

        {/* Logo */}
        <View className="items-center mt-8">
          <View className="w-20 h-20 rounded-3xl bg-green-500 items-center justify-center mb-5">
            <Ionicons name="home" size={40} color="#fff" />
          </View>
          <Text className="text-white text-4xl font-extrabold tracking-tight">PeekAbode</Text>
          <Text className="text-[#8a9e98] text-base mt-2 text-center">
            On-demand showing agent platform
          </Text>
        </View>

        {/* Feature pills */}
        <View className="gap-3">
          {[
            { icon: 'flash', label: 'Agents matched in under 3 minutes' },
            { icon: 'shield-checkmark', label: 'Licensed & verified professionals' },
            { icon: 'calendar', label: 'Available 7 days a week' },
            { icon: 'cash', label: 'Keep your full commission' },
          ].map((f) => (
            <View
              key={f.label}
              className="flex-row items-center gap-3 bg-[#1a2e28] rounded-2xl px-4 py-3.5 border border-[#2a3f38]"
            >
              <View className="w-8 h-8 rounded-xl bg-[#0f1f1a] items-center justify-center">
                <Ionicons name={f.icon as any} size={16} color="#22c55e" />
              </View>
              <Text className="text-[#c8ddd8] text-sm font-medium flex-1">{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View className="gap-3">
          <TouchableOpacity
            className="bg-[#c9a96e] rounded-2xl py-4 items-center"
            onPress={() => router.push('/(auth)/signup' as any)}
          >
            <Text className="text-white text-base font-bold">Get Started Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#1a2e28] border border-[#2a3f38] rounded-2xl py-4 items-center"
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text className="text-white text-base font-semibold">Sign In</Text>
          </TouchableOpacity>

          <Text className="text-[#4a6058] text-xs text-center mt-1">
            No contracts · No monthly fees · Pay per showing
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}
