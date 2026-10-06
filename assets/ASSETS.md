# Asset manifest

## V10 — vệt tốc độ và ba chế độ chuyển động hiện tại

- Thay vòng con trỏ và đuôi chấm V9 bằng ba vệt mảnh theo hướng/tốc độ chuột, tắt sau khoảng 170ms đứng yên. Giữ con trỏ hệ thống, spotlight và tương tác 3D.
- Bộ chọn Theo hệ thống / Bật hiệu ứng / Tắt hiệu ứng; lưu lựa chọn trong trình duyệt, vẫn dùng được trong phiên nếu storage bị chặn.
- Bật hiệu ứng ghi đè reduced motion theo lựa chọn rõ ràng; Theo hệ thống tiếp tục theo dõi cài đặt máy. Kiểm chứng: `../docs/SPEED-MOTION-V10.md`.

## V9 — nền tảng hiệu ứng bám con trỏ

- Vòng sáng và đuôi ngắn đi theo con trỏ; spotlight theo vị trí trong card, poster nghiêng nhẹ và nút hút chuột trong biên độ nhỏ.
- Hiệu ứng hoạt động cả trong dialog 3D; rê chuột không thay đổi camera. Mobile có phản hồi chạm, pause/reduced motion tắt hiệu ứng.
- Sửa khởi tạo reveal cho các section xuất hiện sau hydration. Tái sử dụng assets V5; kiểm chứng: `../docs/POINTER-V9.md`.

## V8 — nền tảng motion và phản hồi tương tác

- Hero entrance/float, reveal một lần, phản hồi click và viền công nghệ; có nút tạm dừng và hỗ trợ reduced motion.
- Viewer giữ poster đến frame 3D thật, báo tải/lỗi, hiển thị góc camera khi thao tác; camera easing 480ms, đổi phối màu giữ góc nhìn.
- Tái sử dụng assets V5 và hành vi cuộn/theme V7. Kiểm chứng: `../docs/MOTION-V8.md`.

## V7 — nền tảng cuộn và theme

- Native CSS scroll snap căn section trên desktop đủ rộng/cao; mobile và màn hình thấp dùng proximity để nội dung dài vẫn đọc hết.
- Inline 3D và dialog kế thừa màu card, bao gồm ba phối màu. Con lăn cuộn trang khi xem inline và zoom khi phóng to.
- Tái sử dụng toàn bộ geometry, texture và ảnh V5; tiếp tục dùng viewer V6. Kiểm chứng: `../docs/SCROLL-THEME-V7.md`.

## V6 — nền tảng tương tác, tái sử dụng assets V5

- Bảy card (hero, story, campaign, ba detail và colorway) đều có preview 3D tại chỗ và hộp thoại phóng to.
- Dùng chung `form-01-v5.glb`, tải sau lần bấm đầu tiên và cache giữa các card. Chỉ một viewer hoạt động tại một thời điểm.
- Sakura giữ màu nguồn; shader của Lagoon/Citrus hoán đổi kênh base color `brg`/`gbr`, tương ứng các render Blender V5. Geometry và các map PBR khác dùng chung.
- Xoay bằng chuột/cảm ứng, zoom, xem đế, reset, Escape đóng hộp thoại và fallback ảnh tĩnh. Hero dùng bố cục contain trong grid/flex, không còn ảnh quá khổ hoặc offset âm.
- Kiểm chứng V6: `../docs/INTERACTIVE-V6.md`.

## V5 — nguồn assets đang sử dụng

