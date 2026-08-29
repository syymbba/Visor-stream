/**
 * Explicit CORS allow-list.
 *
 * The previous approach compared the request Origin against a single
 * `APP_URL`/`NEXT_PUBLIC_APP_URL` value: if that env var was unset (the
 * `.env.example` default is a placeholder), no CORS header was ever emitted,
 * silently breaking any legitimate cross-origin caller; if someone "fixed"
 * that by wildcarding the origin, every credentialed API route would become
 * instantly and permanently cross-origin readable. This module builds an
 * explicit allow-list from configuration and defaults to *no* CORS headers
 * (safe, same-origin-only) rather than either extreme, and logs a warning so
 * a missing configuration is visible instead of silent.
 */
import type { NextFunction, Request, Response } from 'express';

function parseAllowList(): string[] {
  const explicit = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const fallback = [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL].filter(
    (v): v is string => Boolean(v) && v !== 'MY_APP_URL'
  );
  return Array.from(new Set([...explicit, ...fallback])).map((origin) => origin.replace(/\/$/, ''));
}

let warnedOnce = false;

export function createCorsMiddleware() {
  const allowList = parseAllowList();

  if (allowList.length === 0 && !warnedOnce) {
    warnedOnce = true;
    console.warn(
      '[cors] No ALLOWED_ORIGINS/APP_URL configured. Cross-origin requests will be rejected. ' +
        'This is safe for a same-origin SPA + API deployment, but if the frontend is ever served ' +
        'from a different origin than this API, set ALLOWED_ORIGINS explicitly.'
    );
  }

  return function corsMiddleware(req: Request, res: Response, next: NextFunction) {
    const requestOrigin = req.headers.origin;
    if (requestOrigin && allowList.includes(requestOrigin.replace(/\/$/, ''))) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  };
}
