export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export type BookingStatus =
  | 'PROPOSAL_SENT' // provider → client: awaiting the client's review of a proposal
  | 'PENDING' // client → provider: hire request awaiting the provider's response
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DECLINED' // provider declined a hire request, or client rejected a proposal
  | 'CANCELLED'
  | 'DISPUTED';

/** Who initiated the booking — determines which side acts next while it is open. */
export type BookingInitiator = 'CLIENT' | 'PROVIDER';

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

export type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_DECLINED'
  | 'BOOKING_COMPLETED'
  | 'NEW_MESSAGE'
  | 'JOB_REVIEW'
  | 'SYSTEM';

export type JobUrgency = 'FLEXIBLE' | 'WITHIN_WEEK' | 'URGENT';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobRequestFilters {
  category?: ServiceCategory;
  location?: string;
  urgency?: JobUrgency;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ServiceFilters {
  category?: ServiceCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export type MarketplacePlacementKind = 'ORGANIC' | 'SPONSORED' | 'BOOSTED' | 'BANNER';

export interface MarketplacePlacement {
  kind: MarketplacePlacementKind;
  slot: number;
  source: 'organic' | 'promotion';
  campaignId?: string;
  trackingKey?: string;
  priority?: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  yearsOfExperience?: number;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  skills?: string[];
  location?: string;
  preferredCurrency: CurrencyCode;
  isVerified: boolean;
  providerDetailsCompleted?: boolean;
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
  /** Which side opened the booking. Drives whose action is pending while open. */
  initiatedBy: BookingInitiator;
  totalAmount: number;
  platformFee: number;
  description: string;
  /** Provider's pitch when this booking originated as a proposal to a job request. */
  proposalMessage?: string;
  /** Set when a proposal is sent in response to a client's job request. */
  jobRequestId?: string;
  startDate: string;
  completionDate?: string;
  cancelledAt?: string;
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

export interface MessageAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** Preview or download URL (object URL locally, CDN when wired server-side). */
  url: string;
}

export type MessageUploadStatus = 'uploading' | 'success' | 'error';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  attachment?: MessageAttachment;
  uploadStatus?: MessageUploadStatus;
  uploadError?: string;
  /** Set only client-side when simulating uploads so Retry can replay the upload. */
  localFile?: File;
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
  completedJobs?: number;
  totalSpent?: number;
  totalEarned?: number;
  averageRating?: number;
  completionRate?: number;
  monthlyEarnings?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  yearsOfExperience?: number;
  hourlyRate?: number;
  skills?: string[];
  preferredCurrency: CurrencyCode;
  location?: string;
  providerDetailsCompleted?: boolean;
}

export interface CompleteJobResult {
  success: boolean;
  error?: string;
  updatedBooking?: Booking;
}

export interface ServiceWithProvider extends Service {
  provider: Pick<User, 'id' | 'name' | 'avatar' | 'rating' | 'reviewCount' | 'location' | 'isVerified'>;
  placement?: MarketplacePlacement;
}

export interface BookingWithDetails extends Booking {
  service: Pick<Service, 'id' | 'title' | 'category'>;
  client?: Pick<User, 'id' | 'name' | 'avatar'>;
  provider?: Pick<User, 'id' | 'name' | 'avatar' | 'rating'>;
  /** Title of the originating job request, when this booking is a proposal. */
  jobRequestTitle?: string;
}

export type BookingActionResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

export interface JobRequestWithClient extends JobRequest {
  client: Pick<User, 'id' | 'name' | 'avatar' | 'isVerified' | 'location'>;
}

export interface ConversationWithParticipants extends Conversation {
  otherUser: Pick<User, 'id' | 'name' | 'avatar' | 'role'>;
  messages: Message[];
}
