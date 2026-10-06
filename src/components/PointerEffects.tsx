'use client';

import { useEffect } from 'react';

// Short directional speed lines; no replacement cursor or permanent pointer ornament.
export default function PointerEffects() {
  useEffect(() => {
    const trail = document.createElement('div');
    trail.className = 'speed-trail'; trail.ariaHidden = 'true'; trail.dataset.visible = 'false';
    const strokes = Array.from({ length: 3 }, () => {
      const stroke = document.createElement('i'); trail.append(stroke); return stroke;
    });
    document.body.append(trail);
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, tx = 0, ty = 0, lastMove = 0, vx = 0, vy = 0;
    let surface: HTMLElement | null = null, button: HTMLElement | null = null;
    const pulses = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    const enabled = () => document.documentElement.dataset.motion === 'running' && !document.hidden;
    const resetSurface = () => {
      if (surface) { delete surface.dataset.pointer; surface = null; }
      if (button) { delete button.dataset.magnetic; button = null; }
    };
    const hide = () => {
      cancelAnimationFrame(frame); frame = 0;
      trail.dataset.visible = 'false'; lastMove = 0; vx = 0; vy = 0;
      resetSurface();
    };
    const draw = (time: number) => {
      frame = 0;
      if (!enabled()) { hide(); return; }
      const fade = Math.max(0, 1 - (time - lastMove) / 170);
      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx), dx = Math.cos(angle), dy = Math.sin(angle);
      strokes.forEach((node, index) => {
        const length = Math.min(32, 7 + speed * 13) * (1 - index * .2);
        const offset = (index - 1) * 5, behind = 12 + length + index * 6;
        node.style.width = `${length}px`;
        node.style.transform = `translate3d(${tx - dx * behind - dy * offset}px,${ty - dy * behind + dx * offset}px,0) rotate(${angle}rad)`;
        node.style.opacity = String(Math.min(.65, speed * .7) * fade * (1 - index * .2));
      });
      trail.dataset.visible = String(fade > 0 && speed > .02);
      if (fade > 0) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!enabled() || !fine.matches || event.pointerType === 'touch') { hide(); return; }
      const target = event.target instanceof Element ? event.target : null;
      const host = target?.closest('dialog[open]') || document.body;
      if (trail.parentElement !== host) host.append(trail);
      const now = performance.now(), elapsed = now - lastMove;
      if (lastMove && elapsed < 200) {
        vx = vx * .25 + (event.clientX - tx) / Math.max(8, elapsed) * .75;
        vy = vy * .25 + (event.clientY - ty) / Math.max(8, elapsed) * .75;
      } else { vx = 0; vy = 0; }
      tx = event.clientX; ty = event.clientY; lastMove = now;
      const dark = !!target?.closest('.lookbook, .footer, .button.dark');
      trail.dataset.tone = dark ? 'light' : 'dark';
      const nextSurface = target?.closest<HTMLElement>('.preview-dialog, .product-preview') || null;
      if (surface !== nextSurface) { if (surface) delete surface.dataset.pointer; surface = nextSurface; }
      if (surface) {
        const bounds = surface.getBoundingClientRect();
        const px = Math.max(0, Math.min(1, (tx - bounds.left) / bounds.width));
        const py = Math.max(0, Math.min(1, (ty - bounds.top) / bounds.height));
        surface.dataset.pointer = 'true';
        surface.style.setProperty('--pointer-x', `${px * 100}%`);
        surface.style.setProperty('--pointer-y', `${py * 100}%`);
        surface.style.setProperty('--tilt-x', `${(py - .5) * -5}deg`);
        surface.style.setProperty('--tilt-y', `${(px - .5) * 5}deg`);
        surface.style.setProperty('--shift-x', `${(px - .5) * 10}px`);
        surface.style.setProperty('--shift-y', `${(py - .5) * 8}px`);
      }
      const nextButton = target?.closest<HTMLElement>('button, .button, .header nav a, .text-link') || null;
      if (button !== nextButton) { if (button) delete button.dataset.magnetic; button = nextButton; }
      if (button) {
        const bounds = button.getBoundingClientRect(); button.dataset.magnetic = 'true';
        button.style.setProperty('--magnet-x', `${Math.max(-3, Math.min(3, (tx - bounds.left - bounds.width / 2) * .05))}px`);
        button.style.setProperty('--magnet-y', `${Math.max(-3, Math.min(3, (ty - bounds.top - bounds.height / 2) * .08))}px`);
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const down = (event: PointerEvent) => {
      if (!enabled() || event.pointerType !== 'touch') return;
      const target = event.target instanceof Element ? event.target : null;
      const pulse = document.createElement('i'); pulse.className = 'touch-pulse'; pulse.ariaHidden = 'true';
      pulse.style.left = `${event.clientX}px`; pulse.style.top = `${event.clientY}px`;
      (target?.closest('dialog[open]') || document.body).append(pulse);
      pulses.set(pulse, setTimeout(() => { pulse.remove(); pulses.delete(pulse); }, 600));
    };
    const state = () => { if (!enabled()) { hide(); pulses.forEach((timer, node) => { clearTimeout(timer); node.remove(); }); pulses.clear(); } };
    const scroll = () => { hide(); };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerdown', down, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('keydown', hide);
    document.addEventListener('visibilitychange', state);
    window.addEventListener('blur', hide); window.addEventListener('vanta-motion', state);
    return () => {
      hide(); trail.remove(); pulses.forEach((timer, node) => { clearTimeout(timer); node.remove(); });
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerdown', down);
      document.documentElement.removeEventListener('pointerleave', hide); document.removeEventListener('scroll', scroll);
      document.removeEventListener('keydown', hide); document.removeEventListener('visibilitychange', state);
      window.removeEventListener('blur', hide); window.removeEventListener('vanta-motion', state);
    };
  }, []);
  return null;
}
