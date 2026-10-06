# VANTA V6 — preview 3D trong từng card

## Phạm vi

Theo yêu cầu đã duyệt: sửa hero bị che/cắt và thêm “Xem 3D” ngay trong mọi card giày, có phóng to. Tái sử dụng sneaker có họa tiết và bộ ảnh V5.

## Triển khai

- `src/components/ProductPreview.tsx`: provider chỉ cho phép một viewer hoạt động, tải component 3D khi bấm, điều khiển inline, native dialog, phục hồi focus và ảnh tĩnh khi tải lỗi.
- `src/components/ShoeCanvas.tsx`: GLB cache dùng chung, OrbitControls, camera fit theo bounds/aspect, zoom/reset/xem đế, vật liệu riêng từng instance. Lagoon/Citrus dùng hoán đổi kênh màu tương ứng render V5, không sửa texture cache chung.
- `src/components/viewer-types.ts`: kiểu phối màu, góc nhìn và lệnh điều khiển.
- Bảy vị trí: hero, story, campaign (đôi giày), detail upper/heel/sole và colorway đang chọn.
- Hero sử dụng grid/flex và ảnh contain. Animation scale từ 0.94 đến 1 thay thế xoay/offset khiến ảnh vượt khung.
- Bỏ scroll pin cũ ở story. Trang cuộn bình thường khi viewer mở; dialog giữ focus và khóa cuộn nền khi phóng to.
- Canvas demand-render, dpr giới hạn 1–1.5. `data-model-ready` chỉ được đánh dấu sau frame có triangles thực sự vẽ.

## Verification — 2026-10-06

- PASS: `npm run lint`.
- PASS: `npm run typecheck`.
- PASS: `npm run build` — Next.js production build.
- PASS: `npm test` — **13/13**, lần chạy cuối 24.3 giây.
- Hero được đo bounds trong animation tại 360, 390, 768, 1440 và 1920 px.
- Bảy card đều vẽ model; chỉ một canvas hoạt động; GLB không tải trước thao tác và chỉ có một network request giữa các card.
- Kiểm thử mouse orbit, reset, zoom, xem đế, native dialog, Escape/focus return, fallback khi GLB lỗi, reduced motion và cuộn trang.
- Ba phối màu được kiểm tra khác nhau bằng canvas buffer; touch drag và pinch được kiểm tra bằng Chrome DevTools Protocol.
- Axe checks cho trang và dialog. Các kiểm tra nav, signup demo, card images và campaign từ V5 vẫn chạy.

## Kiểm tra trực quan

Ảnh bằng chứng nằm trong `test-results/` (hero, từng inline card, expanded-bottom và colorways). Bản JPEG nhỏ cho lần review ở `/tmp/opencode/vanta-v6-{desktop,mobile-small,inline-small,bottom-small}.jpg`.

Vision đọc được các bản ảnh nhỏ sau khi đường đọc ảnh trực tiếp không hỗ trợ và Ollama helper trả HTTP 500. Kết quả: hero desktop/mobile hiển thị toàn bộ giày, không chồng chữ/nút; viewer inline có họa tiết hồng/xanh; chế độ phóng to nhìn thấy đế và giày nằm trong khung. Các nhận xét ảnh được đối chiếu với kiểm tra bounds và frame-render ở trên.

## Giới hạn

- Kiểm thử trên Chromium local/headless; chưa xác minh Safari hoặc GPU điện thoại thật. Touch CDP là mô phỏng.
- Kiểm tra màu chứng minh ba phối màu khác nhau và shader dùng đúng phép hoán đổi; không phải phép đo khớp màu pixel tuyệt đối với ánh sáng Blender.
- Zoom chủ động có thể đưa chi tiết sát hoặc vượt khung; reset trả về góc fit toàn bộ model.
- Signup vẫn là demo; preview local tại `http://localhost:3017`.
