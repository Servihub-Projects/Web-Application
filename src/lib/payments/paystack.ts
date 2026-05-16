import 'server-only';

import crypto from 'crypto';
import type { CurrencyCode } from '@prisma/client';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const MINOR_UNIT_FACTOR = 100;

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackInitializeResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransactionVerification = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: CurrencyCode;
  paid_at?: string | null;
  gateway_response?: string | null;
  channel?: string | null;
  customer?: {
    email?: string | null;
  };
  metadata?: unknown;
};

export type PaystackTransferResponse = {
  amount: number;
  currency: CurrencyCode;
  reference: string;
  status: string;
  transfer_code?: string | null;
  failures?: unknown;
};

export type PaystackWebhookPayload = {
  event: string;
  data: {
    reference?: string;
    amount?: number;
    currency?: CurrencyCode;
    status?: string;
    paid_at?: string | null;
    gateway_response?: string | null;
    transfer_code?: string | null;
    failures?: unknown;
    [key: string]: unknown;
  };
};

export class PaystackError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly providerMessage?: string
  ) {
    super(message);
    this.name = 'PaystackError';
  }
}

function requireSecretKey() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaystackError('PAYSTACK_SECRET_KEY is not configured.');
  }
  return secret;
}

function normalizeReference(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 50);
}

export function createPaystackReference(prefix: string) {
  const random = crypto.randomUUID().replace(/-/g, '');
  return normalizeReference(`${prefix}_${random}`).padEnd(16, '0');
}

export function amountToMinorUnits(amount: { toString(): string } | number | string) {
  const value = Number(amount.toString());
  if (!Number.isFinite(value) || value <= 0) {
    throw new PaystackError('Paystack amount must be a positive number.');
  }
  return Math.round(value * MINOR_UNIT_FACTOR);
}

export function minorUnitsToMajor(amount: number) {
  return amount / MINOR_UNIT_FACTOR;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = requireSecretKey();
  const digest = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  const expected = Buffer.from(digest, 'hex');
  const received = Buffer.from(signature, 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

async function paystackRequest<T>(
  path: string,
  init: Omit<RequestInit, 'headers'> & { body?: string } = {}
): Promise<PaystackEnvelope<T>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireSecretKey()}`,
      'Content-Type': 'application/json',
    },
  });

  const body = (await response.json().catch(() => null)) as PaystackEnvelope<T> | null;

  if (!response.ok || !body?.status) {
    throw new PaystackError(
      'Paystack request failed.',
      response.status,
      body?.message ?? response.statusText
    );
  }

  return body;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  currency: CurrencyCode;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest<PaystackInitializeResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amount),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackTransactionVerification>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: 'GET' }
  );
}

export async function initiatePaystackTransfer(input: {
  amount: number;
  recipient: string;
  reference: string;
  reason: string;
}) {
  return paystackRequest<PaystackTransferResponse>('/transfer', {
    method: 'POST',
    body: JSON.stringify({
      source: 'balance',
      amount: input.amount,
      recipient: input.recipient,
      reference: input.reference,
      reason: input.reason,
    }),
  });
}

export async function verifyPaystackTransfer(reference: string) {
  return paystackRequest<PaystackTransferResponse>(
    `/transfer/verify/${encodeURIComponent(reference)}`,
    { method: 'GET' }
  );
}
