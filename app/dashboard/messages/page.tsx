import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getConversations } from '@/src/lib/data';
import MessagesView from '@/src/components/dashboard/messages/messages-view';

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const conversations = await getConversations(user.id);

  return (
    <div className="flex max-w-full flex-col gap-3 max-md:-mx-6 max-md:min-h-0 max-md:px-4 md:mx-0 md:space-y-4 md:px-0">
      <div className="shrink-0 md:space-y-1">
        <h1 className="text-lg font-bold text-[var(--dash-text)] md:text-xl">Messages</h1>
        <p className="text-xs text-[var(--dash-text-muted)] md:text-sm">
          Your conversations with {user.role === 'CLIENT' ? 'providers' : 'clients'}
        </p>
      </div>
      <MessagesView conversations={conversations} currentUserId={user.id} />
    </div>
  );
}
