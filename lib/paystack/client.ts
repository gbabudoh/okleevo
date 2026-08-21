import crypto from 'crypto';
import { env } from '@/config/env';

export interface InitializePaystackParams {
  email: string;
  amount: number; // in sub-units (e.g. kobo/cents: 10000 = 100 NGN)
  currency?: string; // NGN, GHS, KES, ZAR, USD
  reference?: string;
  callbackUrl: string;
  plan?: string; // Plan code for recurring billing
  metadata?: Record<string, unknown>;
  channels?: string[]; // ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer']
}

export interface InitializePaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaystackResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    created_at: string;
    customer: {
      id: number;
      customer_code: string;
      email: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    plan?: {
      id: number;
      name: string;
      plan_code: string;
      description?: string;
      amount: number;
      interval: string;
      currency: string;
    };
    subscription?: {
      id: number;
      subscription_code: string;
      email_token?: string;
      status: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export interface CreatePaystackPlanParams {
  name: string;
  amount: number; // in lowest currency sub-unit
  interval: 'monthly' | 'annually' | 'hourly' | 'daily' | 'weekly';
  currency?: string;
  description?: string;
}

export interface CreatePaystackPlanResponse {
  status: boolean;
  message: string;
  data: {
    name: string;
    plan_code: string;
    description?: string;
    amount: number;
    interval: string;
    currency: string;
    id: number;
  };
}

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getPaystackSecretKey(): string {
  return env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY || '';
}

/**
 * Executes an authenticated request to the Paystack REST API.
 */
async function paystackRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error('Paystack is not configured. Add PAYSTACK_SECRET_KEY to your environment.');
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await res.json();
  if (!res.ok || !body.status) {
    throw new Error(body.message || `Paystack API error: ${res.statusText}`);
  }

  return body as T;
}

/**
 * Initializes a transaction on Paystack (redirects user to payment page or inline checkout).
 */
export async function initializePaystackTransaction(
  params: InitializePaystackParams
): Promise<InitializePaystackResponse> {
  return paystackRequest<InitializePaystackResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      currency: params.currency || 'NGN',
      reference: params.reference,
      callback_url: params.callbackUrl,
      plan: params.plan,
      metadata: params.metadata,
      channels: params.channels,
    }),
  });
}

/**
 * Verifies the status of a transaction on Paystack by reference.
 */
export async function verifyPaystackTransaction(reference: string): Promise<VerifyPaystackResponse> {
  return paystackRequest<VerifyPaystackResponse>(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
  });
}

/**
 * Creates a recurring plan on Paystack (e.g. Starter Monthly, Growth Annual).
 */
export async function createPaystackPlan(
  params: CreatePaystackPlanParams
): Promise<CreatePaystackPlanResponse> {
  return paystackRequest<CreatePaystackPlanResponse>('/plan', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      amount: params.amount,
      interval: params.interval,
      currency: params.currency || 'NGN',
      description: params.description,
    }),
  });
}

/**
 * Validates the HMAC SHA512 signature from Paystack webhook requests.
 */
export function verifyPaystackWebhookSignature(signature: string, rawBody: string): boolean {
  const secret = env.PAYSTACK_WEBHOOK_SECRET || getPaystackSecretKey();
  if (!secret || !signature) return false;

  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return hash === signature;
}
