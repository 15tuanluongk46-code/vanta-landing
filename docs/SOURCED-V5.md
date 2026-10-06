# VANTA Graphic V5 — verification

Date: 2026-10-06. Local preview: http://localhost:3017.

## User priorities and correction

V4 was rejected for a plain shoe and clipped product cards. Inspection found that the source macro PNGs already touched the image edges; CSS `contain` could not restore missing geometry. V5 uses a textured CC0 Y2K sneaker by whitney from Meshy. Its pink/blue graphic is present in the actual imported mesh and web GLB, not only the marketplace cover.

All three detail cards now show a complete shoe. The renderer fits projected vertices with 10% target margins. Color cards use contained images and normal-flow labels instead of 108% width, negative offsets and rotation. Campaign now also uses `contain` after mobile visual review flagged its previous `cover` layout.

## Assets

- Nine PNG/WebP renders from the same shoe: hero, profile, Sakura, Lagoon, Citrus, three full-shoe angles and campaign.
- `assets/framing-v5.json`: eight transparent images pass >=8% margin on all four sides; minimum measured margin 9.916% with alpha threshold 12.
- `public/models/form-01-v5.glb`: 1,512,548 bytes, one mesh, one material, four embedded images. Container inspection passed; only `KHR_texture_transform` required.
- Source, license, geometry and generation scripts are recorded in `assets/ASSETS.md`.

## Fresh automated checks

- PASS `python3 assets/prepare_v5.py` — dimensions, alpha-margin gates, WebP generation.
- PASS Meshy helper `--inspect public/models/form-01-v5.glb` — container and JSON structure.
- PASS `npm run lint`.
- PASS `npm run typecheck`.
- PASS `npm run build` — static Next.js production build.
- PASS `npm test` — **9/9 tests, 27.1 seconds**, after the final campaign CSS change.

Playwright covers all detail cards and all three colorways at 360, 390, 768 and 1440 px; campaign containment at the same widths; desktop/mobile accessibility scans; anchors; form demo; reduced motion; scroll pinning; successful 3D draw and failed-download recovery. The viewer test waits for `data-model-ready=true`, not merely an empty canvas.

Initial cold runs encountered image/navigation timeouts. Instrumentation saw a pending Next.js campaign-image optimization request; subsequent requests and final suite passed. A conclusive root cause for all initial timeouts was not established. Actual contrast and stale test-selector failures were corrected before the passing run.

## Visual evidence

Direct image transport was unavailable in this session. Local Qwen2.5-VL via Ollama reviewed the screenshots instead:

- `test-results/card-{upper,heel,sole}-{360,390,768,1440}.png` and `color-{Sakura,Lagoon,Citrus}-{width}.png`: contact sheets at all four widths showed complete shoes; colored graphics visible.
- `test-results/campaign-390.png`: after the final containment change, both shoes were reported inside the frame with surrounding space.
- `test-results/mobile-hero.png`: toe/heel visible; title and CTA readable.
- `/tmp/opencode/vanta-v5-canvas.png`: actual browser canvas after render readiness; complete white sneaker with pink/blue graphics, toe left, no obvious broken geometry. Capture reported no page errors.
- `/tmp/opencode/vanta-v5-sheet.jpg`: coherent render overview including all colorways and campaign.

These checks support framing and texture visibility; final aesthetic acceptance remains with the user.

## Limits

Safari, physical mobile GPU devices and full Khronos glTF validation were not run. Interactive viewer uses Sakura; Lagoon/Citrus are rendered color studies. Signup is a local demo and does not store/send email. No purchases, credits, commits or deployment were made.
