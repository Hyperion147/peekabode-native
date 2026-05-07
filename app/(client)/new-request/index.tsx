import { useNewRequest } from '@/hooks/useNewRequest';
import type { RequestFormData, ServiceType } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Slider,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Service options ──────────────────────────────────────────────────────────
const SERVICES: {
  type: ServiceType;
  icon: string;
  iconLib: 'ionicons' | 'mci';
  price: string;
  min: number;
  max: number;
}[] = [
  { type: 'Showing', icon: 'home', iconLib: 'ionicons', price: '$35–$150', min: 35, max: 150 },
  { type: 'Open House', icon: 'home-outline', iconLib: 'ionicons', price: '$75–$300', min: 75, max: 300 },
  { type: 'Lockbox Drop', icon: 'key', iconLib: 'ionicons', price: '$25–$60', min: 25, max: 60 },
  { type: 'Photography', icon: 'camera', iconLib: 'ionicons', price: '$50–$200', min: 50, max: 200 },
  { type: 'Property Report', icon: 'document-text', iconLib: 'ionicons', price: '$40–$120', min: 40, max: 120 },
];

const STEPS = ['Service', 'Property', 'Schedule', 'Review'];

const EMPTY_FORM: RequestFormData = {
  address: '', city: '', state: '', zip: '',
  mlsNumber: '', clientName: '', clientPhone: '',
  accessNotes: '', lockboxCode: '', additionalNotes: '',
  date: '', startTime: '09:00 AM', endTime: '10:00 AM',
};

