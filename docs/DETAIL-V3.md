# Detail V3 — nâng ảnh từng hạng mục

## Phạm vi đã duyệt

Giữ tổng thể frontend V2; sửa chất lượng hình trong từng card. Baseline: `assets/before-detail-v3.tar.gz`.

## Thay đổi

| Hạng mục | Trước | V3 |
|---|---|---|
| Mép panel | Bề mặt không có độ dày | Solidify 0.8 mm và bevel 0.25 mm trên các panel được chọn |
| Chỉ khâu | Ống liên tục | Các mũi chỉ rời theo đường may |
| Dây giày | Tiết diện tròn ít cạnh | Tiết diện dẹt 12 cạnh |
| Quai gót | Ống uốn | Ribbon rộng 9 mm, có độ dày và subdivision |
| Macro | Ảnh 1000×800 bị cover vào khung khác tỉ lệ | Ba góc riêng 1200×1200, khung vuông contain |
| Thiết kế | Lặp góc hero | Profile ngang riêng |
| Phối màu/campaign | Model V2 | Render lại cùng master V3 |
| Viewer | Geometry V1 | GLB V3 đã áp dụng modifiers, 1.33 MB |

Các kích thước trên là quyết định tạo hình concept, không phải thông số sản xuất. Vật liệu giảm độ nổi micro-bump để tránh bề mặt nhiễu khi chụp cận.

## Bằng chứng và kiểm tra

- Model single: scene `VANTA-Detail-v3`, 163 mesh; campaign: scene `VANTA-Campaign-v3`, tổng 333 objects gồm set/camera/light.
- Bản Blender gốc/V2 được giữ nguyên, V3 lưu riêng trong `assets/blender/`.
- 9 render mới: upper, heel, sole, profile, hero, Chalk, Carbon, Clay, campaign; PNG nguồn và WebP trên website.
- Kiểm thử tự động card ở 390/768/1440 px xác nhận ảnh tải, đúng asset V3, khung vuông và contain. Screenshot riêng từng card trong `test-results/`.
- Kiểm thử hành vi, motion, lỗi tải model, accessibility: 7/7 pass. Lint, TypeScript và production build pass.
- Lighthouse mobile local: Performance 95, Accessibility 100, LCP 2.9 s, CLS 0.

Vision không cung cấp đánh giá thẩm mỹ chuyên sâu đáng tin cậy cho mọi ảnh: các phản hồi Carbon/campaign còn chung chung. Vì vậy không ghi nhận một “aesthetic pass” tự động. Preview để duyệt: http://localhost:3017 .
