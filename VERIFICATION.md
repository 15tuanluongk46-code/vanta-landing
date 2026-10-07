# Handoff verification — 2026-10-07

Baseline `ae545d6e2f15f7326bb489b22d05b6a89c1930e5`; isolated Linux clone,
Node 22.23.2, managed Playwright Chromium. Dependencies/lockfile unchanged.

| Check | Result |
|---|---|
| `npm ci` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run build:static` followed by `npm run test:static` | PASS: 32 tests |
| `TEST_BASE_URL=http://127.0.0.1:3117 npm test` against this clone's production server | FAIL: 29 passed, 3 failed |
| `npm audit --omit=dev --audit-level=high` | PASS: 0 vulnerabilities |
| `npm audit` | FAIL: 5 high findings in development dependency chain |

Production server was started from this clone using
`node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3117`.
An unrelated server on default port 3017 was left untouched; its results are not
used as evidence. The three production failures reproduced with
`TEST_BASE_URL=http://127.0.0.1:3117 npx playwright test tests/landing.spec.ts --workers=1`:
tablet/mobile `networkidle` timeouts and campaign image `naturalWidth` remaining 0.
Diagnostics observed a pending local `/_next/image` request. Root cause is not
proven; no claim that the failures existed before this patch. Static export bypasses
that image optimizer and passes all tests. Application behavior was not changed.

Development audit finding: `braces` advisory `GHSA-vfj7-8cjw-p6xm`, through
`micromatch`, `fast-glob`, `@next/eslint-plugin-next`, `eslint-config-next`.
The suggested forced fix changes the Next lint package major version; it was not
applied as part of documentation/browser-path portability work.

**Verdict: partially verified.** Static delivery and portable managed-browser
configuration are tested; production image loading and development dependency
remediation remain follow-ups. Deployment and Blender rebuild: NOT RUN.
