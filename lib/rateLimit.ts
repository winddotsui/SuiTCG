// Simple in-memory rate limiter
// Resets when server restarts (good enough for Vercel serverless)

const ipRequests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, limit: number = 30, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= limit) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
}

export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