- Nguồn: [Chunky Y2K sneakers — whitney, Meshy](https://www.meshy.ai/3d-models/Chunky-Y2K-sneakers-white-color-with-colorful-accents-kawaiinanime-streetwear-019f3884-3869-7cc7-a6fc-3ba13de09104), trang nguồn ghi **CC0**. Không mua hoặc tiêu credits.
- Bản nguồn: `/home/sss/Downloads/3d-assets/meshy/019f3884-3869-7cc7-a6fc-3ba13de09104/model.glb`, 1,703,352 bytes. Tách một chiếc nguyên vẹn tại khoảng trống giữa đôi giày; giữ UV và texture PBR.
- Scene riêng `VANTA-Graphic-v5`; master `blender/graphic-v5.blend`; script `blender/graphic_v5.py`. Shoe mesh sau tách: 6,600 vertices / 13,082 faces.
- `../public/models/form-01-v5.glb`: 1,512,548 bytes; 1 mesh / 1 material / 4 images; extension `KHR_texture_transform`. Export chỉ scene hiện tại và mesh được chọn.
- Hero/profile/ba phối màu: `../public/images/{hero,profile,sakura,lagoon,citrus}-v5.{png,webp}`, 1800×1200.
- Ba card **toàn bộ giày**: `../public/images/detail-{upper,heel,sole}-v5.{png,webp}`, 1200×1200; góc 3/4, sau và ngang. Tên file được giữ theo các slot cũ, không còn là macro crop.
- Campaign: `../public/images/campaign-v5.{png,webp}`, 1600×1500. CSS `contain` giữ toàn bộ ảnh trên mobile và desktop.
- Sakura giữ texture nguồn; Lagoon và Citrus đổi thứ tự kênh màu của base-color texture để giữ họa tiết. V5 ban đầu chỉ có viewer Sakura; V6 hỗ trợ tương tác cả ba phối màu như mô tả phía trên.
- `prepare_v5.py` kiểm tra kích thước và alpha bounds trước khi xuất WebP. `framing-v5.json`: cả tám ảnh trong suốt đạt margin tối thiểu 9.916%, vượt ngưỡng 8%.
- Viewer lazy-load, camera fit theo bounds, fallback ảnh tĩnh và reduced motion. Canvas có `data-model-ready=true` sau frame thực sự vẽ triangles.
- Bằng chứng và giới hạn kiểm tra: `../docs/SOURCED-V5.md`.

## Lưu trữ V4

- Nguồn: [White Sneaker — mikepouch, Meshy](https://www.meshy.ai/3d-models/White-Sneaker-v2-019571e5-26b4-77c1-a348-bc018bed9662), trang nguồn ghi **CC0**. Tải từ community; không mua hoặc tiêu credits.
- Bản nguồn: `/home/sss/Downloads/3d-assets/meshy/019571e5-26b4-77c1-a348-bc018bed9662/model.glb` (3,892,308 bytes, 172,338 triangles). Texture base color 2048×2048.
- `blender/sourced_v4.py`: chuẩn bị vật liệu, ánh sáng và chín góc render trong scene riêng `VANTA-Sourced-v4`.
- `blender/sourced-v4.blend`: scene V4 được lưu riêng; giữ mesh render đầy đủ và bản web giảm polygon.
- `prepare_v4.py`: chuyển các PNG sang WebP và tạo contact sheet.
- `../public/models/form-01-v4.glb`: 2,341,496 bytes, 60,318 triangles, 1 mesh / 1 material / 1 embedded JPEG. Chỉ dùng extension `KHR_texture_transform`; không cần Draco decoder.
- Chuẩn hóa chiều dài 0.30 m cho concept. Bản web được Decimate ratio 0.35; export chỉ chọn `GEO-V4-Web` với `use_active_scene=True` và `use_selection=True` để tránh kéo mesh từ scene khác.
- Hero, profile và ba phối màu: `../public/images/{hero,profile,chalk,carbon,clay}-v4.{png,webp}`, 1800×1200.
- Macro: `../public/images/detail-{upper,heel,sole}-v4.{png,webp}`, 1200×1200.
- Campaign: `../public/images/campaign-v4.{png,webp}`, 1600×1500, hai bản sao cùng sneaker trên bục cam.
- Chalk giữ texture nguồn; Carbon và Clay là phối màu concept đã chỉnh trong Blender. Viewer tương tác dùng Chalk; ba phối màu được trình bày bằng render.
- Website tải GLB sau thao tác “Khám phá 3D”, có ảnh tĩnh và đường quay lại khi tải lỗi. Attribution hiển thị ở footer.

## Lưu trữ V1–V3 — Blender master

- `blender/build_sneaker.py`: geometry sneaker concept do agent dựng cho dự án.
- `blender/form-01.blend`: master V1 được bảo toàn.
- `blender/form-01-v2.blend`: phiên bản vật liệu nhám, micro-bump, sheen và ánh sáng V2.
- `blender/campaign-v2.blend`: scene studio đôi giày trên bục cam.
- `blender/refine_campaign.py`: tạo scene V2 riêng và render hero/campaign.
- `blender/form-01-v3.blend`: master V3 với panel dày, chỉ khâu rời, dây dẹt và quai ribbon.
- `blender/campaign-v3.blend`: scene studio đôi giày V3.
- `blender/detail_v3.py`: tạo master riêng từ V2 và render các góc macro/profile/hero.
- `../public/models/form-01.glb`: geometry V3 đã áp dụng modifiers, PBR materials màu Chalk; 1332124 bytes tại lần xuất.
- Kích thước dài khoảng 0.30 m là quy ước concept, không phải thông số sản xuất.

## Lưu trữ V3 — Product renders

Website V3 trước đây dùng `../public/images/{chalk,carbon,clay}-v3.webp`, render từ cùng geometry V3 với ba bộ màu. PNG tương ứng giữ alpha. Hero dùng `hero-v3.webp`; poster phần thiết kế dùng góc riêng `profile-v3.webp`. Các ảnh này có kích thước 1800×1200.

`../public/images/detail-{upper,heel,sole}-v3.{png,webp}` là ba render cận cảnh riêng 1200×1200 từ scene V3, màu Chalk. Card giữ tỉ lệ 1:1 và `object-fit: contain` ở desktop/mobile. Các ảnh V1/V2 còn giữ để đối chiếu, không còn được các component hiện tại tham chiếu.

## Lưu trữ V3 — Editorial imagery

`../public/images/campaign-v3.{png,webp}` là render studio 1600×1300: hai bản sao cùng geometry V3 đặt trên bục cam. Website mô tả đúng là campaign studio.

Noise/Bump procedural được dùng trong render Blender, không tự chuyển sang GLB. Viewer web dùng geometry V3 và Chalk PBR; chi tiết hạt bề mặt chưa được bake thành texture cho web.

## Typography

Barlow Condensed và Be Vietnam Pro được tải lúc build bằng `next/font/google`, hỗ trợ chữ tiếng Việt và tự host trên website. Build mới cần truy cập nguồn font nếu cache chưa có.
