import { Redirect } from 'expo-router';

// This tab just bridges the client tab bar into the admin area
export default function AdminPanelRedirect() {
  return <Redirect href={'/(admin)' as any} />;
}
