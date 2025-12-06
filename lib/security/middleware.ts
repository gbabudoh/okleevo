import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

// Authentication middleware
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }

      // Add user info to request
      (request as any).user = decoded;

      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  handler: Function,
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    const rateLimit = rateLimitMap.get(ip);
    
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= maxRequests) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }

    return handler(request);
  };
}

// CORS middleware
export function withCORS(handler: Function, allowedOrigins: string[] = ['*']) {
  return async (request: NextRequest) => {
    const response = await handler(request);
    
    const origin = request.headers.get('origin');
    
    if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  };
}

// Combine multiple middlewares
export function compose(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}
