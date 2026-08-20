import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Ensure API route runs in Node.js runtime
export const runtime = 'nodejs';

export async function GET(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  await context.params;
  return handlers.GET(req);
}

export async function POST(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  await context.params;
  return handlers.POST(req);
}
