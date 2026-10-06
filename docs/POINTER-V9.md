# VANTA V9 — pointer-follow interaction

## Phạm vi

Yêu cầu: đưa chuột đến đâu có hiệu ứng đi theo đến đó. Giữ bố cục, graphic sneaker, theme từng card, native scroll snap và thao tác viewer đã được chấp nhận.

- `src/components/PointerEffects.tsx`: vòng sáng 44px, bốn điểm đuôi mờ dần, spotlight theo tọa độ card, poster nghiêng tối đa 2.5 độ, nút dịch tối đa 3px. Giữ con trỏ hệ thống; các lớp hiệu ứng không nhận pointer events.
- Vòng sáng được đưa vào native dialog khi phóng to để hiển thị đúng top layer. Spotlight là lớp CSS, không phải đèn vật lý trong scene 3D; camera chỉ thay đổi qua thao tác viewer.
- Mobile dùng pulse chạm 600ms. Pause, reduced motion, tab ẩn, cuộn, thao tác bàn phím và blur dọn trạng thái con trỏ. RAF dừng khi vị trí đã ổn định.
- `MotionSystem.tsx` khám phá section xuất hiện muộn sau hydration, giữ reveal một lần và chỉ đánh dấu sau khi section thực sự vào vùng nhìn và motion được bật.
- `globals.css` chứa hiệu ứng, không thay đổi GLB hoặc texture V5.

## Kiểm chứng local — 2026-10-06

- PASS: `npm run lint`.
- PASS: `npm run typecheck`.
- PASS: `npm run build:static` — 40 file, ZIP `dist/vanta-form-01.zip` 2,250,506 bytes.
- PASS: `npm run test:static` — 28/28, 54.6s.
- `tests/pointer.spec.ts`: tọa độ bám chuột, đuôi mờ khi dừng, spotlight/tilt, magnetic button, pause, reduced motion, top-layer dialog, hover không tự xoay camera, pulse mobile và swipe cuộn trang.
- Các kiểm thử hồi quy bao gồm 7 viewer, màu sắc, lazy load, lỗi tải, camera, responsive, theme, scroll snap, motion và accessibility.
- Ảnh `test-results/v9-pointer-hero.png` được kiểm tra trực quan qua bản thu nhỏ: giày trọn khung, vòng con trỏ/spotlight nhìn thấy, chữ/nút không chồng hoặc bị cắt.

## Triển khai công khai

- Cloudflare Pages project `vanta-form-01`, Production: https://vanta-form-01.pages.dev.
- Dashboard xác nhận 40/40 file đã tải lên và triển khai thành công ngày 2026-10-06.
- PASS: `TEST_BASE_URL=https://vanta-form-01.pages.dev npm test` — 28/28, 42.6s; kiểm tra bằng browser context mới, không cần đăng nhập.
- Quy trình cập nhật: `DEPLOYMENT.md`.

## Giới hạn

Kiểm thử tự động dùng Chromium; touch được giả lập qua CDP. Chưa đo FPS trên điện thoại thật hoặc kiểm chứng Safari. Ảnh tĩnh chỉ xác nhận bố cục; hành vi theo thời gian được kiểm tra bằng thao tác và trạng thái trong Playwright.
