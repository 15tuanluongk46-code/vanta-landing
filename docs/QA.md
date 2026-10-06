# Verification — Detail V3

## Kết quả thực tế

| Check | Kết quả |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — Next.js production build |
| `npm test` | PASS — 7 Playwright tests, 11.7 s |
| Lighthouse mobile, production V3 | Performance 95 / Accessibility 100; LCP 2.9 s; CLS 0 |

Lighthouse là một lần đo local, không bảo đảm điểm tương đương trên hosting hoặc thiết bị khác. Mục tiêu Performance ≥85, Accessibility ≥95 đạt trong lần đo này.

```bash
CHROME_PATH=/home/sss/.local/bin/google-chrome npx lighthouse http://localhost:3017 --chrome-flags='--headless --no-sandbox' --only-categories=performance,accessibility --output=json --output-path=/tmp/opencode/vanta-v3-lighthouse.json --quiet
```

## Phạm vi kiểm thử

1. Desktop 1440×1000: điều hướng phối màu; ba trạng thái chọn/ảnh; CTA đến đúng `#dang-ky`; email sai bị từ chối; email hợp lệ hiện thông báo demo; không pageerror; axe WCAG 2A/AA và 2.1AA không báo violation.
2. Phone 360 và tablet 768: không overflow ngang, mọi anchor nội trang có đích tồn tại.
3. Mobile 390×844: không overflow, reduced motion không pin, axe không báo violation.
4. GLB HTTP 200, canvas hiện, thanh xoay hoạt động, trở lại poster được.
5. Request GLB bị abort: có recovery và trở về ảnh tĩnh.
6. Desktop có motion: không pin khi chưa bật 3D; pin sau khi bật; cuộn đổi góc nhìn; reduced motion gỡ pin.
7. Card chi tiết ở 390/768/1440 px: URL ảnh V3, tải ảnh thành công, khung vuông và `object-fit: contain`; chụp riêng cả ba card ở từng viewport.

## Kiểm tra thị giác

- Vision đã xem các macro V3 và card gót mobile: không ghi nhận lỗi cắt khung/giao cắt rõ ràng. Nhận xét ở độ phân giải nhỏ không chứng minh chất lượng chi tiết ở kích thước gốc.
- Carbon và campaign V3 đã được gửi kiểm tra riêng; phản hồi Vision còn chung chung/không rõ ở phần tiếp xúc, nên không dùng chúng để khẳng định vật liệu hoặc tiếp xúc đạt chuẩn quảng cáo.
- Screenshot: `test-results/desktop-hero.png`, `desktop-full.png`, `mobile-hero.png`, `mobile-full.png`, `layout-360.png`, `layout-768.png`, `viewer.png`.
- Card screenshots: `test-results/card-{upper,heel,sole}-{390,768,1440}.png`.
- Người dùng đã chấp nhận tổng thể layout V2, yêu cầu nâng chất lượng từng card. V3 giữ layout đó; chưa có phê duyệt thẩm mỹ V3 từ người dùng. Kiểm thử kỹ thuật không thay thế phê duyệt này.

## Giới hạn

- Campaign studio, chưa có ảnh người mang giày/on-feet.
- GLB Chalk dùng geometry V3; procedural texture chưa bake sang model web.
- Chưa test Safari/iOS hoặc GPU điện thoại thật. Chromium headless có software WebGL.
- Recovery test mô phỏng lỗi tải GLB, không bao phủ mọi trường hợp mất WebGL context.
- Form demo không có backend, không gửi hoặc lưu email.

**Verdict:** kiểm thử kỹ thuật nêu trên đạt; bộ ảnh/card V3 sẵn sàng để người dùng đánh giá trực tiếp.
