// Lightweight, repo-native security smoke check - not a substitute for a
// real scanner. Hits a few live routes on the running dev server and
// verifies the headers server.ts:130-147 is supposed to set are actually
// present, then flags known structural gaps (see SECURITY.md) that a
// header check alone can't catch.
//
// Usage: npm run dev (separate terminal), then npm run security:headers

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const REQUIRED_HEADERS = [
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
];

const ROUTES_TO_CHECK = ['/', '/api/health', '/api/mux/config'];

async function checkRoute(path: string) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  const missing = REQUIRED_HEADERS.filter((h) => !res.headers.get(h));
  const hasCSP = Boolean(res.headers.get('content-security-policy'));
  return { path, status: res.status, missing, hasCSP };
}

async function main() {
  console.log(`Security header check against ${BASE_URL}\n`);
  let failed = false;

  for (const path of ROUTES_TO_CHECK) {
    try {
      const { status, missing, hasCSP } = await checkRoute(path);
      const ok = missing.length === 0;
      failed = failed || !ok;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${path}  (${status})`);
      if (missing.length) console.log(`  missing: ${missing.join(', ')}`);
      if (!hasCSP) console.log('  note: no CSP header (expected in dev - server.ts only sets it when NODE_ENV=production)');
    } catch (err) {
      failed = true;
      console.log(`ERROR ${path}  ${(err as Error).message} (is 'npm run dev' running?)`);
    }
  }

  console.log('\nThis only checks HTTP headers. See SECURITY.md for known structural');
  console.log('findings (IDOR, rate-limit coverage, webhook verification) this script');
  console.log('cannot detect on its own.');

  process.exit(failed ? 1 : 0);
}

main();
