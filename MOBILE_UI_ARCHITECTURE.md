# PeekAbode — React Native Expo UI Architecture

> On-demand showing agent marketplace for real estate professionals.
> Two user roles: **Client** (property managers / agents who post requests) and **Agent** (licensed agents who accept jobs).
> Admin panel is web-only; the mobile app covers the Client + Agent experience.

---

## Tech Stack Recommendations

| Concern | Library |
|---|---|
| Navigation | `expo-router` (file-based, mirrors Next.js conventions) |
| Styling | `nativewind` v4 (Tailwind classes on RN components) |
| State / Data | `@tanstack/react-query` + `axios` |
| Auth | `@supabase/supabase-js` with `expo-secure-store` |
| Forms | `react-hook-form` |
| Date/Time | `react-native-calendars` + custom time picker |
| Toasts | `react-native-toast-message` |
| Icons | `lucide-react-native` |
| Bottom Sheets | `@gorhom/bottom-sheet` |

---

## Color Palette

```
Primary Dark:   #112424  (deep teal — hero backgrounds, nav)
Primary Green:  #416450  (CTAs, active states)
Accent Gold:    #d69e5e  (primary buttons, highlights)
Background:     #f8fafb  (screen backgrounds)
Surface:        #ffffff  (cards)
Text Primary:   #1a2a2a
Text Muted:     #9ca3af  (gray-400)
Status Pending: #f97316  (orange)
Status Active:  #3b82f6  (blue)
Status Done:    #22c55e  (green)
Status Cancel:  #6b7280  (gray)
```

---

## Navigation Structure

```
(app)/
├── (auth)/                   ← unauthenticated stack
│   ├── index.tsx             ← Landing / splash
│   ├── login.tsx
│   └── signup.tsx
│
├── (client)/                 ← authenticated tab navigator (role: USER)
│   ├── _layout.tsx           ← Bottom tab bar
│   ├── index.tsx             ← Dashboard (home tab)
│   ├── new-request/
│   │   └── index.tsx         ← Multi-step request wizard
│   ├── bookings/
│   │   └── index.tsx         ← My Bookings list
│   ├── opportunities/
│   │   └── index.tsx         ← Open jobs feed (agent view)
│   └── profile/
│       └── index.tsx         ← Profile & settings
│
└── (modals)/                 ← Full-screen modals (presented over tabs)
    ├── support.tsx           ← Contact Support form
    ├── opportunity-detail.tsx ← Job detail + Apply
    └── booking-detail.tsx    ← Booking detail + status change
```

---

## Screen Inventory

### Auth Screens

---

#### 1. Splash / Landing — `(auth)/index.tsx`

**Purpose:** First screen for unauthenticated users. Brand intro + CTA.

**Layout:**
```
┌─────────────────────────────┐
│  [Logo]  PeekAbode          │
│                             │
│  On-Demand Showing Agents   │
│  When You Need Them         │
│                             │
│  97%  <3min  4.8★  10K+     │  ← stat row
│                             │
│  [Get Started Free]  ←gold  │
│  [Sign In]           ←ghost │
└─────────────────────────────┘
```

**Components:**
- `HeroStatRow` — 4 stats in a horizontal scroll
- `PrimaryButton` — gold background
- `GhostButton` — dark border

---

#### 2. Login — `(auth)/login.tsx`

**Purpose:** Email + password sign-in via Supabase.

**Layout:**
```
┌─────────────────────────────┐
│  ← Back                     │
│                             │
│  Sign In                    │
│  Welcome back.              │
│                             │
│  [Email _______________]    │
│  [Password _____________]   │
│  Forgot password?           │
│                             │
│  [Sign In]                  │
│                             │
│  Don't have an account?     │
│  Create one free →          │
└─────────────────────────────┘
```

**State:** `email`, `password`, `loading`, `error`

**Behavior:**
- On success → navigate to `/(client)/`
- Error banner shown inline above form

---

#### 3. Sign Up — `(auth)/signup.tsx`

**Purpose:** Create account with name, email, role, password.

