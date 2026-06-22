import { applyPlacementMetadata, rankServiceResults } from '@/src/lib/marketplace/placements';
import type {
  BookingInitiator,
  BookingStatus,
  ConversationWithParticipants,
  DashboardMetrics,
  JobRequest,
  JobRequestFilters,
  JobRequestWithClient,
  JobUrgency,
  Message,
  Notification,
  NotificationType,
  PaginatedResult,
  ServiceCategory,
  ServiceFilters,
  ServiceWithProvider,
  UserRole,
  BookingWithDetails,
} from '@/src/lib/types';
import { prisma } from '../prisma';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers() {
  return prisma.user.findMany({
    omit: { passwordHash: true },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true },
  });
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function getServices(filters?: ServiceFilters): Promise<PaginatedResult<ServiceWithProvider>> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 12;

  const where: Parameters<typeof prisma.service.findMany>[0]['where'] = {
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
        location: { contains: filters.location, mode: 'insensitive' },
      },
    }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
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
      orderBy: { createdAt: 'desc' },
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

export async function getServiceById(serviceId: string): Promise<ServiceWithProvider | null> {
  return prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          avatar: true,
          location: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });
}

/** Most recent booking for a provider (by completion date, else start date, else created). Excludes declined. */
export async function getProvidersLastJob(providerId: string): Promise<{
  serviceTitle: string;
  category: string;
  status: BookingStatus;
  description: string;
  dateIso: string;
} | null> {
  const booking = await prisma.booking.findFirst({
    where: {
      providerId,
      status: { not: 'DECLINED' },
    },
    orderBy: [
      { completionDate: { sort: 'desc', nulls: 'last' } },
      { startDate: { sort: 'desc', nulls: 'last' } },
      { createdAt: 'desc' },
    ],
    select: {
      status: true,
      description: true,
      completionDate: true,
      startDate: true,
      createdAt: true,
      service: { select: { title: true, category: true } },
    },
  });

  if (!booking) return null;

  return {
    serviceTitle: booking.service.title,
    category: booking.service.category,
    status: booking.status as BookingStatus,
    description: booking.description,
    dateIso: (booking.completionDate ?? booking.startDate ?? booking.createdAt).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

const bookingInclude = {
  service: { select: { id: true, title: true, category: true } },
  client: { select: { id: true, name: true, avatar: true } },
  provider: { select: { id: true, name: true, avatar: true, rating: true } },
  jobRequest: { select: { title: true } },
} as const;

/** Map a raw Prisma booking (with includes) to BookingWithDetails. */
function toBookingWithDetails(
  booking: Awaited<ReturnType<typeof prisma.booking.findFirst<{ include: typeof bookingInclude }>>>
): BookingWithDetails {
  if (!booking) throw new Error('toBookingWithDetails called with null');
  return {
    ...booking,
    totalAmount: booking.totalAmount.toNumber(),
    platformFee: booking.platformFee.toNumber(),
    startDate: booking.startDate.toISOString(),
    completionDate: booking.completionDate?.toISOString(),
    cancelledAt: booking.cancelledAt?.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    status: booking.status as BookingStatus,
    initiatedBy: booking.initiatedBy as BookingInitiator,
    service: booking.service ?? {
      id: '',
      title: booking.jobRequest?.title ?? 'Service',
      category: 'Cleaning' as ServiceCategory,
    },
    client: booking.client ?? undefined,
    provider: booking.provider ?? undefined,
    jobRequestTitle: booking.jobRequest?.title,
  };
}

export async function getBookings(userId: string, role: UserRole): Promise<BookingWithDetails[]> {
  const bookings = await prisma.booking.findMany({
    where: role === 'CLIENT' ? { clientId: userId } : { providerId: userId },
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  });
  return bookings.map(toBookingWithDetails);
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingInclude,
  });
  return booking ? toBookingWithDetails(booking) : null;
}

export async function getActiveBookingFor(
  clientId: string,
  serviceId: string
): Promise<BookingWithDetails | null> {
  const booking = await prisma.booking.findFirst({
    where: {
      clientId,
      serviceId,
      status: { in: ['PENDING', 'PROPOSAL_SENT', 'ACCEPTED', 'IN_PROGRESS'] },
    },
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  });
  return booking ? toBookingWithDetails(booking) : null;
}

// ---------------------------------------------------------------------------
// Dashboard Metrics
// ---------------------------------------------------------------------------

