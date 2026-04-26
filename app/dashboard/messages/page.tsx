import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getConversations } from '@/src/lib/data';
import MessagesView from '@/src/components/dashboard/messages/messages-view';

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const conversations = await getConversations(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Messages</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
          Your conversations with {user.role === 'CLIENT' ? 'providers' : 'clients'}
        </p>
      </div>
      <MessagesView conversations={conversations} currentUserId={user.id} />
    </div>
  );
}
