import 'server-only';

import crypto from 'crypto';
import {
  BookingStatus,
  EscrowLedgerEntryType,
  EscrowMilestoneStatus,
  EscrowReleaseStatus,
  EscrowReleaseType,
  EscrowStatus,
  LedgerDirection,
  NotificationType,
  OutboxEventStatus,
  PaymentIntentStatus,
  PayoutStatus,
  UserRole,
  WalletTransactionStatus,
  WalletTransactionType,
  WebhookEventStatus,
  Prisma,
  type CurrencyCode,
} from '@/generated/prisma';
import { prisma as db } from '@/src/lib/prisma';
import {
  amountToMinorUnits,
  createPaystackReference,
  initializePaystackTransaction,
  initiatePaystackTransfer,
  minorUnitsToMajor,
  verifyPaystackSignature,
  verifyPaystackTransaction,
  type PaystackTransactionVerification,
  type PaystackWebhookPayload,
} from '@/src/lib/payments/paystack';

type DecimalInput = Prisma.Decimal | number | string;
type Tx = Prisma.TransactionClient;

const MONEY_SCALE = 2;
const RELEASE_ALLOWED_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.ESCROW_PAID,
  BookingStatus.ESCROW_FUNDED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.PARTIALLY_RELEASED,
  BookingStatus.COMPLETED,
];

const RELEASE_ALLOWED_ESCROW_STATUSES: EscrowStatus[] = [
  EscrowStatus.FUNDED,
  EscrowStatus.PARTIALLY_RELEASED,
  EscrowStatus.RELEASE_PENDING,
];

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function money(value: DecimalInput) {
  const decimal = new Prisma.Decimal(value);
  if (!decimal.isFinite()) throw new Error('Money amount must be finite.');
  return decimal.toDecimalPlaces(MONEY_SCALE);
}

function positiveMoney(value: DecimalInput) {
  const decimal = money(value);
  if (decimal.lte(0)) throw new Error('Amount must be greater than zero.');
  return decimal;
}

function minDecimal(a: Prisma.Decimal, b: Prisma.Decimal) {
  return a.lt(b) ? a : b;
}

function maxZero(value: Prisma.Decimal) {
  return value.lt(0) ? new Prisma.Decimal(0) : value;
}

function serializeDecimal(value: Prisma.Decimal) {
  return Number(value.toFixed(MONEY_SCALE));
}

function providerPaymentReference(data: PaystackWebhookPayload['data']) {
  return typeof data.reference === 'string' ? data.reference : null;
}

function webhookIdempotencyKey(payload: PaystackWebhookPayload, rawBody: string) {
  const reference = providerPaymentReference(payload.data) ?? 'no_reference';
  const bodyHash = crypto.createHash('sha256').update(rawBody).digest('hex');
  return `paystack:${payload.event}:${reference}:${bodyHash}`;
}

async function audit(
  tx: Tx,
  input: {
    actorUserId?: string;
    entityType: string;
    entityId: string;
    action: string;
    metadata?: Prisma.InputJsonValue;
  }
) {
  await tx.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      metadata: input.metadata,
    },
  });
}

async function enqueueOutbox(
  tx: Tx,
  input: {
    aggregateType: string;
    aggregateId: string;
    type: string;
    payload: Prisma.InputJsonValue;
    idempotencyKey: string;
    availableAt?: Date;
  }
) {
  await tx.outboxEvent.upsert({
    where: { idempotencyKey: input.idempotencyKey },
    update: {},
    create: {
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      type: input.type,
      payload: input.payload,
      idempotencyKey: input.idempotencyKey,
      availableAt: input.availableAt,
    },
  });
}

async function createNotification(
  tx: Tx,
  input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    actionUrl?: string;
    metadata?: Prisma.InputJsonValue;
  }
) {
  await tx.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
    },
  });
}

async function ensureEscrowAccount(
  tx: Tx,
  booking: {
    id: string;
    clientId: string;
    providerId: string;
    currency: CurrencyCode;
    escrowAccount: { id: string } | null;
  }
) {
  if (booking.escrowAccount) {
    return tx.escrowAccount.findUniqueOrThrow({ where: { id: booking.escrowAccount.id } });
  }

  return tx.escrowAccount.create({
    data: {
      bookingId: booking.id,
      clientId: booking.clientId,
      workerId: booking.providerId,
      currency: booking.currency,
      status: EscrowStatus.NOT_FUNDED,
    },
  });
}

function calculateReleaseAmounts(input: {
  bookingTotal: Prisma.Decimal;
  totalPlatformFee: Prisma.Decimal;
  platformFeeAlreadyTaken: Prisma.Decimal;
  releaseAmount: Prisma.Decimal;
  remainingEscrowAfterRelease: Prisma.Decimal;
}) {
  const remainingFee = maxZero(input.totalPlatformFee.minus(input.platformFeeAlreadyTaken));
  if (remainingFee.eq(0)) {
    return { platformFee: new Prisma.Decimal(0), workerNet: input.releaseAmount };
  }

  const proportionalFee = input.releaseAmount
    .mul(input.totalPlatformFee)
    .div(input.bookingTotal)
    .toDecimalPlaces(MONEY_SCALE);

  const platformFee = input.remainingEscrowAfterRelease.eq(0)
    ? remainingFee
    : minDecimal(remainingFee, proportionalFee);
  const cappedFee = minDecimal(platformFee, input.releaseAmount);
  return {
    platformFee: cappedFee,
    workerNet: input.releaseAmount.minus(cappedFee).toDecimalPlaces(MONEY_SCALE),
  };
}

function isPrismaUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function initializeEscrowPayment(input: {
  bookingId: string;
  clientId: string;
  callbackUrl?: string;
  idempotencyKey?: string;
}) {
  const idempotencyKey = input.idempotencyKey ?? `payin:${input.bookingId}:${input.clientId}`;
  const fallbackReference = createPaystackReference('escrow');

  const setup = await db.$transaction(async (tx) => {
    const existing = await tx.paymentIntent.findUnique({ where: { idempotencyKey } });
    if (existing?.status === PaymentIntentStatus.SUCCEEDED) {
      throw new Error('This booking has already been paid into escrow.');
    }
    if (existing?.authorizationUrl && existing.providerReference) {
      return { intent: existing, shouldInitializeProvider: false };
    }

    const booking = await tx.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        client: true,
        provider: true,
        escrowAccount: true,
      },
    });

    if (!booking) throw new Error('Booking not found.');
    if (booking.clientId !== input.clientId) throw new Error('Only the client can pay for this booking.');
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.AWAITING_PAYMENT
    ) {
      throw new Error(`Cannot initialize payment for a booking with status "${booking.status}".`);
    }

    const escrowAccount = await ensureEscrowAccount(tx, booking);
    await tx.escrowAccount.update({
      where: { id: escrowAccount.id },
      data: { status: EscrowStatus.FUNDING_PENDING },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.AWAITING_PAYMENT },
    });

    const intent =
      existing ??
      (await tx.paymentIntent.create({
        data: {
          bookingId: booking.id,
          initiatedById: input.clientId,
          amount: booking.totalAmount,
          currency: booking.currency,
          providerReference: fallbackReference,
          idempotencyKey,
          status: PaymentIntentStatus.PENDING,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      }));

    await audit(tx, {
      actorUserId: input.clientId,
      entityType: 'booking',
      entityId: booking.id,
      action: 'escrow_payment_initialized',
      metadata: { paymentIntentId: intent.id, providerReference: intent.providerReference },
    });

    return { intent, shouldInitializeProvider: true, booking };
  });

  if (!setup.shouldInitializeProvider) {
    return {
      paymentIntentId: setup.intent.id,
      reference: setup.intent.providerReference,
      authorizationUrl: setup.intent.authorizationUrl,
      accessCode: setup.intent.providerAccessCode,
      idempotent: true,
    };
  }

  const booking = setup.booking;
  if (!booking) throw new Error('Booking context missing for Paystack initialization.');

  const providerReference = setup.intent.providerReference ?? fallbackReference;
  const response = await initializePaystackTransaction({
    email: booking.client.email,
    amount: amountToMinorUnits(setup.intent.amount),
    currency: setup.intent.currency,
    reference: providerReference,
    callbackUrl: input.callbackUrl,
    metadata: {
      bookingId: booking.id,
      paymentIntentId: setup.intent.id,
      escrow: true,
    },
  });

  const updated = await db.paymentIntent.update({
    where: { id: setup.intent.id },
    data: {
      providerReference: response.data.reference,
      providerAccessCode: response.data.access_code,
      authorizationUrl: response.data.authorization_url,
      rawProviderResponse: response as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    paymentIntentId: updated.id,
    reference: updated.providerReference,
    authorizationUrl: updated.authorizationUrl,
    accessCode: updated.providerAccessCode,
    idempotent: false,
  };
}

export async function verifyAndConfirmPaystackPayment(reference: string) {
  const verification = await verifyPaystackTransaction(reference);
  const data = verification.data;

  if (data.status !== 'success') {
    await db.paymentIntent.updateMany({
      where: { providerReference: reference },
      data: {
        status:
          data.status === 'abandoned'
            ? PaymentIntentStatus.ABANDONED
            : PaymentIntentStatus.FAILED,
        failureReason: data.gateway_response ?? data.status,
        failedAt: new Date(),
        rawProviderResponse: verification as unknown as Prisma.InputJsonValue,
      },
    });

    return { processed: false, status: data.status, reference };
  }

  return markEscrowDepositSucceeded({
    providerReference: data.reference,
    amountMinorUnits: data.amount,
    currency: data.currency,
    paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
    providerPayload: data,
  });
}

export async function markEscrowDepositSucceeded(input: {
  providerReference: string;
  amountMinorUnits: number;
  currency: CurrencyCode;
  paidAt: Date;
  providerPayload: PaystackTransactionVerification | PaystackWebhookPayload['data'];
}) {
  const ledgerKey = `deposit:${input.providerReference}`;

  try {
    return await db.$transaction(async (tx) => {
      const existingLedger = await tx.escrowLedgerEntry.findUnique({
        where: { idempotencyKey: ledgerKey },
      });
      if (existingLedger) {
        return {
          processed: false,
          idempotent: true,
          bookingId: existingLedger.bookingId,
          escrowAccountId: existingLedger.escrowAccountId,
        };
      }

      const intent = await tx.paymentIntent.findUnique({
        where: { providerReference: input.providerReference },
        include: {
          booking: {
            include: {
              client: true,
              provider: true,
              escrowAccount: true,
              milestones: { orderBy: { sequence: 'asc' } },
            },
          },
        },
      });

      if (!intent) throw new Error('Payment intent not found for provider reference.');
      const expectedMinorUnits = amountToMinorUnits(intent.amount);
      if (expectedMinorUnits !== input.amountMinorUnits || intent.currency !== input.currency) {
        await tx.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: PaymentIntentStatus.FAILED,
            failureReason: 'Provider amount or currency mismatch.',
            failedAt: new Date(),
            rawProviderResponse: input.providerPayload as Prisma.InputJsonValue,
          },
        });
        await audit(tx, {
          entityType: 'payment_intent',
          entityId: intent.id,
          action: 'escrow_deposit_rejected_amount_mismatch',
          metadata: {
            expectedMinorUnits,
            receivedMinorUnits: input.amountMinorUnits,
            expectedCurrency: intent.currency,
            receivedCurrency: input.currency,
          },
        });
        throw new Error('Payment amount or currency mismatch.');
      }

      const account = await ensureEscrowAccount(tx, intent.booking);
      const amount = money(intent.amount);
      const balanceAfter = money(account.availableAmount).plus(amount).toDecimalPlaces(MONEY_SCALE);

      await tx.escrowAccount.update({
        where: { id: account.id },
        data: {
          status: EscrowStatus.FUNDED,
          fundedAmount: { increment: amount },
          availableAmount: { increment: amount },
          version: { increment: 1 },
        },
      });

      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: PaymentIntentStatus.SUCCEEDED,
          paidAt: input.paidAt,
          rawProviderResponse: input.providerPayload as Prisma.InputJsonValue,
        },
      });

      await tx.booking.update({
        where: { id: intent.bookingId },
        data: {
          status: BookingStatus.ESCROW_PAID,
          escrowAmount: { increment: amount },
        },
      });

      if (intent.booking.milestones.length === 0) {
        await tx.escrowMilestone.create({
          data: {
            bookingId: intent.bookingId,
            sequence: 1,
            title: 'Full job escrow',
            amount,
            availableAmount: amount,
            status: EscrowMilestoneStatus.FUNDED,
          },
        });
      } else {
        for (const milestone of intent.booking.milestones) {
          if (milestone.status === EscrowMilestoneStatus.PENDING) {
            await tx.escrowMilestone.update({
              where: { id: milestone.id },
              data: {
                availableAmount: milestone.amount,
                status: EscrowMilestoneStatus.FUNDED,
              },
            });
          }
        }
      }

      const ledger = await tx.escrowLedgerEntry.create({
        data: {
          escrowAccountId: account.id,
          bookingId: intent.bookingId,
          paymentIntentId: intent.id,
          type: EscrowLedgerEntryType.DEPOSIT,
          direction: LedgerDirection.CREDIT,
          amount,
          currency: intent.currency,
          balanceAfter,
          idempotencyKey: ledgerKey,
          description: 'Paystack escrow deposit confirmed.',
          metadata: {
            providerReference: input.providerReference,
            amountMinorUnits: input.amountMinorUnits,
          },
        },
      });

      await createNotification(tx, {
        userId: intent.booking.clientId,
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Escrow funded',
        body: `Your escrow deposit for ${intent.booking.serviceId} has been confirmed.`,
        actionUrl: '/dashboard/my-hires',
        metadata: { bookingId: intent.bookingId, paymentIntentId: intent.id },
      });
      await createNotification(tx, {
        userId: intent.booking.providerId,
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Escrow received',
        body: 'The client payment is now safely held in escrow.',
        actionUrl: '/dashboard/bookings',
        metadata: { bookingId: intent.bookingId, paymentIntentId: intent.id },
      });

      await enqueueOutbox(tx, {
        aggregateType: 'escrow_account',
        aggregateId: account.id,
        type: 'escrow.deposit.succeeded',
        payload: { bookingId: intent.bookingId, paymentIntentId: intent.id },
        idempotencyKey: `outbox:escrow.deposit.succeeded:${intent.id}`,
      });
      await audit(tx, {
        entityType: 'booking',
        entityId: intent.bookingId,
        action: 'escrow_deposit_confirmed',
        metadata: { ledgerEntryId: ledger.id, paymentIntentId: intent.id },
      });

      return {
        processed: true,
        idempotent: false,
        bookingId: intent.bookingId,
        escrowAccountId: account.id,
        ledgerEntryId: ledger.id,
      };
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      const ledger = await db.escrowLedgerEntry.findUnique({ where: { idempotencyKey: ledgerKey } });
      if (ledger) {
        return {
          processed: false,
          idempotent: true,
          bookingId: ledger.bookingId,
          escrowAccountId: ledger.escrowAccountId,
        };
      }
    }
    throw error;
  }
}

