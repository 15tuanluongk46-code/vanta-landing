# V2 — sửa bản thiết kế bị từ chối

## Baseline và nguyên nhân

Phản hồi người dùng: bản đầu nhìn không chuyên nghiệp. Baseline được giữ ở `assets/rejected-v1.tar.gz`.

Vấn đề đã xác định: lặp ảnh giày tách nền giữa nhiều section; chất liệu phẳng; hero thiếu phân cấp; nội dung “xuống phố” không có ảnh on-feet; ghim scroll dù chưa mở viewer; CTA đăng ký thiếu target; ký hiệu ® không có cơ sở.

## Thay đổi

- Giữ nhận diện cam/đen/ivory và FORM 01. Hero chia copy trái / sản phẩm phải, nhịp headline ngắn hơn, CTA rõ.
- Scene Blender V2 riêng: nhám bề mặt, micro-bump và sheen, ánh sáng có tương phản hơn. Render lại hero, ba phối màu và macro.
- Campaign studio đôi giày trên bục tạo bố cục khác hero. Không gọi ảnh studio là lifestyle/on-feet.
- Chia nhịp trang: hero cam → thiết kế nền sáng → campaign tối → macro → bộ chọn màu → signup cam → footer.
- Viewer opt-in; chỉ pin sau khi bật 3D trên desktop không reduced motion.
- Bổ sung section đăng ký thực sự, bỏ ®, giữ thông báo demo minh bạch.
- Test phone 360/390, tablet 768 và desktop 1440; kiểm tra anchor và trường hợp model lỗi.

## Quyết định về skill

Các phương pháp cần thiết đã có trong frontend-design, app-ux-review và Blender materials/lighting. Lỗi nằm ở cách áp dụng và tiêu chí nghiệm thu, không phải thiếu tên skill. Không sửa hoặc cài thêm skill dùng chung. Kỹ thuật đạt không đồng nghĩa thẩm mỹ được duyệt.

## Còn giới hạn

Ảnh on-feet chưa có; viewer chưa có texture bake tương đương render. Bản V2 được bàn giao để người dùng đánh giá, không tự ghi nhận là đã được chấp thuận về thẩm mỹ.
