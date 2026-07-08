export interface MicroPageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  components: string[];
}

export const MICRO_PAGE_TEMPLATES: MicroPageTemplate[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Hero section, features, and CTA for new product announcements',
    category: 'Marketing',
    components: ['Hero', 'Features', 'CTA', 'Footer'],
  },
  {
    id: 'event-landing',
    name: 'Event Landing',
    description: 'Countdown timer, schedule, and registration form',
    category: 'Events',
    components: ['Hero', 'Countdown', 'Schedule', 'Registration'],
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'High-converting page focused on collecting leads',
    category: 'Marketing',
    components: ['Hero', 'Benefits', 'Form', 'Testimonials'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Elegant gallery and project showcase',
    category: 'Personal',
    components: ['Hero', 'Gallery', 'About', 'Contact'],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Build anticipation with countdown and email signup',
    category: 'Marketing',
    components: ['Hero', 'Countdown', 'Email Form'],
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    description: 'Clear pricing tiers with feature comparison',
    category: 'Sales',
    components: ['Hero', 'Pricing Cards', 'FAQ', 'CTA'],
  },
];

export function getMicroPageTemplate(id: string): MicroPageTemplate | undefined {
  return MICRO_PAGE_TEMPLATES.find(t => t.id === id);
}
