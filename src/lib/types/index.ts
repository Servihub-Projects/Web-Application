export type UserRole = 'CLIENT' | 'PROVIDER';

export type BookingStatus =
  | 'PENDING'
  | 'ESCROW_PAID'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'RELEASED'
  | 'DECLINED';

export type ServiceCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Carpentry'
  | 'Painting'
  | 'Masonry'
  | 'Interior Design'
  | 'Landscaping'
  | 'Cleaning'
  | 'Security'
  | 'HVAC'
  | 'Roofing'
  | 'Tiling';

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'GHS';

export type EscrowTransactionType =
  | 'DEPOSIT'
  | 'UPFRONT_RELEASE'
  | 'COMPLETION_RELEASE'
  | 'PLATFORM_FEE'
  | 'REFUND';

export type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_DECLINED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_RELEASED'
  | 'NEW_MESSAGE'
  | 'JOB_REVIEW'
  | 'SYSTEM';

export type JobUrgency = 'FLEXIBLE' | 'WITHIN_WEEK' | 'URGENT';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  skills?: string[];
  location?: string;
  preferredCurrency: CurrencyCode;
  isVerified: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  priceType: 'FIXED' | 'HOURLY';
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  status: BookingStatus;
  totalAmount: number;
  platformFee: number;
  escrowAmount: number;
  upfrontPaid: boolean;
  completionPaid: boolean;
  description: string;
  startDate: string;
  completionDate?: string;
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  bookingId: string;
  amount: number;
  type: EscrowTransactionType;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  bookingId?: string;
  jobRequestId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface JobRequest {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  budgetMin: number;
  budgetMax: number;
  location: string;
  urgency: JobUrgency;
  status: 'OPEN' | 'ASSIGNED' | 'CLOSED';
  createdAt: string;
}

export interface DashboardMetrics {
  totalBookings: number;
  activeBookings: number;
  totalSpent?: number;
  totalEarned?: number;
  averageRating?: number;
  completionRate?: number;
  pendingPayouts?: number;
  escrowBalance?: number;
  completedJobs?: number;
  monthlyEarnings?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  preferredCurrency: CurrencyCode;
  location?: string;
}

export interface CompleteJobResult {
  success: boolean;
  error?: string;
  updatedBooking?: Booking;
  escrowBreakdown?: {
    totalAmount: number;
    upfrontPaid: number;
    completionRelease: number;
    platformFee: number;
    providerReceives: number;
  };
}

export interface ServiceWithProvider extends Service {
  provider: Pick<User, 'id' | 'name' | 'avatar' | 'rating' | 'reviewCount' | 'location' | 'isVerified'>;
}

export interface BookingWithDetails extends Booking {
  service: Pick<Service, 'id' | 'title' | 'category'>;
  client?: Pick<User, 'id' | 'name' | 'avatar'>;
  provider?: Pick<User, 'id' | 'name' | 'avatar' | 'rating'>;
}

export interface JobRequestWithClient extends JobRequest {
  client: Pick<User, 'id' | 'name' | 'avatar' | 'isVerified' | 'location'>;
}

export interface ConversationWithParticipants extends Conversation {
  otherUser: Pick<User, 'id' | 'name' | 'avatar' | 'role'>;
  messages: Message[];
}

export interface ServiceFilters {
  category?: ServiceCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  minRating?: number;
  location?: string;
}

export interface JobRequestFilters {
  category?: ServiceCategory;
  location?: string;
  urgency?: JobUrgency;
  search?: string;
}
