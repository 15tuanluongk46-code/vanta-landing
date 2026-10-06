import Image from 'next/image';
import ProductPreview from './ProductPreview';

export default function DesignStory() {
  return <section id="thiet-ke" className="story" aria-labelledby="story-title">
    <div className="story-copy">
      <span className="section-label">The design</span>
      <h2 id="story-title">QUEN DÁNG.<br />LẠ CHẤT.</h2>
      <p>Họa tiết nhiều màu chạy trên những lớp thân giày trắng. Đế chunky, dây đan nổi và tinh thần Y2K — FORM 01 chọn cách xuất hiện thật rõ nét.</p>
      <div className="design-notes"><span>Graphic panels</span><span>Chunky silhouette</span><span>Three color expressions</span></div>
      <p>Bấm Xem 3D, kéo để xoay và khám phá cả mặt đế.</p>
    </div>
    <div className="story-stage">
      <ProductPreview id="story" title="Thiết kế FORM 01" view="side">
        <Image src="/images/profile-v5.webp" width={1800} height={1200} alt="Toàn bộ dáng ngang sneaker FORM 01 họa tiết Sakura" sizes="(max-width:760px) 100vw, 55vw" className="story-poster" />
      </ProductPreview>
      <div className="stage-caption"><span>FORM 01 / Sakura</span><span>Interactive design study</span></div>
    </div>
  </section>;
}
