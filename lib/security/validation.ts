import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation (more lenient for better UX)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

// UK Phone validation (more flexible)
export const ukPhoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 characters')
  .regex(/^(\+44|0)[1-9]\d{8,9}$/, 'Invalid UK phone number format');

// UK Postcode validation
export const ukPostcodeSchema = z
  .string()
  .regex(
    /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    'Invalid UK postcode'
  );

// Registration validation schema
export const registrationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  businessSize: z.string().min(1, 'Business size is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  phone: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Invoice validation schema
export const invoiceSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientEmail: emailSchema.optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('GBP'),
  dueDate: z.string().or(z.date()),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    rate: z.number().positive(),
    amount: z.number().positive(),
  })),
});

// Contact validation schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: emailSchema,
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE', 'CUSTOMER']).default('LEAD'),
});

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().or(z.date()).optional(),
  assignee: z.string().optional(),
});

// Sanitize input (prevent XSS)
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

// Validate and sanitize object
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): T {
  const validated = schema.parse(data);
  
  // Sanitize string fields
  if (typeof validated === 'object' && validated !== null) {
    Object.keys(validated).forEach((key) => {
      const value = (validated as any)[key];
      if (typeof value === 'string') {
        (validated as any)[key] = sanitizeInput(value);
      }
    });
  }
  
  return validated;
}
