import Image from 'next/image';
import Hero from '@/components/Hero';
import DesignStory from '@/components/DesignStory';
import Colorways from '@/components/Colorways';
import Signup from '@/components/Signup';
import ProductPreview, { PreviewProvider } from '@/components/ProductPreview';

const details = [
  { title: 'Graphic lên tiếng', text: 'Góc ba phần tư: họa tiết nhiều màu, dây đan nổi và toàn bộ dáng giày.', view: 'upper' },
  { title: 'Cá tính từ phía sau', text: 'Góc nhìn từ gót giữ trọn thân giày, cổ giày và đường đế chunky.', view: 'heel' },
  { title: 'Một đường nét táo bạo', text: 'Góc ngang trọn vẹn cho thấy nhịp điệu của graphic và những lớp đế.', view: 'sole' },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Đến nội dung chính</a>
      <header className="header">
        <a href="#" className="wordmark" aria-label="VANTA trang đầu">VANTA<span className="brand-symbol" aria-hidden="true">✳</span></a>
        <nav aria-label="Điều hướng chính">
          <a href="#thiet-ke">Thiết kế</a>
          <a href="#phoi-mau">Phối màu</a>
          <a href="#lookbook">Campaign</a>
        </nav>
        <a href="#dang-ky" className="nav-cta">Đón FORM 01 ↗</a>
      </header>
      <main id="main"><PreviewProvider>
        <Hero />
        <DesignStory />
        <section className="lookbook" id="lookbook">
          <div className="lookbook-copy">
            <span className="section-label">The campaign / Form & space</span>
            <h2>MỘT FORM.<br />KHÔNG<br />KHUÔN MẪU.</h2>
            <p>Đường nét của giày. Hình khối của không gian. Một cuộc đối thoại giữa những điều quen thuộc và góc nhìn của riêng bạn.</p>
            <a href="#phoi-mau" className="text-link">Tìm phối màu của bạn ↗</a>
            <span className="campaign-signature" aria-hidden="true">V / 01</span>
          </div>
          <div className="lookbook-art">
            <ProductPreview id="campaign" title="FORM 01 — Studio pair" view="pair"><Image src="/images/campaign-v5.webp" alt="Hai chiếc FORM 01 có họa tiết Sakura trên bệ màu cam trong studio" width={1600} height={1500} sizes="(max-width:760px) 100vw, 60vw" /></ProductPreview>
            <span className="art-caption">Form & space — Studio campaign, 2026</span>
          </div>
        </section>
        <section className="details">
          <div className="details-heading">
            <div><span className="section-label">A closer look</span><h2>NHỎ TRONG CHI TIẾT.<br />RÕ TRONG CÁ TÍNH.</h2></div>
            <p>Ba góc nhìn trọn vẹn.<br />Một cá tính rõ ràng.</p>
          </div>
          <div className="detail-grid">
            {details.map(item => (
              <article key={item.view}>
                <div className={`detail-image detail-${item.view}`}>
                  <ProductPreview id={`detail-${item.view}`} title={item.title} view={item.view === 'heel' ? 'heel' : item.view === 'sole' ? 'side' : 'three-quarter'}><Image src={`/images/detail-${item.view}-v5.webp`} alt={`Toàn bộ FORM 01 — ${item.title.toLowerCase()}`} width={1200} height={1200} sizes="(max-width:760px) 90vw, 30vw" /></ProductPreview>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <Colorways />
      </PreviewProvider></main>
      <div className="closing">
        <section className="signup" id="dang-ky" aria-labelledby="signup-title">
          <div className="signup-copy"><span className="section-label">Stay in the loop</span><h2 id="signup-title">BƯỚC TIẾP THEO.<br />CÓ BẠN.</h2><p>Theo dõi hành trình phát triển FORM 01.<br />Trải nghiệm biểu mẫu đăng ký của VANTA.</p></div>
          <Signup />
        </section>
      <footer className="footer">
        <a href="#" className="footer-logo" aria-label="VANTA về đầu trang">VANTA</a>
        <div className="footer-bottom">
          <span>© 2026 VANTA Design Concept</span>
           <p>Thương hiệu và sản phẩm hư cấu. Website concept, không bán hàng hoặc thu thập email. Mô hình gốc: <a href="https://www.meshy.ai/3d-models/Chunky-Y2K-sneakers-white-color-with-colorful-accents-kawaiinanime-streetwear-019f3884-3869-7cc7-a6fc-3ba13de09104" target="_blank" rel="noreferrer">Chunky Y2K sneakers — whitney / Meshy (CC0)</a>. Phối màu và hình ảnh được biên tập cho VANTA.</p>
          <a href="#">Về đầu trang ↑</a>
        </div>
      </footer>
      </div>
    </>
  );
}
