import { isIP } from "node:net";
import type { RequestHandler } from "express";

const WINDOW_MS = 60_000;
const REQUESTS_PER_IP = 30;
const MAX_TRACKED_IPS = 10_000;

export function createAccountRateLimit(onVercel = process.env.VERCEL === "1"): RequestHandler {
  const requestsByIp = new Map<string, number>();
  let resetsAt = 0;

  return (request, response, next) => {
    const now = Date.now();
    if (now >= resetsAt) {
      requestsByIp.clear();
      resetsAt = (Math.floor(now / WINDOW_MS) + 1) * WINDOW_MS;
    }

    // Vercel overwrites this header with the client address at its ingress.
    const forwardedIp = onVercel ? request.get("x-vercel-forwarded-for") : undefined;
    const ip = forwardedIp && isIP(forwardedIp)
      ? forwardedIp
      : (request.socket.remoteAddress ?? "unknown");
    const count = requestsByIp.get(ip) ?? 0;
    const capacityReached = count === 0 && requestsByIp.size >= MAX_TRACKED_IPS;

    if (count >= REQUESTS_PER_IP || capacityReached) {
      response.set({
        "Cache-Control": "no-store",
        "Retry-After": String(Math.ceil((resetsAt - now) / 1000)),
      }).status(429).json({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." });
      return;
    }

    requestsByIp.set(ip, count + 1);
    next();
  };
}