export async function recordPaystackWebhook(input: { rawBody: string; signature: string | null }) {
  if (!verifyPaystackSignature(input.rawBody, input.signature)) {
    return { accepted: false, status: 401 as const, error: 'Invalid Paystack signature.' };
  }

  const payload = JSON.parse(input.rawBody) as PaystackWebhookPayload;
  const reference = providerPaymentReference(payload.data);
  const idempotencyKey = webhookIdempotencyKey(payload, input.rawBody);

  const webhook = await db.paystackWebhookEvent.upsert({
    where: { idempotencyKey },
    update: {},
    create: {
      event: payload.event,
      providerReference: payload.event.startsWith('transaction.') ? reference : null,
      transferReference: payload.event.startsWith('transfer.') ? reference : null,
      idempotencyKey,
      signature: input.signature,
      payload: payload as unknown as Prisma.InputJsonValue,
      status: WebhookEventStatus.RECEIVED,
    },
  });

  if (webhook.status === WebhookEventStatus.PROCESSED) {
    return { accepted: true, status: 200 as const, duplicate: true };
  }

  try {
    const claimableWebhookStatuses: WebhookEventStatus[] = [
      WebhookEventStatus.RECEIVED,
      WebhookEventStatus.FAILED,
    ];
    const claimed = await db.paystackWebhookEvent.updateMany({
      where: { id: webhook.id, status: { in: claimableWebhookStatuses } },
      data: {
        status: WebhookEventStatus.PROCESSING,
        processAttempts: { increment: 1 },
      },
    });
    if (claimed.count !== 1) {
      return { accepted: true, status: 200 as const, duplicate: true };
    }

    if (payload.event === 'charge.success' && reference && payload.data.amount && payload.data.currency) {
      await markEscrowDepositSucceeded({
        providerReference: reference,
        amountMinorUnits: payload.data.amount,
        currency: payload.data.currency,
        paidAt: payload.data.paid_at ? new Date(payload.data.paid_at) : new Date(),
        providerPayload: payload.data,
      });
    } else if (payload.event.startsWith('transfer.') && reference) {
      await recordPaystackTransferResult({
        reference,
        status: payload.event,
        providerPayload: payload.data,
      });
    }

    await db.paystackWebhookEvent.update({
      where: { id: webhook.id },
      data: { status: WebhookEventStatus.PROCESSED, processedAt: new Date() },
    });

    return { accepted: true, status: 200 as const, duplicate: false };
  } catch (error) {
    await db.paystackWebhookEvent.update({
      where: { id: webhook.id },
      data: {
        status: WebhookEventStatus.FAILED,
        lastError: error instanceof Error ? error.message : 'Unknown webhook processing error.',
      },
    });
    throw error;
  }
}

