# VANTA Landing Implementation Plan

> **For agentic workers:** Execute inline using executing-plans. Steps use checkbox syntax for tracking.

**Goal:** Deliver an editorial, responsive sneaker concept launch with consistent 3D assets.
**Architecture:** Server-rendered editorial page with small client islands for navigation, color selection, motion, demo signup and lazily loaded 3D. Local assets only.
**Tech Stack:** Next.js, React, TypeScript, GSAP, React Three Fiber, Blender, Playwright.
**Spec:** ../specs/2026-10-04-vanta-design.md

## Global Constraints
Use the approved palette and copy. Preserve existing Blender scenes. Do not publish or commit. Signup remains explicitly a local demo. Respect reduced motion and retain readable HTML without WebGL.

## Task 1 — assets
Files: `assets/blender/build_sneaker.py`, `assets/blender/form-01.blend`, `public/models/form-01.glb`, `public/images/*`.
Interface: same named materials and silhouette across three renders and GLB; 0.30m approximate concept length.
- [x] Author panelled sneaker in a dedicated Blender scene and render three colors.
- [x] Generate editorial lifestyle using image_gen in the conversation.
- [ ] Integrate lifestyle image after a transferable file is available; tool returned no workspace path. Current lookbook uses a labelled Clay studio render.
- [x] Render dedicated upper/heel/sole macro views, verify visually and integrate into detail cards.
- [x] Verify silhouette visually, export selected meshes, inspect GLB size and loadability.

## Task 2 — editorial site
Files: `src/app/{layout.tsx,page.tsx,globals.css}`, `src/components/{Hero,DesignStory,Colorways,Signup,ShoeCanvas}.tsx`.
Interfaces: `Colorway = 'chalk' | 'carbon' | 'clay'`; poster paths `/images/{colorway}.webp`; viewer loads `/models/form-01.glb`.
- [x] Scaffold isolated project, install pinned lockfile dependencies.
- [x] Build static semantic sections, image sizing, responsive type and composition.
- [x] Add anchor navigation, color selection, demo validation with aria-live, accessible focus.
- [x] Add scoped GSAP timeline with desktop-only pinning and reduced-motion bypass.
- [x] Add dynamic Canvas on user request, demand rendering, model rotation and error fallback.

## Task 3 — verification and handoff
Files: `tests/landing.spec.ts`, `playwright.config.ts`, `docs/QA.md`, `README.md`.
- [x] Browser assertions: anchor navigation; all three color selections update image and selected state; invalid signup rejected; valid signup says demo. Signup implementation has no submit network call.
- [x] Browser assertions: no horizontal overflow at 390px/1440px, reduced-motion behavior, GLB-load error recovery, no page errors on main flow.
- [x] Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`.
- [x] Capture desktop/mobile proof, inspect hero visually, run Lighthouse on production build and document actual results.
- [x] Leave production preview running and open http://localhost:3017 in Chrome; source is `/home/sss/AI-Home/projects/vanta-landing`.
