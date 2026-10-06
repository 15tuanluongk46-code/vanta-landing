# V10 — vệt tốc độ và lựa chọn chuyển động

Public: https://vanta-form-01.pages.dev

## Thay đổi

- Bỏ vòng tròn và bốn chấm bám chuột. Ba nét mảnh dài tối đa 32px đổi hướng/độ dài theo vận tốc, mờ trong 170ms khi ngừng di chuyển. RAF dừng khi vệt đã biến mất.
- Giữ native cursor, spotlight/tilt card, phản hồi nút, touch pulse và viewer. Hover không xoay camera; chỉ thao tác kéo mới xoay.
- Select **Chuyển động** gồm **Theo hệ thống**, **Bật hiệu ứng**, **Tắt hiệu ứng**. Mặc định Theo hệ thống; thông báo phản ánh giá trị `prefers-reduced-motion` sau hydration.
- Bật hiệu ứng ghi đè cả điều kiện JavaScript và CSS reduced-motion. Tắt hiệu ứng ngừng motion trang. Lựa chọn lưu dưới key `vanta-motion-preference`; storage lỗi vẫn cho đổi chế độ trong bộ nhớ phiên, nhưng không đảm bảo lưu qua reload.
- `storage` event đồng bộ thay đổi giữa tab. Theo hệ thống tiếp tục nghe thay đổi media query.

## Files

- `src/components/MotionSystem.tsx`: preference store, OS subscription, selector/status.
- `src/components/PointerEffects.tsx`: velocity trail, lifecycle, modal hosting.
- `src/app/globals.css`: speed strokes, motion selector, explicit CSS override.
- `tests/motion-preference.spec.ts`: OS reduce/no-preference, persistence, live OS change, storage failures.
- `tests/pointer.spec.ts`: motion sampled during animation frames, direction/fade, modal, touch and camera isolation.
- `tests/landing.spec.ts`: signup status scoped to signup region now that motion has its own status.

## Verification — 2026-10-06

- PASS `npm run lint`.
- PASS `npm run typecheck`.
- PASS `npm run build:static`: 40 files, 3,650,174 bytes; ZIP 2,250,909 bytes.
- PASS `npm run test:static`: **32/32**, 1.1m.
- PASS `TEST_BASE_URL=https://vanta-form-01.pages.dev npm test`: **32/32**, 1.0m, unauthenticated browser contexts.
- Cloudflare Production Direct Upload confirmed Success after all 40 files uploaded.

The first full local suite exposed an old unscoped status locator and a trail assertion sampled after the deliberately brief trail could disappear. Scoped the form assertion and sampled trail styles during actual animation frames while pointer movement occurs. The final local and public suites pass without changing the trail lifetime.

Evidence: `test-results/v10-pointer-hero.png`; public log `/tmp/opencode/vanta-v10-public-tests.log`. Small-image Vision confirmed the whole shoe is in frame but could not determine text/control overlap from that image; layout and accessibility checks are automated. Temporal trail behavior is tested via frame samples, not inferred from a screenshot.

## Limits

Chromium and CDP-emulated touch verified. Safari, physical mobile GPUs and measured FPS remain untested. Storage choices are local to a browser/device and do not sync across laptops.
