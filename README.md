# PeekAbode — React Native Mobile App

On-demand showing agent marketplace for real estate professionals. Connects property managers and agents who post requests with licensed local agents who fulfill them.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Expo SDK 54 + Expo Router v6 (file-based routing) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| Backend / Auth | Supabase (direct client queries + Auth) |
| Session storage | `@react-native-async-storage/async-storage` |
| Icons | `@expo/vector-icons` (Ionicons, MaterialCommunityIcons, FontAwesome) |
| Navigation | Expo Router tabs + stack |

---

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- An Expo Go app on your device, or Android/iOS simulator

---

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env` file in the project root (or update the existing one):

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. **Start the dev server**

   ```bash
   npx expo start
   ```

   Then open in:
   - **Expo Go** — scan the QR code
   - **Android emulator** — press `a`
   - **iOS simulator** — press `i`

---

## Project Structure

```
app/
├── index.tsx                   # Splash / entry screen
├── _layout.tsx                 # Root layout — auth gate + SafeAreaProvider
├── global.css                  # Tailwind base + CSS variables
│
├── (auth)/
│   ├── login.tsx               # Sign in screen
│   └── signup.tsx              # Create account screen
│
├── (client)/                   # Authenticated area (role: USER / AGENT)
│   ├── _layout.tsx             # Bottom tab navigator (5 tabs + Admin tab for admins)
│   ├── index.tsx               # Dashboard — stats, quick actions, job feed
│   ├── admin-panel.tsx         # Redirects admins to /(admin)
│   ├── new-request/
│   │   └── index.tsx           # 4-step new request wizard
│   ├── bookings/
│   │   └── index.tsx           # My bookings list with status filter
│   ├── opportunities/
│   │   └── index.tsx           # Open jobs feed (2-col grid + apply modal)
│   └── profile/
│       └── index.tsx           # Profile editor + sign out
│
└── (admin)/                    # Admin area (role: ADMIN / SUPERADMIN)
    ├── _layout.tsx             # Bottom tab navigator (Overview, Users, Requests)
    ├── index.tsx               # Overview — stats, recent requests, quick links
    ├── users.tsx               # User management + Add User dialog
    ├── requests.tsx            # Request management with filters + status updates
    └── create-user.tsx         # (backing screen for the Add User dialog)

hooks/
├── useAuth.ts                  # useCurrentUser, useSignIn, useSignUp, useSignOut
├── useRequests.ts              # Fetch, create, update requests
├── useUsers.ts                 # Fetch, update, delete users (admin)
├── useNewRequest.ts            # 4-step form submission
└── useSupportRequest.ts        # Support ticket submission

lib/
├── supabase.ts                 # Supabase client (AsyncStorage session)
├── types.ts                    # Shared TypeScript types
└── utils.ts                    # cn() helper (clsx + tailwind-merge)
```

---

## User Roles

| Role | Access |
|---|---|
| `USER` | Client dashboard, new requests, bookings, opportunities, profile |
| `AGENT` | Same as USER — can also accept jobs from the opportunities feed |
| `ADMIN` | All of the above + Admin tab (users, requests management) |
| `SUPERADMIN` | Same as ADMIN |

The app automatically redirects to the correct area on sign-in based on role. Admins see an extra **Admin** tab in the bottom bar.

---

## Auth Flow

```
App launch
  └── Signed in?
        ├── Yes → role ADMIN/SUPERADMIN → /(admin)
        ├── Yes → role USER/AGENT       → /(client)
        └── No  → /index (splash) → login or signup
```

---

## Database Schema (Supabase)

| Table | Key columns |
|---|---|
| `users` | `id`, `full_name`, `email`, `role`, `job_title`, `status` |
| `requests` | `id`, `client_id`, `service_type`, `status`, `compensation`, `address`, `date`, `start_time`, `end_time`, `agent_id` |
| `support_requests` | `id`, `user_id`, `subject`, `message`, `status` |
| `sessions` | `id`, `user_id`, `is_online`, `last_active` |

---

## Key Features

**Client dashboard**
- Stat cards (active requests, upcoming, opportunities, earnings)
- Quick action shortcuts to new request wizard with pre-selected service type
- Agent job feed with tab pills (Feed / Pending / Active / History)
- Accept / Decline jobs inline
- Contact Support floating button → modal form

**New Request Wizard (4 steps)**
1. Service type selector (Showing, Open House, Lockbox Drop, Photography, Property Report)
2. Property details form with validation
3. Date, time, and compensation slider
4. Review & submit

**Bookings**
- Filter by All / Active / Completed / Cancelled / As Agent
- Inline status change per booking

**Opportunities**
- 2-column grid of PENDING requests
- Service type filter chips
- Detail modal with Confirm & Apply

**Admin — Users**
- Searchable user list
- Expandable rows: change role, enable/disable, delete
- Add User dialog (modal, no separate page)

**Admin — Requests**
- Summary bar (counts per status + total earnings)
- Filter chips with live counts
- Expandable cards with full request detail and inline status changer

---

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Open on Android emulator
npm run ios        # Open on iOS simulator
npm run web        # Open in browser
npm run lint       # Run ESLint
```
