# VANTA V8 — Motion và phản hồi công nghệ

## Đã triển khai

- Hero: headline/CTA xuất hiện theo nhịp, giày entrance và float nhẹ trong khung; nút tạm dừng chuyển động.
- Section reveal một lần qua IntersectionObserver; hiệu ứng click tự dọn, corner accents và phản hồi hover/focus.
- Đổi màu: background/text/poster chuyển mềm, viewer giữ góc camera hiện tại.
- Viewer: giữ ảnh trong lúc tải, chỉ chuyển sang trạng thái sẵn sàng sau frame WebGL thực sự vẽ mesh. Lỗi tải có trạng thái phục hồi riêng.
- Camera: reset/xem đế/zoom easing 480ms, thao tác mới hủy chuyển động cũ; HUD hiển thị góc thật khi thao tác. Reduced motion chuyển tức thì.
- Dialog: mở/đóng có transition, giữ Escape và trả focus. Inline wheel cuộn trang; wheel trong dialog zoom.
- Hero float dừng ngoài viewport; các reveal đang chạy được quản lý theo visibility của trang. Canvas tiếp tục dùng demand rendering.

## Files

`src/components/MotionSystem.tsx`, `Hero.tsx`, `Colorways.tsx`, `ProductPreview.tsx`, `ShoeCanvas.tsx`, `src/app/globals.css`, `tests/motion.spec.ts`.

## Verification — 2026-10-06

- PASS `npm run lint`
- PASS `npm run typecheck`
- PASS `npm run build` — Next.js production static build.
- PASS `npx playwright test tests/motion.spec.ts` — 5/5, 16.3s.
- PASS `npx playwright test tests/scroll-theme.spec.ts --grep 'desktop sections'` — 1/1.
- PASS `npm test` — 24/24, 55.0s.

Coverage gồm pause/reduced motion, reveal một lần, ripple cleanup, tải chậm/lỗi, offscreen float, lệnh camera liên tiếp, giữ góc qua phối màu, hero trong khung 360–1920px, theme bảy card, native scroll, keyboard, dialog/focus, axe và touch/pinch mô phỏng CDP.

Lần hồi quy đầu có một lỗi test đo parent/child ở hai frame khác nhau trong 2px cuối của native snap. Test được sửa đo bounds tương đối trong cùng một evaluation; giữ nguyên ngưỡng containment. Không thay đổi layout để né assertion.

## Bằng chứng hình ảnh

- `test-results/v8-story-ready.png` (ảnh từ kiểm thử).
- `/tmp/opencode/vanta-v8-story.jpg` (bản 600px cho Vision).
- Vision xác nhận họa tiết giày, mũi/gót/đế trong khung và không thấy chữ/nút chồng hoặc bị cắt. Ảnh tĩnh không chứng minh độ mượt theo thời gian; hành vi camera/motion được kiểm tra bằng trạng thái và tọa độ trong Playwright.

## Giới hạn

Chưa kiểm tra Safari hoặc GPU điện thoại thật; touch dùng CDP. Chưa có phép đo FPS trên thiết bị thật. Assets, geometry và texture vẫn là bộ V5. Preview local: http://localhost:3017.
