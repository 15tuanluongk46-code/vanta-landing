# Setup VANTA trên máy mới

Chạy lệnh từ root repo. Baseline: Linux/WSL, Node.js 22, npm, Python 3 cho static packaging. Windows native chưa được xác minh vì script dùng cú pháp biến môi trường POSIX. Không cần Blender để chạy website.

## Cài và chạy

```bash
npm ci
npm run dev
```

Mở http://localhost:3017. Script hiện bind `0.0.0.0`; dùng trên mạng tin cậy. `npm ci` dùng `package-lock.json`; không thay bằng cập nhật dependency trong lúc setup. Cần Internet tải package và Google fonts lúc build (`next/font/google`). Không có secrets bắt buộc; form email là demo, không gửi dữ liệu.

## Kiểm tra production và trình duyệt

```bash
npx playwright install chromium
npm run lint
npm run typecheck
npm run build
npm test
```

Playwright tự chạy `npm run start`, nên build phải có trước. Cổng 3017 cần rảnh hoặc server hiện có phải đúng bản đang kiểm tra. Mặc định dùng Chromium do Playwright quản lý. Có thể chọn browser đã cài bằng `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/absolute/path/to/chrome npm test`. Trên Linux thiếu thư viện hệ thống, xem lỗi Playwright và dùng `npx playwright install --with-deps chromium` với quyền cài package phù hợp.

## Static export — không tự deploy

```bash
npm run build:static
npm run test:static
```

Lệnh build dùng Python 3 đóng gói `.next-static/` thành `dist/pages/` và `dist/vanta-form-01.zip`. Static tests tự chạy server loopback 3018. `TEST_BASE_URL` chỉ dùng khi chủ động kiểm tra server khác. Upload production là thao tác riêng theo [deployment](docs/DEPLOYMENT.md).

## Dữ liệu đi kèm và dữ liệu tạo ra

- Tracked: `src/`, `public/`, `assets/`, `tests/`, lockfile. Website dùng GLB/WebP đã xuất sẵn.
- Generated/ignored: `node_modules/`, `.next/`, `.next-static/`, `dist/`, test reports. Clone mới chưa có ZIP.
- `HANDOVER-MANIFEST.json` thuộc gói bàn giao lịch sử, không phải đầu vào bắt buộc của repo.
- Blender và đường dẫn source trong script lịch sử chỉ cần khi tái dựng asset. Đọc `assets/ASSETS.md` trước; không chạy hàng loạt script để setup website.

## Khắc phục

- Browser executable không tồn tại: bỏ biến override, cài Chromium bằng lệnh trên.
- Build không tải được font: kiểm tra kết nối tới Google Fonts; không kết luận source hỏng chỉ từ lỗi mạng.
- Static package thiếu index: chạy trọn `npm run build:static`, không gọi Python packaging trước export.
- Cổng bận: xác định đúng process; không tự kill server không thuộc phiên làm việc.

Kết quả lịch sử trong README không thay thế lần kiểm tra máy mới. Ghi lệnh thực tế, PASS/FAIL/NOT RUN và phiên bản runtime vào báo cáo bàn giao.
