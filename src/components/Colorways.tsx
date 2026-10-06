'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ProductPreview from './ProductPreview';
import type { Colorway } from './viewer-types';
import { useMotionEnabled } from './MotionSystem';

const colors = [
  { id: 'sakura', name: 'Sakura', hex: '#df83b8', text: 'Họa tiết hồng và xanh trên nền trắng. Bản phối nguyên bản mang tinh thần Y2K.' },
  { id: 'lagoon', name: 'Lagoon', hex: '#79bdc8', text: 'Một chuyển sắc mát trên cùng hệ họa tiết. Những mảng màu vẫn giữ rõ từng đường nét.' },
  { id: 'citrus', name: 'Citrus', hex: '#b9cc71', text: 'Sắc xanh vàng tươi làm mới những mảng graphic. Cùng cấu trúc, thêm một cá tính.' },
];

export default function Colorways() {
  const [selected, setSelected] = useState(0);
  const color = colors[selected];
  const root = useRef<HTMLElement>(null);
  const motion = useMotionEnabled();
  useEffect(() => {
    if (!motion) return;
    let cancelled = false;
    const animations: Animation[] = [];
    const image = root.current?.querySelector<HTMLImageElement>('.preview-poster img');
    const show = () => {
      if (cancelled) return;
      root.current?.querySelectorAll('.color-word, .color-description, .preview-poster').forEach(node => {
        animations.push(node.animate([{ opacity: .25 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' }));
      });
    };
    if (image) image.decode().then(show, show); else show();
    return () => { cancelled = true; animations.forEach(animation => animation.cancel()); };
  }, [selected, motion]);
  return (
    <section ref={root} id="phoi-mau" className="color-section" aria-labelledby="color-title">
      <div className="section-heading"><span className="section-label">The color edit</span><h2 id="color-title">CÙNG FORM.<br />KHÁC CHẤT.</h2><p>Ba bản phối.<br />Chọn cách bạn xuất hiện.</p></div>
      <div className="color-grid">
        <div className={`color-visual color-${color.id}`}>
          <span className="color-word" aria-hidden="true">{color.name}</span>
          <ProductPreview id="color" title={`FORM 01 — ${color.name}`} colorway={color.id as Colorway}><Image src={`/images/${color.id}-v5.webp`} width={1800} height={1200} alt={`Toàn bộ FORM 01 phối màu ${color.name}`} sizes="(max-width:760px) 100vw, 60vw" /></ProductPreview>
          <span className="color-index">FORM 01 — {color.name}</span>
        </div>
        <div className="color-copy">
          <p className="product-kicker">VANTA FORM 01</p>
          <div aria-live="polite" className="color-description"><h3>{color.name}</h3><p>{color.text}</p></div>
          <div className="swatches" role="group" aria-label="Chọn phối màu">{colors.map((item, i) => <button key={item.id} aria-pressed={selected === i} onClick={() => setSelected(i)}><span style={{ background: item.hex }} />{item.name}</button>)}</div>
          <dl className="product-facts"><div><dt>Dáng giày</dt><dd>Low-top</dd></div><div><dt>Bộ sưu tập</dt><dd>FORM 01</dd></div><div><dt>Trạng thái</dt><dd>Design concept</dd></div></dl>
          <a href="#dang-ky" className="button dark">Theo dõi FORM 01 <span aria-hidden="true">↗</span></a>
          <p className="availability">Sản phẩm concept. Chưa mở bán.</p>
        </div>
      </div>
    </section>
  );
}