function FormField({
  label, value, onChange, placeholder, required, keyboardType, multiline, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; keyboardType?: any;
  multiline?: boolean; disabled?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-[#8a9e98] text-xs font-semibold mb-1.5 tracking-wide">
        {label}{required && ' *'}
      </Text>
      <TextInput
        className={`rounded-xl px-4 py-3.5 border text-base text-white ${
          disabled ? 'bg-[#0f1f1a] border-[#1a2e28]' : 'bg-[#1a2e28] border-[#2a3f38]'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#4a6058"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={!disabled}
      />
    </View>
  );
}

export default function NewRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { submitRequest, loading } = useNewRequest();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    (params.type as ServiceType) ?? null
  );
  const [compensation, setCompensation] = useState(65);
  const [formData, setFormData] = useState<RequestFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<RequestFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentService = SERVICES.find((s) => s.type === selectedService);

  useEffect(() => {
    if (currentService) {
      setCompensation(Math.round((currentService.min + currentService.max) / 2));
    }
  }, [selectedService]);

  const setField = (key: keyof RequestFormData) => (val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep2 = () => {
    const e: Partial<RequestFormData> = {};
    if (!formData.address.trim()) e.address = 'Required';
    if (!formData.city.trim()) e.city = 'Required';
    if (!formData.state.trim()) e.state = 'Required';
    if (!formData.zip.trim() || !/^\d{5}$/.test(formData.zip)) e.zip = '5 digits required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Partial<RequestFormData> = {};
    if (!formData.date.trim()) e.date = 'Required';
    if (!formData.startTime.trim()) e.startTime = 'Required';
    if (!formData.endTime.trim()) e.endTime = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!selectedService) return;
    try {
      setSubmitError(null);
      await submitRequest(selectedService, compensation, formData);
      router.replace('/(client)/bookings/index' as any);
    } catch (e: any) {
      setSubmitError(e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 bg-[#162820] border-b border-[#2a3f38]">
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#8a9e98" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-base flex-1">New Showing Request</Text>
      </View>

      {/* Step indicator */}
      <View className="flex-row items-center px-5 py-4 bg-[#162820]">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <View key={label} className="flex-row items-center flex-1">
              <View className={`w-7 h-7 rounded-full items-center justify-center ${done ? 'bg-green-500' : active ? 'bg-[#c9a96e]' : 'bg-[#2a3f38]'}`}>
                {done ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text className="text-white text-xs font-bold">{n}</Text>
                )}
              </View>
              <Text className={`text-xs ml-1 ${active ? 'text-white font-semibold' : 'text-[#4a6058]'}`}>{label}</Text>
              {i < STEPS.length - 1 && <View className="flex-1 h-px bg-[#2a3f38] mx-2" />}
            </View>
          );
        })}
      </View>

      <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled">
        {/* Step 1 */}
        {step === 1 && (
          <View>
            <Text className="text-white text-xl font-bold mb-1">What service do you need?</Text>
            <Text className="text-[#8a9e98] text-sm mb-5">Select one to continue.</Text>
            <View className="flex-row flex-wrap gap-3">
              {SERVICES.map((s) => (
                <TouchableOpacity
                  key={s.type}
                  className={`w-[47%] rounded-2xl p-4 border ${
                    selectedService === s.type
                      ? 'bg-[#1a3a2a] border-green-500'
                      : 'bg-[#1a2e28] border-[#2a3f38]'
                  }`}
                  onPress={() => setSelectedService(s.type)}
                >
                  <Ionicons name={s.icon as any} size={26} color={selectedService === s.type ? '#22c55e' : '#c9a96e'} />
                  <Text className="text-white font-bold mt-2 mb-0.5">{s.type}</Text>
                  <Text className="text-[#8a9e98] text-xs">{s.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View>
            <Text className="text-white text-xl font-bold mb-5">Property details</Text>
            <FormField label="Street Address" value={formData.address} onChange={setField('address')} required placeholder="123 Main St" />
            {errors.address && <Text className="text-red-400 text-xs -mt-3 mb-3">{errors.address}</Text>}
            <FormField label="City" value={formData.city} onChange={setField('city')} required placeholder="Miami" />
            {errors.city && <Text className="text-red-400 text-xs -mt-3 mb-3">{errors.city}</Text>}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField label="State" value={formData.state} onChange={setField('state')} required placeholder="FL" />
                {errors.state && <Text className="text-red-400 text-xs -mt-3 mb-3">{errors.state}</Text>}
              </View>
              <View className="flex-1">
                <FormField label="ZIP" value={formData.zip} onChange={setField('zip')} required placeholder="33101" keyboardType="numeric" />
                {errors.zip && <Text className="text-red-400 text-xs -mt-3 mb-3">{errors.zip}</Text>}
              </View>
            </View>
            <FormField label="MLS Number" value={formData.mlsNumber} onChange={setField('mlsNumber')} placeholder="Optional" />
            <FormField label="Client Name" value={formData.clientName} onChange={setField('clientName')} placeholder="Optional" />
            <FormField label="Client Phone" value={formData.clientPhone} onChange={setField('clientPhone')} placeholder="Optional" keyboardType="phone-pad" />
            <FormField label="Access Notes" value={formData.accessNotes} onChange={setField('accessNotes')} placeholder="e.g. Lockbox on front door" multiline />
            <FormField label="Lockbox Code" value={formData.lockboxCode} onChange={setField('lockboxCode')} placeholder="Optional" />
            <FormField label="Additional Notes" value={formData.additionalNotes} onChange={setField('additionalNotes')} placeholder="Optional" multiline />
          </View>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <View>
            <Text className="text-white text-xl font-bold mb-5">Schedule & compensation</Text>
            <FormField label="Showing Date" value={formData.date} onChange={setField('date')} required placeholder="YYYY-MM-DD" />
            {errors.date && <Text className="text-red-400 text-xs -mt-3 mb-3">{errors.date}</Text>}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField label="Start Time" value={formData.startTime} onChange={setField('startTime')} required placeholder="09:00 AM" />
              </View>
              <View className="flex-1">
                <FormField label="End Time" value={formData.endTime} onChange={setField('endTime')} required placeholder="10:00 AM" />
              </View>
            </View>
            <Text className="text-[#8a9e98] text-xs font-semibold mb-3 tracking-wide">AGENT COMPENSATION</Text>
            <View className="bg-[#1a2e28] rounded-2xl p-4 border border-[#2a3f38] mb-2">
              <Text className="text-[#c9a96e] text-3xl font-extrabold text-center mb-3">${compensation}</Text>
              <Slider
                minimumValue={currentService?.min ?? 35}
                maximumValue={currentService?.max ?? 150}
                step={5}
                value={compensation}
                onValueChange={(v) => setCompensation(Math.round(v))}
                minimumTrackTintColor="#c9a96e"
                maximumTrackTintColor="#2a3f38"
                thumbTintColor="#c9a96e"
              />
              <View className="flex-row justify-between mt-1">
                <Text className="text-[#4a6058] text-xs">${currentService?.min ?? 35}</Text>
                <Text className="text-[#4a6058] text-xs">${currentService?.max ?? 150}</Text>
              </View>
            </View>
            <Text className="text-[#4a6058] text-xs text-center">Higher fees attract agents faster.</Text>
          </View>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <View>
            <Text className="text-white text-xl font-bold mb-5">Review your request</Text>
            {submitError && (
              <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-400 text-sm">{submitError}</Text>
              </View>
            )}
            <View className="bg-[#1a2e28] rounded-2xl p-5 border border-[#2a3f38] mb-4">
              {[
                { label: 'Service', value: selectedService ?? '' },
                { label: 'Address', value: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}` },
                { label: 'Date', value: formData.date },
                { label: 'Time', value: `${formData.startTime} – ${formData.endTime}` },
                { label: 'Agent Fee', value: `$${compensation}` },
              ].map((row) => (
                <View key={row.label} className="flex-row justify-between py-2.5 border-b border-[#2a3f38] last:border-0">
                  <Text className="text-[#8a9e98] text-sm">{row.label}</Text>
                  <Text className="text-white text-sm font-semibold flex-1 text-right ml-4">{row.value}</Text>
                </View>
              ))}
            </View>
            <View className="bg-[#1a2e28] rounded-xl px-4 py-3 flex-row gap-2 mb-6 border border-[#2a3f38]">
              <Ionicons name="information-circle" size={18} color="#8a9e98" />
              <Text className="text-[#8a9e98] text-xs flex-1">
                Your request will be visible to licensed agents in the area once submitted.
              </Text>
            </View>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Footer buttons */}
      <View className="px-5 py-4 bg-[#162820] border-t border-[#2a3f38] flex-row gap-3">
        {step > 1 && (
          <TouchableOpacity
            className="flex-1 bg-[#1a2e28] rounded-2xl py-4 items-center border border-[#2a3f38]"
            onPress={() => setStep(step - 1)}
          >
            <Text className="text-[#8a9e98] font-bold">Back</Text>
          </TouchableOpacity>
        )}
        {step < 4 ? (
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-4 items-center ${
              (step === 1 && !selectedService) ? 'bg-[#2a3f38]' : 'bg-[#c9a96e]'
            }`}
            onPress={handleNext}
            disabled={step === 1 && !selectedService}
          >
            <Text className="text-white font-bold">Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="flex-1 bg-green-600 rounded-2xl py-4 items-center"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text className="text-white font-bold">Submit Request →</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