export async function acceptBookingForEscrow(input: { bookingId: string; providerId: string }) {
  const updated = await db.booking.updateMany({
    where: {
      id: input.bookingId,
      providerId: input.providerId,
      status: BookingStatus.PENDING,
    },
    data: { status: BookingStatus.AWAITING_PAYMENT },
  });

  if (updated.count !== 1) throw new Error('Only pending bookings assigned to this provider can be accepted.');

  await db.auditLog.create({
    data: {
      actorUserId: input.providerId,
      entityType: 'booking',
      entityId: input.bookingId,
      action: 'booking_accepted_awaiting_escrow_payment',
    },
  });

  return { success: true };
}

export async function declineBookingForEscrow(input: { bookingId: string; providerId: string }) {
  return db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: input.bookingId },
      include: { escrowAccount: true },
    });
    if (!booking || booking.providerId !== input.providerId) {
      throw new Error('Booking not found.');
    }
    const declineAllowedStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.AWAITING_PAYMENT,
      BookingStatus.ESCROW_PAID,
    ];
    if (!declineAllowedStatuses.includes(booking.status)) {
      throw new Error('This booking cannot be declined.');
    }

    const funded = booking.escrowAccount && money(booking.escrowAccount.availableAmount).gt(0);
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: funded ? BookingStatus.REFUND_PENDING : BookingStatus.DECLINED,
        cancelledAt: new Date(),
        cancelledReason: funded ? 'Provider declined after escrow was funded.' : 'Provider declined booking.',
      },
    });

    if (funded && booking.escrowAccount) {
      await tx.escrowAccount.update({
        where: { id: booking.escrowAccount.id },
        data: { status: EscrowStatus.REFUND_PENDING },
      });
      await enqueueOutbox(tx, {
        aggregateType: 'booking',
        aggregateId: booking.id,
        type: 'escrow.refund.required',
        payload: { bookingId: booking.id, escrowAccountId: booking.escrowAccount.id },
        idempotencyKey: `outbox:escrow.refund.required:${booking.id}`,
      });
    }

    await audit(tx, {
      actorUserId: input.providerId,
      entityType: 'booking',
      entityId: booking.id,
      action: funded ? 'booking_declined_refund_pending' : 'booking_declined',
    });

    return { success: true, refundPending: Boolean(funded) };
  });
}

