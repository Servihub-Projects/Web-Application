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
  Booking,
  BookingInitiator,
  ServiceWithProvider,
  BookingWithDetails,
  BookingStatus,
  DashboardMetrics,
  ServiceFilters,
  UserRole,
  Notification,
  NotificationType,
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
import { PrismaClient } from '@/generated/prisma';

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

export async function getServices(filters?: ServiceFilters): Promise<PaginatedResult<ServiceWithProvider>> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 12;

  const where: prisma.ServiceWhereInput = {
    isActive: true,
    ...(filters?.category && { category: filters.category }),
    ...(filters?.minPrice !== undefined || filters?.maxPrice !== undefined
      ? {
        price: {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      }
      : {}),
    ...(filters?.minRating !== undefined && {
      rating: { gte: filters.minRating },
    }),
    ...(filters?.location && {
      provider: {
        location: { contains: filters.location, mode: "insensitive" },
      },
    }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
        { tags: { hasSome: [filters.search] } },
      ],
    }),
  };

  const [raw, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            location: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.service.count({ where }),
  ]);

  const ranked = rankServiceResults(raw);

  return {
    items: applyPlacementMetadata(ranked),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}


// Get services by id
export async function getServiceById(serviceId: string): Promise<ServiceWithProvider | null> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }, include: {
      provider: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          avatar: true,
          location: true,
          rating: true,
          reviewCount: true,
        }
      }
    }
  });
  if (!service) return null;
  return service
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

/** Hydrate a raw booking with its service/client/provider/job-request details. */
function toBookingWithDetails(booking: (typeof MOCK_BOOKINGS)[number]): BookingWithDetails {
  const service = MOCK_SERVICES.find((s) => s.id === booking.serviceId);
  const client = MOCK_USERS.find((u) => u.id === booking.clientId);
  const provider = MOCK_USERS.find((u) => u.id === booking.providerId);
  const jobRequest = booking.jobRequestId
    ? MOCK_JOB_REQUESTS.find((r) => r.id === booking.jobRequestId)
    : undefined;

  return {
    ...booking,
    // Guard against a dangling serviceId so a single bad row can't crash the page.
    // Proposals always carry a jobRequest, so its category is the natural fallback.
    service: service
      ? { id: service.id, title: service.title, category: service.category }
      : {
        id: booking.serviceId,
        title: jobRequest?.title ?? 'Service',
        category: jobRequest?.category ?? ('Cleaning' as ServiceCategory),
      },
    client: client
      ? { id: client.id, name: client.name, avatar: client.avatar }
      : undefined,
    provider: provider
      ? { id: provider.id, name: provider.name, avatar: provider.avatar, rating: provider.rating }
      : undefined,
    jobRequestTitle: jobRequest?.title,
  };
}