**Layout:**
```
┌─────────────────────────────┐
│  ← Back                     │
│                             │
│  Create Account             │
│  Free to join.              │
│                             │
│  [Full Name ____________]   │
│  [Work Email ___________]   │
│  [I am a... ▼]              │
│    Property Manager         │
│    Real Estate Agent        │
│    Broker                   │
│  [Password _____________]   │
│                             │
│  [Create Free Account]      │
│                             │
│  Already have an account?   │
│  Sign In →                  │
└─────────────────────────────┘
```

**State:** `fullName`, `email`, `role`, `password`, `loading`, `error`

---

### Client Screens (Bottom Tab Navigator)

Tab bar items: **Home** · **New Request** · **Bookings** · **Opportunities** · **Profile**

---

#### 4. Client Dashboard — `(client)/index.tsx`

**Purpose:** Overview of activity + quick-action shortcuts.

**Layout:**
```
┌─────────────────────────────┐
│  Welcome back 👋            │
│  Here's what's happening... │
│                             │
│  ┌──────┐ ┌──────┐          │
│  │  3   │ │  2   │          │  ← stat cards (2×2 grid)
│  │Active│ │Upcom.│          │
│  └──────┘ └──────┘          │
│  ┌──────┐ ┌──────┐          │
│  │  12  │ │$0.00 │          │
│  │Opps. │ │Earned│          │
│  └──────┘ └──────┘          │
│                             │
│  Quick Actions              │
│  ┌────┐┌────┐┌────┐┌────┐   │  ← horizontal scroll
│  │Show││Open││Lock││Phot│   │
│  │ing ││Hse ││box ││o   │   │
│  └────┘└────┘└────┘└────┘   │
│                             │
│  Agent Dashboard            │
│  ┌──────────────────────┐   │
│  │ Pending  Active  Done│   │  ← mini stats
│  └──────────────────────┘   │
│                             │
│  [Jobs Feed][Pending]       │  ← tab pills
│  [Active][History]          │
│                             │
│  ┌──────────────────────┐   │
│  │ Job Card             │   │
│  │ Showing · $85        │   │
│  │ 123 Main St, Miami   │   │
│  │ [Accept] [Decline]   │   │
│  └──────────────────────┘   │
│  ...                        │
└─────────────────────────────┘
```

**Components:**
- `StatCard` — icon + value + label, tappable (navigates to bookings/opportunities)
- `QuickActionCard` — icon + title + description, horizontal `FlatList`
- `MiniStatRow` — pending / active / completed / rating in a row
- `TabPills` — Jobs Feed / Pending / Active / History
- `JobCard` — service type, address, compensation, Accept/Decline buttons
- `SupportFAB` — floating "Contact Support" button

**State:** `activeTab: DashboardTab`, `successMessage`, `supportOpen`

**Data:** `useRequests()`, `useUsers()` (for current user stats)

---

#### 5. New Request Wizard — `(client)/new-request/index.tsx`

**Purpose:** 4-step form to post a new showing request.

**Layout (shared shell):**
```
┌─────────────────────────────┐
│  ← Back   New Showing Req.  │
│                             │
│  ●───●───○───○              │  ← step indicator
│  Svc  Prop Sched Rev        │
│                             │
│  ┌──────────────────────┐   │
│  │                      │   │
│  │   Step Content       │   │
│  │                      │   │
│  └──────────────────────┘   │
│                             │
│  [Back]          [Continue] │
└─────────────────────────────┘
```

**Step 1 — Service Type:**
```
What service do you need?

┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🏠       │ │ 🏡       │ │ 🔑       │
│ Showing  │ │ Open Hse │ │ Lockbox  │
│ $35–$150 │ │ $75–$300 │ │ $25–$60  │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ 📸       │ │ 📄       │
│ Photos   │ │ Report   │
│ $50–$200 │ │ $40–$120 │
└──────────┘ └──────────┘
```

**Step 2 — Property Details:**
```
Property details

Street Address *  [________________]
City *            [________________]
State *  [___]    ZIP * [_____]
MLS Number        [________________]
Client Name       [________________]
Client Phone      [________________]
Access Notes      [________________]
                  [________________]
Lockbox Code      [________________]
Additional Notes  [________________]
```