export async function releaseEscrow(input: {
  bookingId: string;
  actorUserId: string;
  amount?: DecimalInput;
  milestoneId?: string;
  idempotencyKey: string;
  releaseType?: EscrowReleaseType;
  reason?: string;
}) {
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.escrowRelease.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return { release: existing, idempotent: true };
      }

      const actor = await tx.user.findUnique({
        where: { id: input.actorUserId },
        select: { id: true, role: true },
      });
      if (!actor) throw new Error('Actor not found.');

      const booking = await tx.booking.findUnique({
        where: { id: input.bookingId },
        include: { escrowAccount: true },
      });
      if (!booking || !booking.escrowAccount) throw new Error('Funded escrow account not found.');

      const isAdmin = actor.role === UserRole.ADMIN;
      if (!isAdmin && booking.clientId !== actor.id) {
        throw new Error('Only the client or an admin can release escrow.');
      }
      if (!RELEASE_ALLOWED_BOOKING_STATUSES.includes(booking.status) && !(isAdmin && booking.status === BookingStatus.DISPUTED)) {
        throw new Error(`Cannot release escrow for booking status "${booking.status}".`);
      }
      if (
        !RELEASE_ALLOWED_ESCROW_STATUSES.includes(booking.escrowAccount.status) &&
        !(isAdmin && booking.escrowAccount.status === EscrowStatus.DISPUTED)
      ) {
        throw new Error(`Cannot release escrow account with status "${booking.escrowAccount.status}".`);
      }

      const available = money(booking.escrowAccount.availableAmount);
      const releaseAmount = input.amount === undefined ? available : positiveMoney(input.amount);
      if (releaseAmount.gt(available)) {
        throw new Error('Release amount exceeds available escrow balance.');
      }

      let milestone: Awaited<ReturnType<Tx['escrowMilestone']['findUnique']>> = null;
      if (input.milestoneId) {
        milestone = await tx.escrowMilestone.findUnique({ where: { id: input.milestoneId } });
        if (!milestone || milestone.bookingId !== booking.id) {
          throw new Error('Milestone not found for this booking.');
        }
        if (releaseAmount.gt(money(milestone.availableAmount))) {
          throw new Error('Release amount exceeds available milestone balance.');
        }
      }

      const remainingAfterRelease = available.minus(releaseAmount).toDecimalPlaces(MONEY_SCALE);
      const { platformFee, workerNet } = calculateReleaseAmounts({
        bookingTotal: money(booking.totalAmount),
        totalPlatformFee: money(booking.platformFee),
        platformFeeAlreadyTaken: money(booking.escrowAccount.platformFeeAmount),
        releaseAmount,
        remainingEscrowAfterRelease: remainingAfterRelease,
      });
      if (workerNet.lte(0)) throw new Error('Release amount is fully consumed by fees.');

      const newEscrowStatus = remainingAfterRelease.eq(0)
        ? EscrowStatus.RELEASED
        : EscrowStatus.PARTIALLY_RELEASED;

      const updatedAccount = await tx.escrowAccount.updateMany({
        where: {
          id: booking.escrowAccount.id,
          version: booking.escrowAccount.version,
          availableAmount: { gte: releaseAmount },
        },
        data: {
          availableAmount: { decrement: releaseAmount },
          releasedAmount: { increment: releaseAmount },
          platformFeeAmount: { increment: platformFee },
          status: newEscrowStatus,
          version: { increment: 1 },
        },
      });
      if (updatedAccount.count !== 1) {
        throw new Error('Escrow balance changed while releasing funds. Please retry.');
      }

      if (milestone) {
        const milestoneRemaining = money(milestone.availableAmount).minus(releaseAmount);
        const milestoneUpdated = await tx.escrowMilestone.updateMany({
          where: {
            id: milestone.id,
            availableAmount: { gte: releaseAmount },
          },
          data: {
            availableAmount: { decrement: releaseAmount },
            releasedAmount: { increment: releaseAmount },
            status: milestoneRemaining.eq(0)
              ? EscrowMilestoneStatus.RELEASED
              : EscrowMilestoneStatus.PARTIALLY_RELEASED,
            completedAt: milestoneRemaining.eq(0) ? new Date() : milestone.completedAt,
          },
        });
        if (milestoneUpdated.count !== 1) {
          throw new Error('Milestone balance changed while releasing funds. Please retry.');
        }
      }

      const release = await tx.escrowRelease.create({
        data: {
          escrowAccountId: booking.escrowAccount.id,
          bookingId: booking.id,
          milestoneId: milestone?.id,
          requestedById: actor.id,
          approvedById: isAdmin ? actor.id : undefined,
          status: EscrowReleaseStatus.COMPLETED,
          releaseType:
            input.releaseType ??
            (remainingAfterRelease.eq(0) ? EscrowReleaseType.FULL : EscrowReleaseType.PARTIAL),
          amount: releaseAmount,
          platformFeeAmount: platformFee,
          workerNetAmount: workerNet,
          idempotencyKey: input.idempotencyKey,
          reason: input.reason,
          completedAt: new Date(),
        },
      });

      const wallet = await tx.wallet.upsert({
        where: {
          userId_currency: {
            userId: booking.providerId,
            currency: booking.currency,
          },
        },
        create: {
          userId: booking.providerId,
          currency: booking.currency,
          availableAmount: workerNet,
          lifetimeEarned: workerNet,
        },
        update: {
          availableAmount: { increment: workerNet },
          lifetimeEarned: { increment: workerNet },
          version: { increment: 1 },
        },
      });

      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.ESCROW_RELEASE,
          status: WalletTransactionStatus.COMPLETED,
          direction: LedgerDirection.CREDIT,
          amount: workerNet,
          currency: booking.currency,
          balanceAfter: money(wallet.availableAmount),
          idempotencyKey: `wallet:escrow_release:${release.id}`,
          reference: release.id,
          metadata: { bookingId: booking.id, grossReleaseAmount: serializeDecimal(releaseAmount) },
        },
      });

      const balanceAfterWorkerCredit = available.minus(workerNet).toDecimalPlaces(MONEY_SCALE);
      await tx.escrowLedgerEntry.create({
        data: {
          escrowAccountId: booking.escrowAccount.id,
          bookingId: booking.id,
          milestoneId: milestone?.id,
          releaseId: release.id,
          walletTransactionId: walletTransaction.id,
          type: EscrowLedgerEntryType.RELEASE,
          direction: LedgerDirection.DEBIT,
          amount: workerNet,
          currency: booking.currency,
          balanceAfter: balanceAfterWorkerCredit,
          idempotencyKey: `ledger:escrow_release:${release.id}:worker`,
          description: 'Escrow release credited to worker wallet.',
          metadata: { releaseType: release.releaseType },
          createdById: actor.id,
        },
      });

      if (platformFee.gt(0)) {
        await tx.escrowLedgerEntry.create({
          data: {
            escrowAccountId: booking.escrowAccount.id,
            bookingId: booking.id,
            milestoneId: milestone?.id,
            releaseId: release.id,
            type: EscrowLedgerEntryType.PLATFORM_FEE,
            direction: LedgerDirection.DEBIT,
            amount: platformFee,
            currency: booking.currency,
            balanceAfter: remainingAfterRelease,
            idempotencyKey: `ledger:escrow_release:${release.id}:fee`,
            description: 'Platform fee recognized on escrow release.',
            createdById: actor.id,
          },
        });
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: remainingAfterRelease.eq(0) ? BookingStatus.RELEASED : BookingStatus.PARTIALLY_RELEASED,
          upfrontPaid: true,
          completionPaid: remainingAfterRelease.eq(0) ? true : booking.completionPaid,
          completionDate: remainingAfterRelease.eq(0) ? booking.completionDate ?? new Date() : booking.completionDate,
        },
      });

      await createNotification(tx, {
        userId: booking.providerId,
        type: NotificationType.PAYMENT_RELEASED,
        title: 'Escrow released',
        body: `${serializeDecimal(workerNet)} ${booking.currency} has been credited to your wallet.`,
        actionUrl: '/dashboard/analytics',
        metadata: { bookingId: booking.id, releaseId: release.id },
      });
      await enqueueOutbox(tx, {
        aggregateType: 'escrow_release',
        aggregateId: release.id,
        type: 'escrow.release.completed',
        payload: {
          bookingId: booking.id,
          releaseId: release.id,
          workerId: booking.providerId,
          workerNetAmount: serializeDecimal(workerNet),
        },
        idempotencyKey: `outbox:escrow.release.completed:${release.id}`,
      });
      await audit(tx, {
        actorUserId: actor.id,
        entityType: 'booking',
        entityId: booking.id,
        action: remainingAfterRelease.eq(0) ? 'escrow_fully_released' : 'escrow_partially_released',
        metadata: {
          releaseId: release.id,
          grossAmount: serializeDecimal(releaseAmount),
          workerNetAmount: serializeDecimal(workerNet),
          platformFee: serializeDecimal(platformFee),
        },
      });

      return { release, idempotent: false };
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      const release = await db.escrowRelease.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (release) return { release, idempotent: true };
    }
    throw error;
  }
}

