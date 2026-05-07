import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    type ScrollView as ScrollViewType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Section key type ─────────────────────────────────────────────────────────
type SectionKey = 'solutions' | 'services' | 'coverage' | 'howItWorks' | 'faq' | 'docs';
type SectionRefs = Record<SectionKey, React.RefObject<View | null>>;

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ onMenuPress, menuOpen }: { onMenuPress: () => void; menuOpen: boolean }) {
  return (
    <View className="flex-row items-center justify-between bg-[#162820] px-4 py-3 border-b border-[#2a3f38]">
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-lg bg-green-500 items-center justify-center">
          <Ionicons name="home" size={18} color="#fff" />
        </View>
        <Text className="text-white text-lg font-bold">PeekAbode</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="border border-[#3a5248] rounded-full px-4 py-1.5">
          <Text className="text-white text-sm font-semibold">Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-[#3a5248] rounded-lg p-1.5"
          onPress={onMenuPress}
        >
          <Ionicons name={menuOpen ? 'close' : 'menu'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Drawer Menu ──────────────────────────────────────────────────────────────
function DrawerMenu({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (section: SectionKey) => void;
}) {
  const router = useRouter();

  const navItems: { label: string; key: SectionKey }[] = [
    { label: 'Solutions', key: 'solutions' },
    { label: 'Services', key: 'services' },
    { label: 'Coverage', key: 'coverage' },
    { label: 'How It Works', key: 'howItWorks' },
    { label: 'FAQ', key: 'faq' },
    { label: 'Docs', key: 'docs' },
  ];

  return (
    <View className="flex-1 bg-[#0f1f1a]">
      {/* Nav links */}
      <View className="flex-1 items-center justify-center">
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            className="py-4 w-full items-center"
            onPress={() => {
              onNavigate(item.key);
              onClose();
            }}
          >
            <Text className="text-white text-2xl font-bold">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider + bottom actions */}
      <View className="border-t border-[#2a3f38] pb-12">
        <TouchableOpacity
          className="py-5 items-center"
          onPress={() => {
            onClose();
            router.push('/(client)' as any);
          }}
        >
          <Text className="text-white text-2xl font-bold">Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-5 items-center">
          <Text className="text-red-400 text-2xl font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter();
  return (
    <View className="bg-[#0f1f1a] px-5 pt-7 pb-9">
      <View className="flex-row items-center gap-2 bg-[#1e3530] self-start rounded-full px-3.5 py-2 mb-5">
        <Ionicons name="home" size={13} color="#c9a96e" />
        <Text className="text-[#8a9e98] text-[11px] font-semibold tracking-wide">
          TRUSTED BY 500+ REAL ESTATE PROFESSIONALS
        </Text>
      </View>

      <Text className="text-white text-[32px] font-extrabold leading-10">
        On-Demand Showing Agents,
      </Text>
      <Text className="text-[#c9a96e] text-[30px] font-semibold italic leading-10 mb-4">
        When You Need Them
      </Text>

      <Text className="text-[#8a9e98] text-[15px] leading-6 mb-7">
        Delegate buyer showings, open houses, and property reports to licensed local agents. Keep
        your commission, grow your business — without the burnout.
      </Text>

      <TouchableOpacity
        className="bg-[#c9a96e] rounded-full py-4 items-center mb-3"
        onPress={() => router.push('/(auth)/signup' as any)}
      >
        <Text className="text-white text-base font-bold">Get Started Free</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-[#1e3530] rounded-full py-4 items-center mb-9"
        onPress={() => router.push('/(auth)/login' as any)}
      >
        <Text className="text-white text-base font-semibold">Sign In</Text>
      </TouchableOpacity>

      <View className="flex-row flex-wrap">
        {[
          { val: '97%', label: 'REQUEST PICKUP RATE' },
          { val: '<3 min', label: 'AVERAGE MATCH TIME' },
          { val: '4.8★', label: 'AGENT RATING' },
          { val: '10K+', label: 'SHOWINGS COMPLETED' },
        ].map((s) => (
          <View key={s.label} className="w-1/2 py-3 pr-2">
            <Text className="text-white text-[26px] font-extrabold mb-1">{s.val}</Text>
            <Text className="text-[#8a9e98] text-[10px] font-semibold tracking-widest">
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Coverage Stats Bar ───────────────────────────────────────────────────────
function CoverageStats() {
  return (
    <View className="bg-[#162820] flex-row flex-wrap px-5 py-6 border-t border-b border-[#2a3f38]">
      {[
        { val: '500+', label: 'LICENSED AGENTS' },
        { val: '50+', label: 'MARKETS COVERED' },
        { val: '$28–$367', label: 'EARNINGS' },
        { val: 'Zero', label: 'FEES' },
      ].map((s) => (
        <View key={s.label} className="w-1/2 py-2.5">
          <Text className="text-white text-2xl font-extrabold mb-1">{s.val}</Text>
          <Text className="text-green-400 text-[10px] font-bold tracking-widest">{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Coverage Section ─────────────────────────────────────────────────────────
function CoverageSection({ sectionRef }: { sectionRef: React.RefObject<View | null> }) {
  const [zip, setZip] = useState('');

  const markets = [
    {
      icon: <MaterialCommunityIcons name="city" size={26} color="#4a9eff" />,
      bg: 'bg-blue-100',
      title: 'Major Metros',
      sub: 'NYC, LA, Chicago, Miami & more',
    },
    {
      icon: <Ionicons name="home" size={26} color="#e05c2a" />,
      bg: 'bg-orange-100',
      title: 'Suburban Markets',
      sub: 'Growing coverage in secondary markets',
    },
    {
      icon: <Ionicons name="flash" size={26} color="#f97316" />,
      bg: 'bg-amber-100',
      title: 'Same-Day Available',
      sub: 'Rush showings with 3+ hours notice',
    },
    {
      icon: <MaterialCommunityIcons name="calendar-month" size={26} color="#7c6fcd" />,
      bg: 'bg-purple-100',
      title: '7 Days a Week',
      sub: 'Including weekends and holidays',
    },
  ];

  return (
    <View ref={sectionRef} className="bg-[#f0f4f3] px-5 pt-9 pb-9">
      <Text className="text-green-500 text-[11px] font-bold tracking-widest mb-2.5">
        NATIONWIDE COVERAGE
      </Text>
      <Text className="text-[#0f2820] text-[26px] font-extrabold leading-8 mb-3">
        Agents ready in your market
      </Text>
      <Text className="text-[#6b7f79] text-sm leading-5 mb-5">
        Our network spans 50+ markets across the US. Enter your ZIP to confirm coverage in your
        area.
      </Text>

      <TextInput
        className="bg-white rounded-xl px-4 py-3.5 text-[15px] text-[#0f2820] mb-3 border border-[#d1dbd8]"
        placeholder="Enter ZIP code"
        placeholderTextColor="#6b7f79"
        value={zip}
        onChangeText={setZip}
        keyboardType="numeric"
      />
      <TouchableOpacity className="bg-[#0f2820] rounded-xl py-4 items-center mb-6">
        <Text className="text-white text-[15px] font-bold">Check Coverage</Text>
      </TouchableOpacity>

      {markets.map((m, i) => (
        <View
          key={i}
          className="bg-white rounded-2xl p-4 flex-row items-center gap-3.5 mb-3.5 shadow-sm"
        >
          <View className={`w-13 h-13 rounded-xl items-center justify-center ${m.bg}`}>
            {m.icon}
          </View>
          <View className="flex-1">
            <Text className="text-[#0f2820] text-[15px] font-bold mb-0.5">{m.title}</Text>
            <Text className="text-[#6b7f79] text-[13px]">{m.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Process Section ──────────────────────────────────────────────────────────
function ProcessSection({ sectionRef }: { sectionRef: React.RefObject<View | null> }) {
  const steps = [
    {
      num: '1',
      title: 'Create Your Request',
      desc: 'Enter the property, service type, date, and agent fee. Takes under 2 minutes.',
      dark: true,
    },
    {
      num: '2',
      title: 'Agent Gets Matched',
      desc: 'Licensed local agents are notified instantly. Most requests accepted within 3 minutes.',
      dark: true,
    },
    {
      num: '3',
      title: 'Showing Completed',
      desc: 'Agent conducts the showing and submits a detailed post-visit summary with photos.',
      dark: true,
    },
    {
      num: '4',
      title: 'Review & Rate',
      desc: 'Review the summary, leave feedback for the agent, and book your next showing instantly.',
      dark: false,
    },
  ];

  return (
    <View ref={sectionRef} className="bg-[#f0f4f3] px-5 pt-9 pb-9">
      <Text className="text-green-500 text-[11px] font-bold tracking-widest mb-2.5 text-center">
        SIMPLE PROCESS
      </Text>
      <Text className="text-[#0f2820] text-[26px] font-extrabold leading-8 mb-3 text-center">
        Up and running in minutes
      </Text>
      <Text className="text-[#6b7f79] text-sm leading-5 mb-8 text-center">
        No contracts, no monthly fees. Pay only for the showings you book.
      </Text>

      {steps.map((s, i) => (
        <View key={i} className="items-center mb-8">
          <View
            className={`w-13 h-13 rounded-full items-center justify-center mb-3 ${
              s.dark ? 'bg-[#1a2e28]' : 'bg-[#c9a96e]'
            }`}
          >
            <Text className="text-white text-xl font-extrabold">{s.num}</Text>
          </View>
          <Text className="text-[#0f2820] text-base font-bold mb-1.5">{s.title}</Text>
          <Text className="text-[#6b7f79] text-[13px] leading-5 text-center">{s.desc}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────
function ServicesSection({ sectionRef }: { sectionRef: React.RefObject<View | null> }) {
  const router = useRouter();

  const services = [
    {
      icon: <Ionicons name="home" size={26} color="#e05c2a" />,
      bg: 'bg-orange-100',
      title: 'Buyer Showings',
      desc: 'A licensed agent meets your client, conducts a professional tour, and submits a detailed visit summary — you keep your commission.',
      cta: 'BOOK A SHOWING →',
      route: '/(client)/new-request',
    },
    {
      icon: <Ionicons name="home-outline" size={26} color="#e05c2a" />,
      bg: 'bg-orange-100',
      title: 'Open House Hosting',
      desc: 'Professional agents greet visitors, collect leads, answer questions, and deliver post-event reports.',
      cta: 'BOOK A HOST →',
      route: '/(client)/new-request',
    },
    {
      icon: <MaterialCommunityIcons name="camera" size={26} color="#555" />,
      bg: 'bg-gray-200',
      title: 'Property Photography',
      desc: 'Professional listing photos taken by licensed agents on-site. Perfect for condition reports and marketing.',
      cta: 'BOOK PHOTOGRAPHY →',
      route: '/(client)/new-request',
    },
    {
      icon: <MaterialCommunityIcons name="key" size={26} color="#d4a017" />,
      bg: 'bg-yellow-100',
      title: 'Lockbox Services',
      desc: "Lockbox placement, retrieval, or exchange. Our agents handle logistical tasks so you don't need to make unnecessary trips.",
      cta: 'BOOK LOCKBOX →',
      route: '/(client)/new-request',
    },
    {
      icon: <MaterialCommunityIcons name="file-document-outline" size={26} color="#9ca3af" />,
      bg: 'bg-gray-100',
      title: 'Property Reports',
      desc: 'Detailed condition reports with photos, repair notes, and interest assessments — advise clients remotely with confidence.',
      cta: 'ORDER A REPORT →',
      route: '/(client)/new-request',
    },
  ];

  return (
    <View ref={sectionRef} className="bg-[#f0f4f3] px-5 pt-9 pb-9">
      <Text className="text-green-500 text-[11px] font-bold tracking-widest mb-2.5 text-center">
        WHAT WE OFFER
      </Text>
      <Text className="text-[#0f2820] text-[26px] font-extrabold leading-8 mb-3 text-center">
        Every showing service, covered by licensed professionals
      </Text>
      <Text className="text-[#6b7f79] text-sm leading-5 mb-6 text-center">
        From a single buyer tour to a full open house weekend — PeekAbode agents handle it all so
        you can focus on closing deals.
      </Text>

      {services.map((s, i) => (
        <View key={i} className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <View className={`w-13 h-13 rounded-xl items-center justify-center mb-3 ${s.bg}`}>
            {s.icon}
          </View>
          <Text className="text-[#0f2820] text-[17px] font-extrabold mb-2">{s.title}</Text>
          <Text className="text-[#6b7f79] text-[13px] leading-5 mb-3">{s.desc}</Text>
          <TouchableOpacity onPress={() => router.push(s.route as any)}>
            <Text className="text-green-700 text-xs font-bold tracking-wide">{s.cta}</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Become an Agent CTA */}
      <View className="bg-[#0f2820] rounded-2xl p-5 mt-2">
        <View className="w-13 h-13 rounded-xl items-center justify-center mb-3 bg-[#2a1a1a]">
          <MaterialCommunityIcons name="briefcase" size={26} color="#c0392b" />
        </View>
        <Text className="text-white text-xl font-extrabold mb-2">Become a Showing Agent</Text>
        <Text className="text-[#8a9e98] text-[13px] leading-5 mb-3.5">
          Licensed agent? Earn $28–$367 per showing on a flexible schedule. Accept only what fits
          your calendar.
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
          <Text className="text-white text-[15px] font-bold">Apply Now →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const reviews = [
    {
      initials: 'JR',
      name: 'Jamie R.',
      role: 'Property Manager, Miami FL',
      quote:
        '"PeekAbode helped us keep tours moving during peak season — zero scheduling headaches. The agents are professional and the summaries are genuinely useful."',
    },
    {
      initials: 'ML',
      name: 'Monica L.',
      role: 'Listing Lead, Chicago IL',
      quote:
        '"The post-tour notes make it easy to follow up with prospects. I can manage twice as many buyers now without burning out."',
    },
    {
      initials: 'PK',
      name: 'Priya K.',
      role: 'Realtor, Austin TX',
      quote:
        '"Open house hosts were professional and on time. My clients couldn\'t tell the difference. I made an extra $18K this quarter."',
    },
  ];

  return (
    <View className="bg-[#eef5f3] px-5 pt-9 pb-9">
      <Text className="text-green-500 text-[11px] font-bold tracking-widest mb-2.5 text-center">
        WHAT AGENTS SAY
      </Text>
      <Text className="text-[#0f2820] text-[26px] font-extrabold leading-8 mb-6 text-center">
        Trusted by real estate professionals
      </Text>

      {reviews.map((r, i) => (
        <View key={i} className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <View className="flex-row gap-1 mb-3">
            {[...Array(5)].map((_, j) => (
              <FontAwesome key={j} name="star" size={14} color="#f59e0b" />
            ))}
          </View>
          <Text className="text-[#1a2e28] text-sm leading-6 italic mb-4">{r.quote}</Text>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-teal-600 items-center justify-center">
              <Text className="text-white text-[13px] font-bold">{r.initials}</Text>
            </View>
            <View>
              <Text className="text-[#0f2820] text-sm font-bold">{r.name}</Text>
              <Text className="text-[#6b7f79] text-xs">{r.role}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
function FAQSection({ sectionRef }: { sectionRef: React.RefObject<View | null> }) {
  const faqs = [
    {
      q: 'How quickly can I get a showing agent?',
      a: 'Most requests are accepted within 3 minutes. For same-day requests, we recommend providing at least 3 hours of notice.',
    },
    {
      q: 'Are the agents licensed?',
      a: 'Yes, all agents on the PeekAbode platform are verified, licensed real estate professionals in their respective markets.',
    },
    {
      q: 'How do I pay the agents?',
      a: 'Payments are handled securely through our platform once the visit summary is submitted and approved.',
    },
    {
      q: 'What if I need to cancel?',
      a: 'You can cancel a request at any time. Cancellation fees may apply if an agent has already been matched and is on their way.',
    },
  ];

  return (
    <View ref={sectionRef} className="bg-white px-5 pt-9 pb-9">
      <Text className="text-green-500 text-[11px] font-bold tracking-widest mb-2.5 text-center">
        FAQ
      </Text>
      <Text className="text-[#0f2820] text-[26px] font-extrabold leading-8 mb-6 text-center">
        Common Questions
      </Text>

      {faqs.map((f, i) => (
        <View key={i} className="py-5 border-b border-[#e5eeeb]">
          <Text className="text-[#0f2820] text-[15px] font-bold mb-2">{f.q}</Text>
          <Text className="text-[#6b7f79] text-[13px] leading-5">{f.a}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { heading: 'SOLUTIONS', links: ['For Teams', 'For Brokerages', 'For Solo Agents'] },
    { heading: 'SUPPORT', links: ['Help Center', 'API Docs', 'Status Page'] },
    { heading: 'LEGAL', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
  ];

  return (
    <View className="bg-[#162820] px-5 pt-8 pb-6">
      <View className="flex-row items-center gap-2.5 mb-3">
        <View className="w-9 h-9 rounded-lg bg-green-500 items-center justify-center">
          <Ionicons name="home" size={18} color="#fff" />
        </View>
        <Text className="text-white text-lg font-bold">PeekAbode</Text>
      </View>
      <Text className="text-[#8a9e98] text-[13px] leading-5 mb-7">
        Empowering real estate professionals with on-demand agent support. Scale your business
        without the overhead.
      </Text>

      {cols.map((col, i) => (
        <View key={i} className="mb-6">
          <Text className="text-[#8a9e98] text-[11px] font-bold tracking-widest mb-3">
            {col.heading}
          </Text>
          {col.links.map((l, j) => (
            <TouchableOpacity key={j}>
              <Text className="text-[#8a9e98] text-sm mb-2.5">{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View className="border-t border-[#2a3f38] pt-5 items-center gap-3">
        <Text className="text-[#4a6058] text-[11px] tracking-widest font-semibold">
          © 2026 PEEKABODE. ALL RIGHTS RESERVED.
        </Text>
        <View className="flex-row gap-5">
          {['X', 'LI', 'IG'].map((s) => (
            <TouchableOpacity key={s}>
              <Text className="text-[#4a6058] text-xs font-bold tracking-widest">{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<ScrollViewType>(null);

  // One ref per scrollable section
  const sectionRefs: SectionRefs = {
    solutions: useRef<View | null>(null),
    services: useRef<View | null>(null),
    coverage: useRef<View | null>(null),
    howItWorks: useRef<View | null>(null),
    faq: useRef<View | null>(null),
    docs: useRef<View | null>(null),
  };

  const scrollToSection = (key: SectionKey) => {
    const ref = sectionRefs[key];
    if (ref.current && scrollRef.current) {
      ref.current.measureLayout(
        // @ts-ignore — measureLayout accepts the scroll view's node handle
        scrollRef.current.getInnerViewNode?.() ?? scrollRef.current,
        (_x: number, y: number) => {
          scrollRef.current?.scrollTo({ y, animated: true });
        },
        () => {}
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f1f1a]">
      <StatusBar barStyle="light-content" backgroundColor="#0f1f1a" />
      <Header onMenuPress={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      {menuOpen ? (
        <DrawerMenu
          onClose={() => setMenuOpen(false)}
          onNavigate={scrollToSection}
        />
      ) : (
        <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <HeroSection />
          <CoverageStats />
          <CoverageSection sectionRef={sectionRefs.coverage} />
          <ProcessSection sectionRef={sectionRefs.howItWorks} />
          <ServicesSection sectionRef={sectionRefs.services} />
          <TestimonialsSection />
          <FAQSection sectionRef={sectionRefs.faq} />
          <Footer />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
