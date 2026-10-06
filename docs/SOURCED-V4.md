# VANTA V4 — sourced sneaker

## Kết quả

Thay sneaker procedural trên website bằng White Sneaker của mikepouch từ Meshy (CC0). Hero, profile, campaign, ba phối màu và ba macro cùng xuất phát từ một geometry. Nguồn và thông số nằm trong `assets/ASSETS.md`.

Preview: http://localhost:3017

## Verification — 2026-10-06

- PASS: `npm run lint`.
- PASS: `npm run typecheck`.
- PASS: `npm run build` — Next.js production build.
- PASS: `npm test` — 7/7, 17.8 giây ở lần chạy với production server đã khởi động.
- PASS: GLB container inspection bằng helper `meshy-rodin-download/scripts/download.py --inspect public/models/form-01-v4.glb`: 1 mesh, 1 material, 1 image, 2,341,496 bytes.
- PASS: kiểm tra ảnh desktop/mobile bằng local Vision; giày và nội dung chính hiển thị đầy đủ. Chụp riêng canvas sau khi tải xong xác nhận sneaker Chalk có texture, nhận diện rõ và nằm gọn trong khung.

Các test bao phủ card vuông và ảnh V4, responsive 360/390/768/1440 px, anchor navigation, đổi phối màu, form demo, axe accessibility, tải/lỗi GLB và quay lại ảnh tĩnh, desktop scroll pin và reduced motion.

Lần chạy đầu có 5 timeout ở `page.goto` chờ load; nguyên nhân chưa xác định. Kiểm tra navigation riêng sau khi khởi động server không thấy request treo hoặc page error. Chạy lại nguyên bộ test thành công, không tăng timeout hoặc bỏ assertion.

## Bằng chứng

- `test-results/desktop-hero.png`, `desktop-full.png`.
- `test-results/mobile-hero.png`, `mobile-full.png`.
- `test-results/card-{upper,heel,sole}-{390,768,1440}.png`.
- `/tmp/opencode/vanta-v4-canvas.png`: canvas đã tải xong; screenshot `test-results/viewer.png` chụp sớm chưa đủ chứng minh mesh đã vẽ.
- `/tmp/opencode/vanta-v4-sheet.jpg`: chín render đối chiếu.

## Giới hạn kiểm chứng

Kiểm tra Chromium trên máy này; chưa kiểm tra Safari hoặc thiết bị mobile thật. Chưa chạy Khronos glTF Validator đầy đủ. Form đăng ký vẫn là demo, không lưu hoặc gửi email. Phối màu Carbon/Clay có ở ảnh render; viewer hiện dùng Chalk.

Mở preview bằng Chrome AI thành công; console ghi nhận một 404 cho `/favicon.ico` (chưa có favicon). Không ảnh hưởng các asset sản phẩm hoặc viewer.
