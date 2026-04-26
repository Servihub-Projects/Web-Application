import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import SettingsView from '@/src/components/dashboard/settings/settings-view';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return <SettingsView user={user} />;
}