**Step 3 — Schedule & Fee:**
```
Schedule & compensation

Showing Date *
[📅 Pick a date          ▼]

Start Time *    End Time *
[⏰ 09:00 AM]  [⏰ 10:00 AM]

Agent Compensation
$85
[────────●──────────────]  ← slider $35–$150

Higher fees attract agents faster.
```

**Step 4 — Review & Submit:**
```
Review your request

Service      🏠 Showing
Address      123 Main St, Miami, FL 33101
Date         May 15, 2026
Time Window  9:00 AM – 10:00 AM
Agent Fee    $85

ℹ️ Your request will be visible to licensed
   agents in the area...

              [Submit Request →]
```

**State:** `step (1–4)`, `selectedService`, `compensation`, `formData`, `errors`, `loading`

---

#### 6. My Bookings — `(client)/bookings/index.tsx`

**Purpose:** List of all requests the user has created, filterable by status.

**Layout:**
```
┌─────────────────────────────┐
│  My Bookings    [+ New Req] │
│                             │
│  All · Active · Completed   │  ← tab bar
│  Cancelled · As Agent       │
│                             │
│  ┌──────────────────────┐   │
│  │ 🏠  123 Main St      │   │
│  │     Miami, FL 33101  │   │
│  │  Date: May 15        │   │
│  │  Time: 9–10 AM       │   │
│  │  Fee: $85            │   │
│  │  [PENDING ▼]         │   │  ← status dropdown
│  └──────────────────────┘   │
│  ...                        │
│                             │
│  (empty state)              │
│  📋 No bookings found.      │
│  [Create your first request]│
└─────────────────────────────┘
```

**Components:**
- `BookingRow` — address, date, time, fee, status badge (tappable → `booking-detail` modal)
- `StatusBadge` — color-coded pill (PENDING=orange, ACTIVE=blue, COMPLETED=green, CANCELLED=gray)
- `EmptyState` — icon + message + CTA

**State:** `activeTab: TabType`

---

#### 7. Opportunities — `(client)/opportunities/index.tsx`

**Purpose:** Browse open (PENDING) requests from other users that the current user can accept as an agent.

**Layout:**
```
┌─────────────────────────────┐
│  Showing Opportunities  [↺] │
│                             │
│  Filter:                    │
│  [All][🏠 Showing][🏡 Open] │  ← horizontal scroll chips
│  [🔑 Lockbox][📸 Photo][📄] │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🏠       │ │ 🏡       │  │  ← 2-col grid
│  │ Showing  │ │ Open Hse │  │
│  │ 123 Main │ │ 456 Oak  │  │
│  │ Miami FL │ │ Austin TX│  │
│  │ May 15   │ │ May 16   │  │
│  │ 9–10 AM  │ │ 11–1 PM  │  │
│  │ $85      │ │ $120     │  │
│  │[View & Apply]│[View & Apply]│
│  └──────────┘ └──────────┘  │
│  ...                        │
└─────────────────────────────┘
```

**Components:**
- `FilterChip` — active/inactive pill
- `OpportunityCard` — service icon, address, date/time, fee, "View Details & Apply" button
- On tap → opens `opportunity-detail` modal

---

#### 8. Profile — `(client)/profile/index.tsx`

**Purpose:** View and edit user profile, change password, contact support.

**Layout:**
```
┌─────────────────────────────┐
│  [ADMIN badge]              │
│  My Profile                 │
│  Update your name...        │
│                             │
│  ── Identity ──             │
│  Full Name   [Jane Smith  ] │
│  Email       [jane@... 🔒 ] │
│              (cannot change)│
│                             │
│  ── Job Title ──            │
│  ← [Property Manager] →    │
│                             │
│  ── Security ──             │
│  🔑 Change password         │
│                             │
│  ── Danger Zone ──          │
│  [Sign Out]                 │
│                             │
│  Need help? Contact support │
└─────────────────────────────┘
```

**Components:**
- `ProfileInput` — labeled text input, disabled variant for email
- `JobTitleCarousel` — left/right arrows to cycle through titles
- `SectionDivider` — labeled separator