export async function completeJobWorkflow(input: { bookingId: string; actorUserId: string }) {
  const actor = await db.user.findUnique({
    where: { id: input.actorUserId },
    select: { id: true, role: true },
  });
  if (!actor) throw new Error('Actor not found.');

  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    include: { escrowAccount: true },
  });
  if (!booking) throw new Error('Booking not found.');
  if (booking.clientId !== actor.id && booking.providerId !== actor.id && actor.role !== UserRole.ADMIN) {
    throw new Error('Not authorised to complete this booking.');
  }

  if (booking.providerId === actor.id && actor.role !== UserRole.ADMIN) {
    const providerCompletionStatuses: BookingStatus[] = [
      BookingStatus.ESCROW_PAID,
      BookingStatus.ESCROW_FUNDED,
      BookingStatus.IN_PROGRESS,
      BookingStatus.PARTIALLY_RELEASED,
    ];
    if (!providerCompletionStatuses.includes(booking.status)) {
      throw new Error(`Cannot mark a booking with status "${booking.status}" as complete.`);
    }

    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED, completionDate: new Date() },
    });
    await db.auditLog.create({
      data: {
        actorUserId: actor.id,
        entityType: 'booking',
        entityId: booking.id,
        action: 'provider_marked_job_completed',
      },
    });
    return { released: false, booking: updated };
  }

  if (!booking.escrowAccount || money(booking.escrowAccount.availableAmount).lte(0)) {
    throw new Error('There is no remaining escrow balance to release.');
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    await db.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED, completionDate: booking.completionDate ?? new Date() },
    });
  }

  const result = await releaseEscrow({
    bookingId: booking.id,
    actorUserId: actor.id,
    idempotencyKey: `final_release:${booking.id}:${actor.id}`,
    releaseType: actor.role === UserRole.ADMIN ? EscrowReleaseType.ADMIN : EscrowReleaseType.FINAL,
    reason: 'Final job completion release.',
  });

  return { released: true, release: result.release };
}