export async function getBookings(
  userId: string,
  role: UserRole
): Promise<BookingWithDetails[]> {
  // DB: return await prisma.booking.findMany({ where: role === 'CLIENT' ? { clientId: userId } : { providerId: userId }, include: { service: true, client: true, provider: true, jobRequest: true }, orderBy: { createdAt: 'desc' } });
  const bookings = MOCK_BOOKINGS.filter((b) =>
    role === 'CLIENT' ? b.clientId === userId : b.providerId === userId
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return bookings.map(toBookingWithDetails);
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  // DB: const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true, client: true, provider: true, jobRequest: true } }); return b;
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
  return booking ? toBookingWithDetails(booking) : null;
}

/**
 * Find a client's most recent open/active booking with a given provider for a
 * specific service. Used to stop a client from firing duplicate hire requests
 * and to reflect the current state in the hire UI.
 */
export async function getActiveBookingFor(
  clientId: string,
  serviceId: string
): Promise<BookingWithDetails | null> {
  // DB: prisma.booking.findFirst({ where: { clientId, serviceId, status: { in: [...] } }, orderBy: { createdAt: 'desc' }, include: {...} })
  const open: BookingStatus[] = ['PENDING', 'PROPOSAL_SENT', 'ACCEPTED', 'IN_PROGRESS'];
  const booking = MOCK_BOOKINGS.filter(
    (b) => b.clientId === clientId && b.serviceId === serviceId && open.includes(b.status)
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];

  return booking ? toBookingWithDetails(booking) : null;
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
export async function getJobRequestById(jobRequestId: string): Promise<JobRequest | null> {
  // DB: return await prisma.jobRequest.findUnique({ where: { id: jobRequestId } });
  return MOCK_JOB_REQUESTS.find((r) => r.id === jobRequestId) ?? null;
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

// ---------------------------------------------------------------------------
// Mutations (booking workflow)
//
// These mutate the in-memory mock store. Each has its Prisma equivalent noted
// above it so the server actions that call them stay unchanged when the data
// layer is swapped to the database.
// ---------------------------------------------------------------------------

let bookingSeq = 0;
let notificationSeq = 0;

const PLATFORM_FEE_RATE = 0.1; // 10% — kept here so fee logic has one home.

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_RATE);
}

export interface CreateBookingInput {
  serviceId: string;
  clientId: string;
  providerId: string;
  status: BookingStatus;
  initiatedBy: BookingInitiator;
  totalAmount: number;
  description: string;
  startDate: string;
  proposalMessage?: string;
  jobRequestId?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingWithDetails> {
  // DB: const created = await prisma.booking.create({ data: { ...input, platformFee }, include: {...} }); return created;
  const booking: Booking = {
    id: `bkg_${Date.now()}_${bookingSeq++}`,
    serviceId: input.serviceId,
    clientId: input.clientId,
    providerId: input.providerId,
    status: input.status,
    initiatedBy: input.initiatedBy,
    totalAmount: input.totalAmount,
    platformFee: calculatePlatformFee(input.totalAmount),
    description: input.description,
    proposalMessage: input.proposalMessage,
    jobRequestId: input.jobRequestId,
    startDate: input.startDate,
    createdAt: new Date().toISOString(),
  };

  MOCK_BOOKINGS.push(booking);
  return toBookingWithDetails(booking);
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  // DB: return await prisma.notification.create({ data: input });
  const notification: Notification = {
    id: `notif_${Date.now()}_${notificationSeq++}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...input,
  };

  MOCK_NOTIFICATIONS.push(notification);
  return notification;
}

/**
 * Pick the service a provider should attach to a proposal: prefer an active
 * service in the job's category, otherwise the provider's first active service.
 * Returns null when the provider has published no services yet.
 */
export async function getProviderProposalService(
  providerId: string,
  category?: string
): Promise<{ id: string; title: string } | null> {
  // DB: prisma.service.findFirst({ where: { providerId, isActive: true, ...(category ? { category } : {}) }, orderBy: { createdAt: 'asc' } })
  const active = MOCK_SERVICES.filter((s) => s.providerId === providerId && s.isActive);
  if (active.length === 0) return null;
  const match = category ? active.find((s) => s.category === category) : undefined;
  const service = match ?? active[0];
  return { id: service.id, title: service.title };
}

export async function markJobRequestAssigned(jobRequestId: string): Promise<void> {
  // DB: await prisma.jobRequest.update({ where: { id: jobRequestId }, data: { status: 'ASSIGNED' } });
  const jobRequest = MOCK_JOB_REQUESTS.find((r) => r.id === jobRequestId);
  if (jobRequest) jobRequest.status = 'ASSIGNED';
}

export async function reopenJobRequest(jobRequestId: string): Promise<void> {
  // DB: await prisma.jobRequest.updateMany({ where: { id: jobRequestId, status: 'ASSIGNED' }, data: { status: 'OPEN' } });
  const jobRequest = MOCK_JOB_REQUESTS.find((r) => r.id === jobRequestId);
  if (jobRequest && jobRequest.status === 'ASSIGNED') jobRequest.status = 'OPEN';
}
