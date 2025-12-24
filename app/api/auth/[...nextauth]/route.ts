import { handlers } from "@/lib/auth";

// Ensure API route runs in Node.js runtime
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
