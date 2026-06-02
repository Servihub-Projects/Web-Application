import {
  MOCK_USERS,
  MOCK_SERVICES,
  MOCK_BOOKINGS,
  MOCK_NOTIFICATIONS,
  MOCK_JOB_REQUESTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from '@/src/lib/constants/mockData';
import { applyPlacementMetadata, rankServiceResults } from '@/src/lib/marketplace/placements';
import type {
  User,
  ServiceWithProvider,
  BookingWithDetails,
  BookingStatus,
  DashboardMetrics,
  ServiceFilters,
  UserRole,
  Notification,
  JobRequest,
  JobRequestWithClient,
  JobRequestFilters,
  ConversationWithParticipants,
  Message,
  PaginatedResult,
  ServiceCategory,
  JobUrgency,
} from '@/src/lib/types';
import { prisma } from '../prisma';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  // DB: return await prisma.user.findMany({ omit: { passwordHash: true } });
  return MOCK_USERS.map((user) => {
    const { passwordHash, ...safeUser } = user;
    void passwordHash;
    return safeUser;
  });
}

export async function getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
  // DB: return await prisma.user.findUnique({ where: { id }, omit: { passwordHash: true } });
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function getServices(
  filters?: ServiceFilters
): Promise<PaginatedResult<ServiceWithProvider>> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 12; // 12 fits neatly in a 3-col grid

  // ─── FUTURE PRISMA SWAP ──────────────────────────────────────────
  // const where = { isActive: true, ...buildWhereClause(filters) };
  // const [paginated, total] = await Promise.all([
  //   prisma.service.findMany({
  //     where,
  //     include: { provider: true },
  //     orderBy: { createdAt: 'desc' },
  //     skip: (page - 1) * pageSize,
  //     take: pageSize,
  //   }),
  //   prisma.service.count({ where }),
  // ]);
  // ────────────────────────────────────────────────────────────────

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
    services = services.filter((s) => (s.rating ?? 0) >= filters.minRating!);
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

  const ranked = rankServiceResults(services.map((service) => {
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
  }));

  const total = ranked.length;
  const skip = (page - 1) * pageSize;
  const paginated = ranked.slice(skip, skip + pageSize);

  return {
    items: applyPlacementMetadata(paginated),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
export async function getServiceById(serviceId: string): Promise<ServiceWithProvider | null> {
  // DB: return await prisma.service.findUnique({ where: { id: serviceId }, include: { provider: true } });
  const service = MOCK_SERVICES.find((s) => s.id === serviceId);
  if (!service) return null;

  const provider = MOCK_USERS.find((u) => u.id === service.providerId);
  if (!provider) return null;

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
}
/** Most recent booking for a provider (by completion date, else start date, else created). Excludes declined. */
export async function getProvidersLastJob(providerId: string): Promise<{
  serviceTitle: string;
  category: string;
  status: BookingStatus;
  description: string;
  dateIso: string;
} | null> {
  const list = MOCK_BOOKINGS.filter(
    (b) => b.providerId === providerId && b.status !== 'DECLINED'
  );
  if (list.length === 0) return null;

  const sorted = [...list].sort((a, b) => {
    const ta = Date.parse(a.completionDate ?? a.startDate ?? a.createdAt);
    const tb = Date.parse(b.completionDate ?? b.startDate ?? b.createdAt);
    return tb - ta;
  });

  const booking = sorted[0];
  const service = MOCK_SERVICES.find((s) => s.id === booking.serviceId);
  return {
    serviceTitle: service?.title ?? 'Service',
    category: service?.category ?? '',
    status: booking.status,
    description: booking.description,
    dateIso: booking.completionDate ?? booking.startDate ?? booking.createdAt,
  };
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
    let activeBookings = 0, totalSpent = 0, completedJobs = 0;

    for (const b of userBookings) {
      if (b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS') activeBookings++;
      if (b.status === 'COMPLETED') { totalSpent += b.totalAmount; completedJobs++; }
    }

    return { totalBookings: userBookings.length, activeBookings, totalSpent, completedJobs };
  }

  // PROVIDER — single pass over the array
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let activeBookings = 0, totalEarned = 0, monthlyEarnings = 0, completedJobs = 0;

  for (const b of userBookings) {
    if (b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS') activeBookings++;
    if (b.status === 'COMPLETED') {
      const net = b.totalAmount - b.platformFee;
      totalEarned += net;
      completedJobs++;
      if (Date.parse(b.createdAt) > thirtyDaysAgo) monthlyEarnings += net;
    }
  }

  const completionRate = userBookings.length > 0
    ? Math.round((completedJobs / userBookings.length) * 100)
    : 0;

  const provider = MOCK_USERS.find((u) => u.id === userId);

  return {
    totalBookings: userBookings.length,
    activeBookings,
    totalEarned,
    averageRating: provider?.rating,
    completionRate,
    completedJobs,
    monthlyEarnings,
  };
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

// src/lib/actions/job-requests.ts  (or wherever your function lives)

export async function getJobRequests(
  filters?: JobRequestFilters
): Promise<PaginatedResult<JobRequestWithClient>> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;

  const where = {
    status: 'OPEN' as const,
    ...(filters?.category && { category: filters.category }),
    ...(filters?.urgency && { urgency: filters.urgency }),
    ...(filters?.location && {
      location: { contains: filters.location, mode: 'insensitive' as const },
    }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
        { category: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [paginated, total] = await Promise.all([
    prisma.jobRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
            location: true,
          },
        },
      },
    }),
    prisma.jobRequest.count({ where }),
  ]);

  return {
    items: paginated.map((req) => ({
      ...req,
      category: req.category as ServiceCategory,
      budgetMin: req.budgetMin.toNumber(),
      budgetMax: req.budgetMax.toNumber(),
      createdAt: req.createdAt.toISOString(),
      status: req.status as 'OPEN' | 'ASSIGNED' | 'CLOSED',
      client: {
        id: req.client.id,
        name: req.client.name,
        avatar: req.client.avatar ?? undefined,
        location: req.client.location ?? undefined,
        isVerified: req.client.isVerified,
      },
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
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
  const jobs = await prisma.jobRequest.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });

  return jobs.map((job) => ({
    ...job,
    category: job.category as ServiceCategory,
    urgency: job.urgency as JobUrgency,
    status: job.status as 'OPEN' | 'ASSIGNED' | 'CLOSED',
    budgetMin: job.budgetMin.toNumber(),
    budgetMax: job.budgetMax.toNumber(),
    createdAt: job.createdAt.toISOString(),
  }));
}