export async function requestWorkerPayout(input: {
  workerId: string;
  amount: DecimalInput;
  payoutAccountId: string;
  idempotencyKey: string;
}) {
  const amount = positiveMoney(input.amount);
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.payout.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return { payout: existing, idempotent: true };

      const payoutAccount = await tx.payoutAccount.findUnique({ where: { id: input.payoutAccountId } });
      if (!payoutAccount || payoutAccount.userId !== input.workerId || !payoutAccount.isActive) {
        throw new Error('Active payout account not found.');
      }

      const wallet = await tx.wallet.findUnique({
        where: {
          userId_currency: {
            userId: input.workerId,
            currency: payoutAccount.currency,
          },
        },
      });
      if (!wallet || money(wallet.availableAmount).lt(amount)) {
        throw new Error('Insufficient wallet balance.');
      }

      const held = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          version: wallet.version,
          availableAmount: { gte: amount },
        },
        data: {
          availableAmount: { decrement: amount },
          pendingAmount: { increment: amount },
          version: { increment: 1 },
        },
      });
      if (held.count !== 1) {
        throw new Error('Wallet balance changed while creating payout. Please retry.');
      }

      const updatedWallet = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
      const providerReference = createPaystackReference('payout');
      const payout = await tx.payout.create({
        data: {
          userId: input.workerId,
          walletId: wallet.id,
          payoutAccountId: payoutAccount.id,
          requestedById: input.workerId,
          status: PayoutStatus.QUEUED,
          amount,
          currency: payoutAccount.currency,
          providerReference,
          idempotencyKey: input.idempotencyKey,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.PAYOUT_HOLD,
          status: WalletTransactionStatus.PENDING,
          direction: LedgerDirection.DEBIT,
          amount,
          currency: payoutAccount.currency,
          balanceAfter: updatedWallet.availableAmount,
          idempotencyKey: `wallet:payout_hold:${payout.id}`,
          reference: payout.id,
        },
      });

      await enqueueOutbox(tx, {
        aggregateType: 'payout',
        aggregateId: payout.id,
        type: 'payout.initiate',
        payload: { payoutId: payout.id },
        idempotencyKey: `outbox:payout.initiate:${payout.id}`,
      });
      await audit(tx, {
        actorUserId: input.workerId,
        entityType: 'payout',
        entityId: payout.id,
        action: 'worker_payout_queued',
        metadata: { amount: serializeDecimal(amount), currency: payoutAccount.currency },
      });

      return { payout, idempotent: false };
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      const payout = await db.payout.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (payout) return { payout, idempotent: true };
    }
    throw error;
  }
}

export async function initiateQueuedPayout(payoutId: string) {
  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: { payoutAccount: true },
  });
  if (!payout) throw new Error('Payout not found.');
  const payoutInitiationStatuses: PayoutStatus[] = [PayoutStatus.QUEUED, PayoutStatus.FAILED];
  if (!payoutInitiationStatuses.includes(payout.status)) {
    return { payout, skipped: true };
  }

  await db.payout.update({
    where: { id: payout.id },
    data: { status: PayoutStatus.PROCESSING },
  });

  try {
    const response = await initiatePaystackTransfer({
      amount: amountToMinorUnits(payout.amount),
      recipient: payout.payoutAccount.providerRecipientCode,
      reference: payout.providerReference,
      reason: `ServiHub payout ${payout.id}`,
    });

    const updated = await db.payout.update({
      where: { id: payout.id },
      data: {
        providerTransferCode: response.data.transfer_code,
        status:
          response.data.status === 'success'
            ? PayoutStatus.SUCCEEDED
            : PayoutStatus.PROCESSING,
        completedAt: response.data.status === 'success' ? new Date() : undefined,
      },
    });
    await db.payoutAttempt.create({
      data: {
        payoutId: payout.id,
        status: updated.status,
        providerReference: payout.providerReference,
        responsePayload: response as unknown as Prisma.InputJsonValue,
      },
    });
    return { payout: updated, skipped: false };
  } catch (error) {
    const nextRetryAt = new Date(Date.now() + Math.min(60, payout.retryCount + 1) * 60 * 1000);
    const updated = await db.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.FAILED,
        retryCount: { increment: 1 },
        nextRetryAt,
        failureReason: error instanceof Error ? error.message : 'Unknown payout initiation error.',
      },
    });
    await db.payoutAttempt.create({
      data: {
        payoutId: payout.id,
        status: PayoutStatus.FAILED,
        providerReference: payout.providerReference,
        error: updated.failureReason,
      },
    });
    throw error;
  }
}

