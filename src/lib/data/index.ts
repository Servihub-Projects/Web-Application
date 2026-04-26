import {
  MOCK_USERS,
  MOCK_SERVICES,
  MOCK_BOOKINGS,
  MOCK_ESCROW_TRANSACTIONS,
  MOCK_NOTIFICATIONS,
  MOCK_JOB_REQUESTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from '@/src/lib/constants/mockData';
import type {
  User,
  ServiceWithProvider,
  BookingWithDetails,
  DashboardMetrics,
  ServiceFilters,
  UserRole,
  Notification,
  JobRequest,
  JobRequestWithClient,
  JobRequestFilters,
  ConversationWithParticipants,
  Message,
} from '@/src/lib/types';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  // DB: return await prisma.user.findMany({ omit: { passwordHash: true } });
  return MOCK_USERS.map(({ passwordHash: _, ...u }) => u);
}

export async function getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
  // DB: return await prisma.user.findUnique({ where: { id }, omit: { passwordHash: true } });
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash: _, ...rest } = user;
  return rest;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function getServices(filters?: ServiceFilters): Promise<ServiceWithProvider[]> {
  // DB: return await prisma.service.findMany({ where: buildWhereClause(filters), include: { provider: true } });
  let services = MOCK_SERVICES.filter((s) => s.isActive);

  if (filters?.category) {
    services = services.filter((s) => s.category === filters.category);
  }
  if (filters?.location) {
    const loc = filters.location.toLowerCase();
    services = services.filter((s) => {
      const provider = MOCK_USERS.find((u) => u.id === s.providerId);
      return provider?.location?.toLowerCase().includes(loc);
    });
  }
  if (filters?.minPrice !== undefined) {
    services = services.filter((s) => s.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    services = services.filter((s) => s.price <= filters.maxPrice!);
  }
  if (filters?.minRating !== undefined) {
    services = services.filter((s) => s.rating >= filters.minRating!);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    services = services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q)
    );
  }

  return services.map((service) => {
    const provider = MOCK_USERS.find((u) => u.id === service.providerId)!;
    return {
      ...service,
      provider: {
        id: provider.id,
        name: provider.name,
        avatar: provider.avatar,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        location: provider.location,
        isVerified: provider.isVerified,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function getBookings(
  userId: string,
  role: UserRole
): Promise<BookingWithDetails[]> {
  // DB: return await prisma.booking.findMany({ where: role === 'CLIENT' ? { clientId: userId } : { providerId: userId }, include: { service: true, client: true, provider: true }, orderBy: { createdAt: 'desc' } });
  const bookings = MOCK_BOOKINGS.filter((b) =>
    role === 'CLIENT' ? b.clientId === userId : b.providerId === userId
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return bookings.map((booking) => {
    const service = MOCK_SERVICES.find((s) => s.id === booking.serviceId)!;
    const client = MOCK_USERS.find((u) => u.id === booking.clientId);
    const provider = MOCK_USERS.find((u) => u.id === booking.providerId);

    return {
      ...booking,
      service: { id: service.id, title: service.title, category: service.category },
      client: client
        ? { id: client.id, name: client.name, avatar: client.avatar }
        : undefined,
      provider: provider
        ? { id: provider.id, name: provider.name, avatar: provider.avatar, rating: provider.rating }
        : undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Dashboard Metrics
// ---------------------------------------------------------------------------

export async function getDashboardMetrics(
  userId: string,
  role: UserRole
): Promise<DashboardMetrics> {
  // DB: complex aggregation — replace with prisma.$queryRaw or aggregation methods.
  const userBookings = MOCK_BOOKINGS.filter((b) =>
    role === 'CLIENT' ? b.clientId === userId : b.providerId === userId
  );

  if (role === 'CLIENT') {
    let activeBookings = 0, totalSpent = 0, escrowBalance = 0, completedJobs = 0;

    for (const b of userBookings) {
      if (b.status === 'PENDING' || b.status === 'ESCROW_PAID' || b.status === 'IN_PROGRESS') activeBookings++;
      if (b.status === 'COMPLETED' || b.status === 'RELEASED') { totalSpent += b.totalAmount; completedJobs++; }
      if (b.status === 'IN_PROGRESS' || b.status === 'ESCROW_PAID') escrowBalance += b.escrowAmount;
    }

    return { totalBookings: userBookings.length, activeBookings, totalSpent, completedJobs, escrowBalance };
  }

  // PROVIDER — single pass over the array
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let activeBookings = 0, totalEarned = 0, pendingPayouts = 0, monthlyEarnings = 0, releasedCount = 0;

  for (const b of userBookings) {
    if (b.status === 'PENDING' || b.status === 'ESCROW_PAID' || b.status === 'IN_PROGRESS') activeBookings++;
    if (b.status === 'RELEASED') {
      const net = b.totalAmount - b.platformFee;
      totalEarned += net;
      releasedCount++;
      if (Date.parse(b.createdAt) > thirtyDaysAgo) monthlyEarnings += net;
    }
    if (b.status === 'COMPLETED') pendingPayouts += b.totalAmount * 0.5 - b.platformFee;
  }

  const completionRate = userBookings.length > 0
    ? Math.round((releasedCount / userBookings.length) * 100)
    : 0;

  const provider = MOCK_USERS.find((u) => u.id === userId);

  return {
    totalBookings: userBookings.length,
    activeBookings,
    totalEarned,
    averageRating: provider?.rating,
    completionRate,
    pendingPayouts,
    monthlyEarnings,
  };
}

// ---------------------------------------------------------------------------
// Escrow
// ---------------------------------------------------------------------------

export async function getEscrowTransactions(bookingId: string) {
  // DB: return await prisma.escrowTransaction.findMany({ where: { bookingId } });
  return MOCK_ESCROW_TRANSACTIONS.filter((t) => t.bookingId === bookingId);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getNotifications(userId: string): Promise<Notification[]> {
  // DB: return await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  // DB: return await prisma.notification.count({ where: { userId, isRead: false } });
  return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId && !n.isRead).length;
}

// ---------------------------------------------------------------------------
// Job Requests (providers find client work)
// ---------------------------------------------------------------------------

export async function getJobRequests(filters?: JobRequestFilters): Promise<JobRequestWithClient[]> {
  // DB: return await prisma.jobRequest.findMany({ where: { status: 'OPEN', ...buildWhereClause(filters) }, include: { client: true }, orderBy: { createdAt: 'desc' } });
  let requests = MOCK_JOB_REQUESTS.filter((r) => r.status === 'OPEN');

  if (filters?.category) {
    requests = requests.filter((r) => r.category === filters.category);
  }
  if (filters?.location) {
    const loc = filters.location.toLowerCase();
    requests = requests.filter((r) => r.location.toLowerCase().includes(loc));
  }
  if (filters?.urgency) {
    requests = requests.filter((r) => r.urgency === filters.urgency);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    requests = requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }

  return requests
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((req) => {
      const client = MOCK_USERS.find((u) => u.id === req.clientId)!;
      return {
        ...req,
        client: {
          id: client.id,
          name: client.name,
          avatar: client.avatar,
          isVerified: client.isVerified,
          location: client.location,
        },
      };
    });
}

// ---------------------------------------------------------------------------
// Conversations & Messages
// ---------------------------------------------------------------------------

export async function getConversations(userId: string): Promise<ConversationWithParticipants[]> {
  // DB: return await prisma.conversation.findMany({ where: { participants: { has: userId } }, include: { messages: { orderBy: { createdAt: 'asc' } } }, orderBy: { lastMessageAt: 'desc' } });
  const convs = MOCK_CONVERSATIONS.filter((c) => c.participants.includes(userId)).sort(
    (a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)
  );

  return convs.map((conv) => {
    const otherId = conv.participants.find((p) => p !== userId)!;
    const other = MOCK_USERS.find((u) => u.id === otherId)!;
    const messages = MOCK_MESSAGES.filter((m) => m.conversationId === conv.id).sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    );

    return {
      ...conv,
      otherUser: { id: other.id, name: other.name, avatar: other.avatar, role: other.role },
      messages,
    };
  });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  // DB: return await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  return MOCK_MESSAGES.filter((m) => m.conversationId === conversationId).sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
}

// ---------------------------------------------------------------------------
// Client Jobs (job listings posted by a client)
// ---------------------------------------------------------------------------

export async function getClientJobs(clientId: string): Promise<JobRequest[]> {
  // DB: return await prisma.jobRequest.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' } });
  return MOCK_JOB_REQUESTS.filter((r) => r.clientId === clientId).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}
