export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

export interface MicroPageBlockContent {
  heading?: string;
  body?: string;
  imageKey?: string;
  imageKeys?: string[];
  buttonText?: string;
  buttonLink?: string;
  targetDate?: string;
  scheduleItems?: ScheduleItem[];
  pricingTiers?: PricingTier[];
  faqItems?: FaqItem[];
  testimonialItems?: TestimonialItem[];
}

export type MicroPageContent = Record<string, MicroPageBlockContent>;
