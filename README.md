# VANTA / FORM 01 — V10

Website concept sneaker đang online: https://vanta-form-01.pages.dev

## Chạy source trên máy khác

Yêu cầu Node.js 22 và npm. Giải nén gói bàn giao, mở terminal trong thư mục `vanta-landing`:

```bash
npm ci
npm run dev
```

Mở http://localhost:3017. Source và asset cần thiết để chạy website đều nằm trong gói; không cần Blender để chạy hoặc sửa giao diện.

Production local:

```bash
npm run build
npm run start
```

Nếu cổng 3017 đang được sử dụng, dừng preview cũ trước khi chạy server mới.

## Bản hiện tại

- Giày graphic Y2K, ba phối màu Sakura / Lagoon / Citrus.
- Bảy card có preview 3D, xoay, zoom, xem đế, reset và phóng to.
- Cuộn theo section, theme viewer đồng bộ với card.
- Vệt tốc độ mảnh theo chuột, spotlight và phản hồi nút.
- Ba chế độ chuyển động: Theo hệ thống / Bật hiệu ứng / Tắt hiệu ứng; lưu lựa chọn trên từng trình duyệt.
- Form email là demo, không gửi hoặc lưu email; chưa có backend đăng ký hoặc thanh toán.

## Cấu trúc bàn giao

| Đường dẫn | Nội dung |
|---|---|
| `src/` | Source Next.js, React, TypeScript, CSS và viewer 3D |
| `public/` | Ảnh, model GLB và asset website |
| `assets/blender/graphic-v5.blend` | Scene Blender của asset graphic hiện tại |
| `assets/blender/` | Các scene và script dựng hình, gồm các phiên bản trước |
| `assets/ASSETS.md` | Nguồn asset, giấy phép, lịch sử phiên bản |
| `docs/` | Tài liệu triển khai và kiểm thử |
| `tests/` | Playwright, accessibility và kiểm thử tương tác |
| `dist/vanta-form-01.zip` | Bản build V10 đã upload Cloudflare, có thể triển khai lại ngay |
| `HANDOVER-MANIFEST.json` | Danh sách file và SHA-256 trong gói bàn giao |

Gói không chứa `node_modules`, cache `.next` / `.next-static` hay kết quả test tạm. Cài lại dependency bằng `npm ci`. Các asset cũ và backup trong `assets/` được giữ để tham khảo.

## Cập nhật Cloudflare

Cần Python 3 để đóng gói. Trên Linux/macOS hoặc Windows WSL:

```bash
npm run build:static
```

Upload `dist/vanta-form-01.zip` vào project Cloudflare Pages **vanta-form-01**, tạo Production deployment mới. Hướng dẫn: `docs/DEPLOYMENT.md`.

Build mới cần Internet để cài dependency và lấy font Google qua Next.js. File ZIP build đã kèm trong gói có sẵn font và asset để triển khai trực tiếp.

## Kiểm tra và lưu ý chuyển máy

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

`playwright.config.ts` hiện trỏ Chrome của máy gốc tại `/home/sss/.local/bin/google-chrome`. Trên máy mới, sửa `executablePath` sang Chrome của máy đó, hoặc bỏ thuộc tính này và cài Chromium bằng `npx playwright install chromium`.

Các script Blender/chuẩn bị ảnh lịch sử có đường dẫn tuyệt đối của máy gốc; chỉnh lại đường dẫn trước khi render lại. Website dùng asset đã xuất sẵn nên không phụ thuộc các đường dẫn này. Xem `assets/ASSETS.md` trước khi chỉnh scene.

Kết quả xác minh bản V10 trước bàn giao: lint, typecheck, static build đạt; **32/32 Playwright tests đạt trên bản static và website công khai**. Chi tiết: `docs/SPEED-MOTION-V10.md`. Safari và GPU điện thoại thật chưa được kiểm tra.