export async function getDashboardMetrics(userId: string, role: UserRole): Promise<DashboardMetrics> {
  if (role === 'CLIENT') {
    const [totalBookings, activeBookings, completedAgg] = await Promise.all([
      prisma.booking.count({ where: { clientId: userId } }),
      prisma.booking.count({
        where: { clientId: userId, status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
      }),
      prisma.booking.aggregate({
        where: { clientId: userId, status: 'COMPLETED' },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalBookings,
      activeBookings,
      completedJobs: completedAgg._count.id,
      totalSpent: completedAgg._sum.totalAmount?.toNumber() ?? 0,
    };
  }

  // PROVIDER
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalBookings, activeBookings, completedAgg, monthlyAgg, provider] = await Promise.all([
    prisma.booking.count({ where: { providerId: userId } }),
    prisma.booking.count({
      where: { providerId: userId, status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
    }),
    // Net earnings = totalAmount - platformFee, but Prisma can't subtract two aggregated
    // columns directly — sum both and subtract in JS.
    prisma.booking.aggregate({
      where: { providerId: userId, status: 'COMPLETED' },
      _count: { id: true },
      _sum: { totalAmount: true, platformFee: true },
    }),
    prisma.booking.aggregate({
      where: { providerId: userId, status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true, platformFee: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { rating: true } }),
  ]);

  const completedJobs = completedAgg._count.id;
  const totalEarned =
    (completedAgg._sum.totalAmount?.toNumber() ?? 0) -
    (completedAgg._sum.platformFee?.toNumber() ?? 0);
  const monthlyEarnings =
    (monthlyAgg._sum.totalAmount?.toNumber() ?? 0) -
    (monthlyAgg._sum.platformFee?.toNumber() ?? 0);
  const completionRate =
    totalBookings > 0 ? Math.round((completedJobs / totalBookings) * 100) : 0;

  return {
    totalBookings,
    activeBookings,
    totalEarned,
    averageRating: provider?.rating ?? undefined,
    completionRate,
    completedJobs,
    monthlyEarnings,
  };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getNotifications(userId: string): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((n) => ({
    ...n,
    type: n.type as NotificationType,
    createdAt: n.createdAt.toISOString(),
    actionUrl: n.actionUrl ?? undefined,
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

// ---------------------------------------------------------------------------
// Job Requests
// ---------------------------------------------------------------------------

export async function getJobRequests(
  filters?: JobRequestFilters
): Promise<PaginatedResult<JobRequestWithClient>> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;

  const where: Parameters<typeof prisma.jobRequest.findMany>[0]['where'] = {
    status: 'OPEN',
    ...(filters?.category && { category: filters.category }),
    ...(filters?.urgency && { urgency: filters.urgency }),
    ...(filters?.location && {
      location: { contains: filters.location, mode: 'insensitive' },
    }),
    ...(filters?.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
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
      urgency: req.urgency as JobUrgency,
      budgetMin: req.budgetMin.toNumber(),
      budgetMax: req.budgetMax.toNumber(),
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
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
  const req = await prisma.jobRequest.findUnique({ where: { id: jobRequestId } });
  if (!req) return null;
  return {
    ...req,
    category: req.category as ServiceCategory,
    urgency: req.urgency as JobUrgency,
    status: req.status as 'OPEN' | 'ASSIGNED' | 'CLOSED',
    budgetMin: req.budgetMin.toNumber(),
    budgetMax: req.budgetMax.toNumber(),
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Conversations & Messages
// ---------------------------------------------------------------------------

export async function getConversations(userId: string): Promise<ConversationWithParticipants[]> {
  const convs = await prisma.conversation.findMany({
    where: { participants: { has: userId } },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  const otherUserIds = convs.map((c) => c.participants.find((p) => p !== userId)!).filter(Boolean);
  const otherUsers = await prisma.user.findMany({
    where: { id: { in: otherUserIds } },
    select: { id: true, name: true, avatar: true, role: true },
  });
  const userMap = Object.fromEntries(otherUsers.map((u) => [u.id, u]));

  return convs.map((conv) => {
    const otherId = conv.participants.find((p) => p !== userId)!;
    const other = userMap[otherId];
    return {
      ...conv,
      lastMessageAt: conv.lastMessageAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      otherUser: {
        id: other.id,
        name: other.name,
        avatar: other.avatar ?? undefined,
        role: other.role as UserRole,
      },
      messages: conv.messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        attachment: m.attachment ?? undefined,
      })),
    };
  });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    attachment: m.attachment ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Client Jobs
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
    updatedAt: job.updatedAt.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const PLATFORM_FEE_RATE = 0.1;

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
  const platformFee = calculatePlatformFee(input.totalAmount);
  const booking = await prisma.booking.create({
    data: {
      serviceId: input.serviceId,
      clientId: input.clientId,
      providerId: input.providerId,
      status: input.status,
      initiatedBy: input.initiatedBy,
      totalAmount: input.totalAmount,
      platformFee,
      description: input.description,
      proposalMessage: input.proposalMessage,
      jobRequestId: input.jobRequestId,
      startDate: new Date(input.startDate),
    },
    include: bookingInclude,
  });
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
  const n = await prisma.notification.create({ data: input });
  return {
    ...n,
    type: n.type as NotificationType,
    createdAt: n.createdAt.toISOString(),
    actionUrl: n.actionUrl ?? undefined,
  };
}

export async function getProviderProposalService(
  providerId: string,
  category?: string
): Promise<{ id: string; title: string } | null> {
  // Prefer a matching category; fall back to any active service.
  const service = await prisma.service.findFirst({
    where: {
      providerId,
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true },
  });

  if (service) return service;

  // Category-specific search found nothing — try without the category filter.
  if (category) {
    return prisma.service.findFirst({
      where: { providerId, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true },
    });
  }

  return null;
}

export async function markJobRequestAssigned(jobRequestId: string): Promise<void> {
  await prisma.jobRequest.update({
    where: { id: jobRequestId },
    data: { status: 'ASSIGNED' },
  });
}

export async function reopenJobRequest(jobRequestId: string): Promise<void> {
  await prisma.jobRequest.updateMany({
    where: { id: jobRequestId, status: 'ASSIGNED' },
    data: { status: 'OPEN' },
  });
}
