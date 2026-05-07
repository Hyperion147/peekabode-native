# PeekAbode — React Native Expo Integration Guide

This document covers all hooks, features, and Supabase integration patterns needed to port or build the PeekAbode mobile app using React Native Expo. It mirrors the architecture of the existing Next.js web app.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Supabase Setup](#2-supabase-setup)
3. [Authentication](#3-authentication)
4. [Database Schema](#4-database-schema)
5. [API Layer](#5-api-layer)
6. [Hooks](#6-hooks)
7. [Feature Modules](#7-feature-modules)
8. [Navigation Structure](#8-navigation-structure)
9. [Environment Variables](#9-environment-variables)

---

## 1. Project Overview

PeekAbode is a real estate services marketplace. It connects property managers (clients) with licensed agents who can perform showings, open houses, lockbox drops, photography, and property reports.

**User Roles**

| Role | Description |
|---|---|
| `USER` | Property manager / client who creates requests |
| `AGENT` | Licensed agent who accepts and fulfills requests |
| `ADMIN` | Platform admin with full user and request management |
| `SUPERADMIN` | Elevated admin access |

**Request Statuses**

| Status | Meaning |
|---|---|
| `PENDING` | Created, waiting for an agent to accept |
| `ACTIVE` | An agent has accepted the request |
| `COMPLETED` | Service has been fulfilled |
| `CANCELLED` | Request was declined or cancelled |

---

## 2. Supabase Setup

### Installation

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
```

### Client Initialization

The web app uses `@supabase/ssr`'s `createBrowserClient`. In Expo, use the standard `createClient` with `AsyncStorage` for session persistence.

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});
```

> **Key difference from web:** `detectSessionInUrl: false` is required in React Native because there is no browser URL to parse OAuth redirects from.

---

## 3. Authentication

### Sign Up

The web app calls `supabase.auth.signUp` and then inserts a row into the public `users` table using the returned user ID.

```ts
// hooks/useAuth.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (fullName: string, email: string, password: string, role = 'USER') => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Mirror the web app: insert into public users table
      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName,
          email,
          role,
        });
        if (insertError) throw insertError;
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
}
```

### Sign In

```ts
export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}
```

### Sign Out

```ts
export function useSignOut() {
  const signOut = async () => {
    await supabase.auth.signOut();
    // Navigate to login screen after sign out
  };
  return { signOut };
}
```

### Get Current User

Used throughout the web app (e.g., in `useNewRequest`, `OpportunitiesPage`, `ClientDashboard`) to get the authenticated user before submitting data.

```ts
export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

### Auth State Listener (App Root)

Wrap your app root with an auth state listener to handle navigation between authenticated and unauthenticated states.

```ts
// App.tsx or _layout.tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      // Navigate to client dashboard
    } else if (event === 'SIGNED_OUT') {
      // Navigate to login screen
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## 4. Database Schema

These are the four tables used by the app. All queries go through the Next.js API routes in the web app, but in a mobile app you can query Supabase directly using the JS client.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, matches Supabase Auth user ID |
| `full_name` | `text` | Required |
| `email` | `text` | Unique, required |
| `role` | `text` | `USER`, `ADMIN`, `SUPERADMIN` — default `USER` |
| `job_title` | `text` | Optional |
| `status` | `text` | `Active` or `Disabled` — default `Active` |
| `created_at` | `timestamp` | Auto |
| `last_seen` | `timestamp` | Auto |
| `active_requests` | `integer` | Default `0` |
| `total_earned` | `decimal` | Default `0` |
| `completed_showings` | `integer` | Default `0` |

### `requests`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `client_id` | `uuid` | FK → `users.id`, required |
| `service_type` | `text` | `Showing`, `Open House`, `Lockbox Drop`, `Photography`, `Property Report` |
| `status` | `text` | `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED` — default `PENDING` |
| `compensation` | `decimal` | Required |
| `address` | `text` | Required |
| `city` | `text` | Required |
| `state` | `text` | Required |
| `zip` | `text` | Required |
| `mls_number` | `text` | Optional |
| `client_name` | `text` | Optional |
| `client_phone` | `text` | Optional |
| `access_notes` | `text` | Optional |
| `lockbox_code` | `text` | Optional |
| `additional_notes` | `text` | Optional |
| `date` | `date` | Required |
| `start_time` | `text` | Required |
| `end_time` | `text` | Required |
| `agent_id` | `uuid` | FK → `users.id`, set when an agent accepts |
| `created_at` | `timestamp` | Auto |

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK → `users.id` |
| `ip_address` | `text` | Optional |
| `user_agent` | `text` | Optional |
| `started_at` | `timestamp` | Auto |
| `last_active` | `timestamp` | Auto |
| `is_online` | `boolean` | Default `true` |

### `support_requests`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK → `users.id`, optional |
| `subject` | `text` | Required |
| `message` | `text` | Required |
| `attachment_name` | `text` | Optional — filename only, not the file itself |
| `status` | `text` | `OPEN`, `IN_PROGRESS`, `CLOSED` — default `OPEN` |
| `created_at` | `timestamp` | Auto |

---

## 5. API Layer

The web app routes all data through Next.js API routes (`/api/...`) using an Axios instance. In React Native, you can either:

- **Call the deployed Next.js API** (same as web, just point Axios at your production URL), or
- **Query Supabase directly** from the mobile client (recommended for mobile — fewer round trips).

### Option A: Axios to Next.js API (same as web)

```ts
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-deployed-app.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase session token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;
```

### Option B: Direct Supabase Queries (recommended for mobile)

```ts
// Fetch all requests, ordered by created_at desc
const { data, error } = await supabase
  .from('requests')
  .select('*')
  .order('created_at', { ascending: false });

// Insert a new request
const { data, error } = await supabase
  .from('requests')
  .insert({ ...requestData })
  .select()
  .single();

// Update request status and assign agent
const { data, error } = await supabase
  .from('requests')
  .update({ status: 'ACTIVE', agent_id: userId })
  .eq('id', requestId)
  .select()
  .single();
```

---

## 6. Hooks

These hooks mirror the web app's `src/hooks/` directory, adapted for React Native.

### `useUsers`

Fetches all users. Used in the admin dashboard.

```ts
// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refresh: fetchUsers };
}
```

### `useRequests`

Fetches all requests. Provides `createRequest` and `updateRequestStatus`. Used in the client dashboard, bookings, and opportunities screens.

```ts
// hooks/useRequests.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = async (requestData: Record<string, any>) => {
    const { data, error } = await supabase
      .from('requests')
      .insert(requestData)
      .select()
      .single();

    if (error) throw error;
    await fetchRequests();
    return data;
  };

  const updateRequestStatus = async (id: string, status?: string, agentId?: string) => {
    try {
      setLoading(true);
      const payload: Record<string, any> = {};
      if (status) payload.status = status;
      if (agentId) payload.agent_id = agentId;

      const { data, error } = await supabase
        .from('requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return data;
    } catch (err) {
      console.error('Failed to update request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, createRequest, updateRequestStatus, refresh: fetchRequests };
}
```

### `useSessions`

Fetches all user sessions. Used in the admin sessions view.

```ts
// hooks/useSessions.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, refresh: fetchSessions };
}
```

### `useNewRequest`

Handles the multi-step new request form submission. Gets the current user from Supabase Auth and submits the request.

```ts
// hooks/useNewRequest.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ServiceType =
  | 'Showing'
  | 'Open House'
  | 'Lockbox Drop'
  | 'Photography'
  | 'Property Report';

export interface RequestFormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  mlsNumber: string;
  clientName: string;
  clientPhone: string;
  accessNotes: string;
  lockboxCode: string;
  additionalNotes: string;
  date: string;       // 'YYYY-MM-DD'
  startTime: string;  // 'HH:MM AM/PM'
  endTime: string;
}

export function useNewRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (
    serviceType: ServiceType,
    compensation: number,
    formData: RequestFormData
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('requests')
        .insert({
          client_id: user.id,
          service_type: serviceType,
          compensation: compensation.toString(),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          mls_number: formData.mlsNumber || null,
          client_name: formData.clientName || null,
          client_phone: formData.clientPhone || null,
          access_notes: formData.accessNotes || null,
          lockbox_code: formData.lockboxCode || null,
          additional_notes: formData.additionalNotes || null,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err: any) {
      const message = err.message || 'Something went wrong';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { submitRequest, loading, error };
}
```

### `useSupportRequest`

Submits a support request. Used in the Contact Support modal on the client dashboard.

```ts
// hooks/useSupportRequest.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupportRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSupportRequest = async (
    subject: string,
    message: string,
    attachmentName?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!subject.trim() || !message.trim()) {
        throw new Error('Subject and message are required');
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error: insertError } = await supabase
        .from('support_requests')
        .insert({
          user_id: user?.id ?? null,
          subject: subject.trim(),
          message: message.trim(),
          attachment_name: attachmentName?.trim() || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitSupportRequest, loading, error };
}
```

### `useJobActions`

Handles accepting and declining jobs from the jobs feed. Mirrors the `handleJobAction` logic in `ClientDashboard`.

```ts
// hooks/useJobActions.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRequests } from './useRequests';

export function useJobActions() {
  const { updateRequestStatus } = useRequests();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const acceptJob = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await updateRequestStatus(requestId, 'ACTIVE', user?.id);
    setSuccessMessage('Job accepted and moved to Active.');
  };

  const declineJob = async (requestId: string) => {
    await updateRequestStatus(requestId, 'CANCELLED');
    setSuccessMessage('Job declined and moved to History.');
  };

  return { acceptJob, declineJob, successMessage };
}
```

### `useOpportunityApply`

Handles applying for an opportunity from the opportunities feed. Mirrors the `onApply` logic in `OpportunitiesPage`.

```ts
// hooks/useOpportunityApply.ts
import { supabase } from '@/lib/supabase';
import { useRequests } from './useRequests';

export function useOpportunityApply() {
  const { updateRequestStatus } = useRequests();

  const applyForOpportunity = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please log in to apply.');
    await updateRequestStatus(requestId, 'ACTIVE', user.id);
  };

  return { applyForOpportunity };
}
```

---

## 7. Feature Modules

### Authentication Screens

**Login Screen**
- Email + password inputs
- Calls `supabase.auth.signInWithPassword({ email, password })`
- On success → navigate to Client Dashboard
- On error → display `error.message`

**Signup Screen**
- Full name, email, role selector, password inputs
- Calls `supabase.auth.signUp(...)` with `options.data` for `full_name` and `role`
- After sign up → inserts row into `users` table with the returned `user.id`
- On success → navigate to Client Dashboard

**Sign Out**
- Calls `supabase.auth.signOut()`
- Navigate to Login screen

---

### Client Dashboard

**Stats displayed:**
- Active Requests — count of requests with status `PENDING` or `ACTIVE`
- Upcoming Showings — active/pending requests where `date >= today`
- Open Opportunities — total request count
- Total Earned — static `$0.00` (not yet wired to earnings data)

**Action cards (navigate to New Request screen with pre-selected service type):**
- Request a Showing → `?type=Showing`
- Host Open House → `?type=Open House`
- Lockbox Drop → `?type=Lockbox Drop`
- Property Photos → `?type=Photography`
- Property Report → `?type=Property Report`

**Agent Dashboard section (tabs):**
- Jobs Feed — all `PENDING` requests
- Pending — requests with status `PENDING`
- Active — requests with status `ACTIVE`
- History — requests with status `COMPLETED` or `CANCELLED`

**Job card actions:**
- Accept → `updateRequestStatus(id, 'ACTIVE', currentUser.id)`
- Decline → `updateRequestStatus(id, 'CANCELLED')`

**Contact Support modal:**
- Subject (required), Message (required), Attachment name (optional)
- Submits via `useSupportRequest`

---

### New Request (Multi-Step Form)

4-step wizard:

**Step 1 — Service Type**
Select one of: `Showing`, `Open House`, `Lockbox Drop`, `Photography`, `Property Report`

**Step 2 — Property Details**
- Address (required), City (required), State (required), ZIP (required, 5 digits)
- MLS Number, Client Name, Client Phone, Access Notes, Lockbox Code, Additional Notes (all optional)

**Step 3 — Schedule & Compensation**
- Date (date picker), Start Time, End Time (required)
- Compensation slider: $35–$150, default $65

**Step 4 — Review & Submit**
- Summary of all entered data
- Submit calls `useNewRequest.submitRequest(serviceType, compensation, formData)`
- On success → navigate to Bookings screen

**Validation rules:**
- Step 2: address, city, state, zip required; zip must be exactly 5 digits
- Step 3: date, startTime, endTime required

---

### Bookings Screen

Displays all requests with tab filtering:

| Tab | Filter |
|---|---|
| All | All requests |
| Active | `status === 'PENDING' \|\| status === 'ACTIVE'` |
| Completed | `status === 'COMPLETED'` |
| Cancelled | `status === 'CANCELLED'` |
| As Agent | Requests where `agent_id === currentUser.id` (not yet implemented in web) |

Each booking row shows: address, city/state, date, time window, fee, and a status selector that calls `updateRequestStatus`.

---

### Opportunities Screen

Displays all `PENDING` requests as cards. Agents browse and apply.

**Filter bar:** All Types, Showing, Open House, Lockbox Drop, Photography, Property Report

**Opportunity card:**
- Shows: service type emoji, address, city/state, date, time window, compensation
- "View Details & Apply" button opens a detail modal
- Confirm & Apply → calls `supabase.auth.getUser()` then `updateRequestStatus(id, 'ACTIVE', user.id)`

---

### Admin Dashboard

Requires `role === 'ADMIN'` or `role === 'SUPERADMIN'`.

**Stats:** Total Users, Total Requests, Pending Sync (PENDING count), Live Shows (ACTIVE count)

**User Management table columns:** Name/Email, Role, Status (Active/Disabled), Last IP, Last Seen, Actions (Edit, Disable, Delete)

**Recent Requests table columns:** Service Type, Property Address, Date, Compensation, Status, Details button

**Sign Out:** calls `supabase.auth.signOut()` then navigates to Login

---

### Profile Screen

- Display full name (editable), email (read-only)
- Job title selector (carousel-style)
- Change password button
- Email changes require contacting an admin

---

## 8. Navigation Structure

Suggested Expo Router / React Navigation structure mirroring the web app's route layout:

```
(auth)
  login
  signup

(client)           ← requires authenticated user
  index            ← Client Dashboard
  new-request      ← Multi-step form
  bookings
  opportunities
  profile

(admin)            ← requires role ADMIN or SUPERADMIN
  index            ← Admin Overview
  sessions
  create-user

no-access          ← shown when role check fails
```

**Route guard pattern:**

```ts
// Check role on protected screens
const { user } = useCurrentUser();

useEffect(() => {
  if (!user) {
    router.replace('/login');
  }
}, [user]);
```

---

## 9. Environment Variables

Create a `.env` file at the project root. Expo requires the `EXPO_PUBLIC_` prefix for variables accessible in client code.

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> The web app uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Rename these with the `EXPO_PUBLIC_` prefix for the mobile app.

Access them in code:

```ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
```

---

## Quick Reference: Supabase Calls by Feature

| Feature | Supabase Call |
|---|---|
| Sign in | `supabase.auth.signInWithPassword({ email, password })` |
| Sign up | `supabase.auth.signUp({ email, password, options: { data } })` |
| Sign out | `supabase.auth.signOut()` |
| Get current user | `supabase.auth.getUser()` |
| Get session | `supabase.auth.getSession()` |
| Listen to auth changes | `supabase.auth.onAuthStateChange(callback)` |
| Fetch all requests | `supabase.from('requests').select('*').order('created_at', { ascending: false })` |
| Create request | `supabase.from('requests').insert({...}).select().single()` |
| Accept job (agent) | `supabase.from('requests').update({ status: 'ACTIVE', agent_id }).eq('id', id)` |
| Decline job | `supabase.from('requests').update({ status: 'CANCELLED' }).eq('id', id)` |
| Fetch all users | `supabase.from('users').select('*').order('created_at', { ascending: false })` |
| Create user record | `supabase.from('users').insert({ id, full_name, email, role })` |
| Fetch sessions | `supabase.from('sessions').select('*').order('started_at', { ascending: false })` |
| Submit support request | `supabase.from('support_requests').insert({ user_id, subject, message, attachment_name })` |
