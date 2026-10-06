'use client';

import Image from 'next/image';
import ProductPreview from './ProductPreview';
import MotionSystem from './MotionSystem';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-top"><span>VANTA / Independent footwear</span><span>Collection 2026</span></div>
      <div className="hero-copy">
        <p className="product-kicker">Introducing FORM 01</p>
        <h1 id="hero-title"><span>ĐỊNH CHẤT</span><br /><span>RIÊNG.</span></h1>
        <p className="hero-description">Một dáng giày quen.<br />Một cách thể hiện rất riêng.</p>
        <a className="button dark" href="#phoi-mau">Tìm phối màu của bạn <span aria-hidden="true">↗</span></a>
      </div>
      <div className="hero-art">
        <span className="hero-edition" aria-hidden="true">01</span>
        <ProductPreview id="hero" title="FORM 01 — Sakura" className="hero-preview"><Image className="hero-shoe" src="/images/hero-v5.webp" alt="VANTA FORM 01 — sneaker Sakura có họa tiết hồng xanh và đế chunky" width={1800} height={1200} sizes="(max-width:760px) 90vw, 52vw" preload /></ProductPreview>
        <div className="hero-spec"><span className="spec-line" /><span>FORM 01<br /><strong>Sakura / Graphic edition</strong></span></div>
      </div>
      <div className="hero-bottom"><MotionSystem /><a href="#thiet-ke">Khám phá thiết kế <span aria-hidden="true">↓</span></a><span className="hero-index">Design study — 001</span></div>
    </section>
  );
}
