# VANTA — Cloudflare Pages

Published: 2026-10-06.

- Public URL: **https://vanta-form-01.pages.dev**
- Cloudflare Pages project: `vanta-form-01`
- Deployment method: dashboard Direct Upload, production deployment.
- Upload artifact: `dist/vanta-form-01.zip` (40 files).
- Hosting is independent of the local preview server or this computer remaining online.

## Build and update

From the project directory:

```bash
npm run lint
npm run typecheck
npm run build:static
npm run test:static
```

`STATIC_EXPORT=1` enables Next.js static export and unoptimized local images. The export uses `.next-static`, preserving the regular `.next` local-preview build. `assets/package_pages.py` packages generated routes, client bundles, fonts, nine current WebP images and `form-01-v5.glb` into `dist/pages` and the ZIP. Source Blender files and historical assets are excluded.

In Cloudflare Dashboard → Workers & Pages → `vanta-form-01` → Create deployment, choose production, upload `dist/vanta-form-01.zip`, wait for all files to finish uploading, then deploy. Use the existing project to retain the public URL.

After deployment:

```bash
TEST_BASE_URL=https://vanta-form-01.pages.dev npm test
```

This runs against the public site without starting a local server. Direct Upload does not automatically publish later local edits; repeat the build/upload procedure. A future Git-integrated deployment would require a separate project.

## Verification record

- PASS: `npm run lint` and `npm run typecheck`.
- PASS: Next.js static build and packaging (40 files uploaded successfully).
- PASS: `npm run test:static` — 24/24 tests, 41.0 seconds.
- PASS: `TEST_BASE_URL=https://vanta-form-01.pages.dev npm test` — 24/24 tests, 46.4 seconds, fresh unauthenticated Chromium contexts.
- PASS: HTTPS root returns 200; hero WebP returns 200 (`image/webp`, 52,230 bytes); GLB returns 200 (`model/gltf-binary`, 1,512,548 bytes).
- PASS: nonexistent route returns HTTP 404.
- Tests cover responsive framing, all seven 3D cards, three colorways, motion controls, loading/error recovery, simulated touch, expanded viewer, theme preservation, native scroll stops and accessibility checks.

An auxiliary Python urllib HTTP probe returned 403, whereas curl and the complete unauthenticated browser suite succeeded. The client-specific discrepancy was not attributed to a confirmed cause; browser access and asset delivery were independently verified.

## Functional scope

The published site includes the accepted V8 motion and interactive 3D experience. The signup form remains an explicitly labeled demo: it does not collect or send email addresses. Safari and physical mobile GPU behavior have not been verified.
