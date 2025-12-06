/**
 * Global TypeScript Types
 * Centralized type definitions for the entire platform
 */

// User & Authentication
export interface User {
  _id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  _id: string;
  name: string;
  vatNumber?: string;
  address?: Address;
  subscription: Subscription;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface Subscription {
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface CompanySettings {
  currency: 'GBP';
  timezone: string;
  dateFormat: string;
  vatEnabled: boolean;
  vatRate: number;
}

// CRM Types
export interface Contact {
  _id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: Address;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  _id: string;
  companyId: string;
  contactId: string;
  title: string;
  value: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expectedCloseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Invoicing Types
export interface Invoice {
  _id: string;
  companyId: string;
  contactId: string;
  invoiceNumber: string;
  type: 'invoice' | 'quote';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  currency: string;
  notes?: string;
  stripePaymentLinkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

// Task Types
export interface Task {
  _id: string;
  companyId: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: Date;
  relatedModule?: string;
  relatedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Content Types
export interface AIContentRequest {
  type: 'proposal' | 'job_ad' | 'social_post' | 'email' | 'blog_post';
  topic: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  length?: 'short' | 'medium' | 'long';
  additionalContext?: string;
}

export interface AIContentResponse {
  content: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

// Common Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