---

### Modal Screens

---

#### 9. Contact Support Modal — `(modals)/support.tsx`

**Purpose:** Submit a support ticket.

**Layout:**
```
┌─────────────────────────────┐
│  Contact Support        [✕] │
│  Let us know what you       │
│  need help with.            │
│                             │
│  Subject *                  │
│  [e.g. Booking issue      ] │
│                             │
│  Message *                  │
│  [Describe your issue...  ] │
│  [                        ] │
│  [                        ] │
│                             │
│  Attach Screenshot (opt.)   │
│  ┌──────────────────────┐   │
│  │  📎 Tap to upload    │   │
│  └──────────────────────┘   │
│                             │
│  [Send Request]             │
└─────────────────────────────┘
```

**State:** `subject`, `message`, `attachmentUri`, `submitting`

---

#### 10. Opportunity Detail Modal — `(modals)/opportunity-detail.tsx`

**Purpose:** Full details of an open job + confirm apply.

**Layout:**
```
┌─────────────────────────────┐
│  Showing Details        [✕] │
│  Review before applying.    │
│                             │
│  ┌──────────────────────┐   │
│  │ Address              │   │
│  │ 123 Main St, Miami   │   │
│  │ FL 33101             │   │
│  │                      │   │
│  │ Schedule    Comp.    │   │
│  │ May 15      $85      │   │
│  │ 9–10 AM              │   │
│  └──────────────────────┘   │
│                             │
│  MLS Number                 │
│  A1234567                   │
│                             │
│  Access Notes               │
│  ┌──────────────────────┐   │
│  │ Lockbox on front...  │   │
│  └──────────────────────┘   │
│                             │
│  Additional Notes           │
│  ┌──────────────────────┐   │
│  │ Special instructions │   │
│  └──────────────────────┘   │
│                             │
│  [Cancel]   [Confirm & Apply]│
└─────────────────────────────┘
```

---

#### 11. Booking Detail Modal — `(modals)/booking-detail.tsx`

**Purpose:** View full booking info, update status.

**Layout:**
```
┌─────────────────────────────┐
│  Booking Details        [✕] │
│                             │
│  🏠 Showing                 │
│  123 Main St                │
│  Miami, FL 33101            │
│                             │
│  Date     May 15, 2026      │
│  Time     9:00 – 10:00 AM   │
│  Fee      $85               │
│  Client   Jane Smith        │
│  Phone    (555) 000-0000    │
│                             │
│  Status                     │
│  [PENDING ▼]                │
│    PENDING                  │
│    ACTIVE                   │
│    COMPLETED                │
│    CANCELLED                │
│                             │
│  [Close]                    │
└─────────────────────────────┘
```

---

## Shared / Reusable Components

### Navigation
| Component | Description |
|---|---|
| `BottomTabBar` | Custom tab bar with icons for Home, New, Bookings, Opps, Profile |
| `StackHeader` | Back button + title, used in auth and modal stacks |

### Buttons
| Component | Props | Notes |
|---|---|---|
| `PrimaryButton` | `label`, `onPress`, `loading`, `disabled` | Gold `#d69e5e` background |
| `SecondaryButton` | `label`, `onPress` | Dark `#1a2a2a` background |
| `GhostButton` | `label`, `onPress` | Transparent + border |
| `DangerButton` | `label`, `onPress` | Red tones |

### Cards
| Component | Props | Notes |
|---|---|---|
| `StatCard` | `icon`, `label`, `value`, `color`, `onPress` | Dashboard stat tiles |
| `QuickActionCard` | `icon`, `title`, `description`, `onPress` | Horizontal scroll actions |
| `JobCard` | `request`, `onAccept`, `onDecline` | Agent job feed item |
| `OpportunityCard` | `request`, `onPress` | Grid card for opportunities |
| `BookingRow` | `request`, `onPress` | List row for bookings |