export async function recordPaystackTransferResult(input: {
  reference: string;
  status: string;
  providerPayload: PaystackWebhookPayload['data'];
}) {
  return db.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({
      where: { providerReference: input.reference },
      include: { wallet: true },
    });
    if (!payout) return { processed: false, reason: 'Payout not found.' };

    if (input.status === 'transfer.success' && payout.status === PayoutStatus.SUCCEEDED) {
      return { processed: false, idempotent: true, status: PayoutStatus.SUCCEEDED };
    }
    if (input.status === 'transfer.failed' && payout.status === PayoutStatus.FAILED) {
      return { processed: false, idempotent: true, status: PayoutStatus.FAILED };
    }
    if (input.status === 'transfer.reversed' && payout.status === PayoutStatus.REVERSED) {
      return { processed: false, idempotent: true, status: PayoutStatus.REVERSED };
    }

    if (input.status === 'transfer.success') {
      await tx.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.SUCCEEDED,
          providerTransferCode: input.providerPayload.transfer_code ?? payout.providerTransferCode,
          completedAt: new Date(),
          failureReason: null,
        },
      });
      await tx.wallet.update({
        where: { id: payout.walletId },
        data: {
          pendingAmount: { decrement: payout.amount },
          version: { increment: 1 },
        },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: payout.walletId,
          type: WalletTransactionType.PAYOUT_SENT,
          status: WalletTransactionStatus.COMPLETED,
          direction: LedgerDirection.DEBIT,
          amount: payout.amount,
          currency: payout.currency,
          balanceAfter: payout.wallet.availableAmount,
          idempotencyKey: `wallet:payout_sent:${payout.id}`,
          reference: payout.id,
        },
      });
      return { processed: true, status: PayoutStatus.SUCCEEDED };
    }

    if (input.status === 'transfer.failed' || input.status === 'transfer.reversed') {
      const updatedWallet = await tx.wallet.update({
        where: { id: payout.walletId },
        data: {
          availableAmount: { increment: payout.amount },
          pendingAmount: { decrement: payout.amount },
          version: { increment: 1 },
        },
      });
      await tx.payout.update({
        where: { id: payout.id },
        data: {
          status: input.status === 'transfer.reversed' ? PayoutStatus.REVERSED : PayoutStatus.FAILED,
          retryCount: { increment: 1 },
          nextRetryAt: input.status === 'transfer.failed' ? new Date(Date.now() + 15 * 60 * 1000) : null,
          failureReason: JSON.stringify(input.providerPayload.failures ?? input.providerPayload.gateway_response ?? input.status),
        },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: payout.walletId,
          type: WalletTransactionType.PAYOUT_FAILED_REVERSAL,
          status: WalletTransactionStatus.REVERSED,
          direction: LedgerDirection.CREDIT,
          amount: payout.amount,
          currency: payout.currency,
          balanceAfter: updatedWallet.availableAmount,
          idempotencyKey: `wallet:payout_reversal:${payout.id}:${input.status}`,
          reference: payout.id,
        },
      });
      return { processed: true, status: input.status };
    }

    return { processed: false, reason: 'Unsupported transfer event.' };
  });
}

export async function processOutboxBatch(limit = 25) {
  const pending = await db.outboxEvent.findMany({
    where: {
      status: OutboxEventStatus.PENDING,
      availableAt: { lte: new Date() },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  const results: Array<{ id: string; type: string; status: 'processed' | 'skipped' | 'failed'; error?: string }> = [];
  for (const event of pending) {
    const claimed = await db.outboxEvent.updateMany({
      where: { id: event.id, status: OutboxEventStatus.PENDING },
      data: { status: OutboxEventStatus.PROCESSING, lockedAt: new Date(), attempts: { increment: 1 } },
    });
    if (claimed.count !== 1) {
      results.push({ id: event.id, type: event.type, status: 'skipped' });
      continue;
    }

    try {
      if (event.type === 'payout.initiate') {
        const payload = event.payload as Prisma.JsonObject;
        const payoutId = typeof payload.payoutId === 'string' ? payload.payoutId : null;
        if (!payoutId) throw new Error('Outbox payout.initiate event is missing payoutId.');
        await initiateQueuedPayout(payoutId);
      }

      await db.outboxEvent.update({
        where: { id: event.id },
        data: { status: OutboxEventStatus.PROCESSED, processedAt: new Date(), lastError: null },
      });
      results.push({ id: event.id, type: event.type, status: 'processed' });
    } catch (error) {
      const nextDelayMs = Math.min(60, event.attempts + 1) * 60 * 1000;
      await db.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: OutboxEventStatus.PENDING,
          availableAt: new Date(Date.now() + nextDelayMs),
          lockedAt: null,
          lastError: error instanceof Error ? error.message : 'Unknown outbox processing error.',
        },
      });
      results.push({
        id: event.id,
        type: event.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error.',
      });
    }
  }

  return results;
}

export async function getEscrowLifecycle(input: { bookingId: string; actorUserId: string }) {
  const actor = await db.user.findUnique({
    where: { id: input.actorUserId },
    select: { id: true, role: true },
  });
  if (!actor) throw new Error('Actor not found.');

  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, title: true, category: true } },
      escrowAccount: true,
      milestones: { orderBy: { sequence: 'asc' } },
      paymentIntents: { orderBy: { createdAt: 'desc' } },
      releases: { orderBy: { createdAt: 'desc' } },
      ledgerEntries: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!booking) throw new Error('Booking not found.');
  const canView = actor.role === UserRole.ADMIN || booking.clientId === actor.id || booking.providerId === actor.id;
  if (!canView) throw new Error('Not authorised to view this escrow lifecycle.');
  return booking;
}

export async function reconcilePaystackReference(reference: string) {
  return verifyAndConfirmPaystackPayment(reference);
}

export function escrowLifecycleSummaryForDocs() {
  return {
    payment: 'PENDING -> AWAITING_PAYMENT -> ESCROW_PAID',
    release: 'ESCROW_PAID/IN_PROGRESS/COMPLETED -> PARTIALLY_RELEASED -> RELEASED',
    dispute: 'Any funded state -> DISPUTED -> ADMIN release/refund decision',
  };
}
