# Agent guide — VANTA

- Đọc `README.md`, `SETUP.md`, `assets/ASSETS.md` trước khi sửa. UI hiện tại V10 dùng asset graphic V5; tài liệu V8 là lịch sử.
- Source giao diện ở `src/`, asset chạy web ở `public/`, test ở `tests/`. `assets/blender/` chứa cả source hiện tại và lịch sử, không phải bước cài dependency.
- Giữ `package-lock.json`; dùng Node 22 và `npm ci`. Browser mặc định do Playwright quản lý; chỉ override bằng `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` khi cần.
- Kiểm tra thay đổi UI/config bằng lint, typecheck, build và Playwright theo `SETUP.md`. Production tests cần build trước; static tests cần static export trước.
- Không cam kết Safari/GPU điện thoại thật từ Chromium headless. Báo chính xác check đã chạy và lỗi mạng/tool còn thiếu.
- Không đưa cache, ZIP generated hoặc secrets vào commit. Không tự deploy Cloudflare hay thêm backend thu email.
- Khi publish: kiểm tra diff, cập nhật SETUP/README nếu lệnh hoặc phụ thuộc thay đổi; stage đúng file, chỉ commit/push khi được yêu cầu và xác minh remote.
