import { NextRequest } from 'next/server';

const ratelimits = new Map<string, number[]>();

interface RateLimitConfig {
  interval?: number; // Make properties optional
  limit?: number;
}

export function rateLimit(
  req: NextRequest,
  { interval = 60, limit = 30 }: RateLimitConfig = {}
) {
  // Get IP or fallback to a default
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'anonymous';
  
  const now = Date.now();
  const windowStart = now - interval * 1000;

  // Get existing timestamps for this IP
  const timestamps = ratelimits.get(ip) || [];
  
  // Filter out old timestamps and add new one
  const validTimestamps = [...timestamps.filter(time => time > windowStart), now];
  
  // Update the timestamps in storage
  ratelimits.set(ip, validTimestamps);

  // Check if limit exceeded
  const isRateLimited = validTimestamps.length > limit;

  return {
    isLimited: isRateLimited,
    limit,
    remaining: Math.max(0, limit - validTimestamps.length),
    reset: new Date(now + interval * 1000)
  };
} 