### Form
| Component | Props | Notes |
|---|---|---|
| `FormInput` | `label`, `value`, `onChange`, `error`, `disabled` | Labeled text input |
| `FormTextarea` | `label`, `value`, `onChange`, `error` | Multi-line input |
| `FormSelect` | `label`, `options`, `value`, `onChange` | Native picker wrapper |
| `DatePickerField` | `label`, `value`, `onChange`, `error` | Calendar sheet trigger |
| `TimePickerField` | `label`, `value`, `onChange`, `error` | Time wheel trigger |
| `CompensationSlider` | `value`, `onChange`, `min`, `max` | Range slider + display |
| `ServiceOptionCard` | `icon`, `title`, `description`, `price`, `selected`, `onPress` | Step 1 service selector |

### Feedback
| Component | Props | Notes |
|---|---|---|
| `StatusBadge` | `status` | Color-coded pill |
| `EmptyState` | `icon`, `title`, `subtitle`, `cta` | Empty list placeholder |
| `ErrorBanner` | `message` | Red inline error |
| `SuccessBanner` | `message` | Green inline success |
| `LoadingSpinner` | — | Centered activity indicator |
| `StepIndicator` | `steps`, `current` | Wizard progress dots |

---

## Data Layer

### Hooks (mirror the web app)

```ts
// Auth
useSession()         → { user, loading, signOut }

// Requests
useRequests()        → { requests, loading, refresh, updateRequestStatus }
useNewRequest()      → { submitRequest, loading }

// Users
useUsers()           → { users, loading, refresh }  // admin only

// Support
useSupportRequest()  → { submit, loading }
```

### API Endpoints (same backend)

```
POST   /api/requests              → create request
GET    /api/requests              → list requests (filtered by user)
PATCH  /api/requests/:id          → update status / assign agent
POST   /api/support-requests      → submit support ticket
GET    /api/users                 → list users (admin)
POST   /api/users                 → create user (admin)
```

---

## Auth Flow

```
App Launch
    │
    ▼
Check Supabase session
    │
    ├── No session ──→ (auth)/index  (landing)
    │
    └── Has session
            │
            ├── role = USER/AGENT ──→ (client)/  (tab navigator)
            │
            └── role = ADMIN ──→ web only (redirect to /admin on web)
```

---

## Screen Flow Diagram

```
Landing
  ├── → Login → Dashboard
  └── → Signup → Dashboard

Dashboard
  ├── Stat Card (Active Requests) → Bookings
  ├── Stat Card (Opportunities)   → Opportunities
  ├── Quick Action (any)          → New Request (step 1 pre-selected)
  ├── Job Card [Accept]           → status update inline
  ├── Job Card [Decline]          → status update inline
  └── Contact Support             → Support Modal

New Request Wizard
  Step 1 → Step 2 → Step 3 → Step 4 → Submit → Bookings

Bookings
  └── Booking Row tap → Booking Detail Modal

Opportunities
  └── Opportunity Card tap → Opportunity Detail Modal
        └── [Confirm & Apply] → status update → Opportunities

Profile
  ├── Change Password → (inline or modal)
  └── Sign Out → Landing
```

---

## Notes for Implementation

1. **Dual role on one screen** — The web `client/page.tsx` serves both the "client posting requests" and "agent accepting jobs" roles in one dashboard. In mobile, keep this combined view on the Home tab with the tab pills (Jobs Feed / Pending / Active / History) to switch context.

2. **Compensation slider** — Use `@react-native-community/slider` or `expo-slider`. Range is $35–$150 for Showings; adjust per service type.

3. **Date picker** — Use `react-native-calendars` in a `@gorhom/bottom-sheet` for a native feel. The web uses `react-day-picker`.

4. **Time picker** — A custom wheel picker (hours + minutes + AM/PM) in a bottom sheet. The web has a custom `TimePicker` component.

5. **File upload (support)** — Use `expo-image-picker` for the screenshot attachment in the support form.

6. **Status updates** — `PATCH /api/requests/:id` is the single endpoint. Pass `{ status, agentId? }` in the body.

7. **Real-time** — The web polls via `refresh()`. For mobile, consider Supabase Realtime subscriptions on the `requests` table for live job feed updates.

8. **Admin panel** — Not included in mobile. Admin features (user management, sessions, create-user) remain web-only. If needed later, add a separate `(admin)` tab group gated by role check.
