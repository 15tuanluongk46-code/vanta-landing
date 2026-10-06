'use client';

import { useEffect, useSyncExternalStore } from 'react';
import PointerEffects from './PointerEffects';

const eventName = 'vanta-motion';
type MotionPreference = 'system' | 'on' | 'off';
const preferenceKey = 'vanta-motion-preference';
const validPreference = (value: string | null): MotionPreference => value === 'on' || value === 'off' ? value : 'system';
let memoryPreference: MotionPreference | null = null;
function readPreference() {
  if (memoryPreference !== null) return memoryPreference;
  try { return validPreference(localStorage.getItem(preferenceKey)); } catch { return 'system' as MotionPreference; }
}
function subscribePreference(update: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === preferenceKey || event.key === null) { memoryPreference = null; update(); } };
  window.addEventListener('storage', storage); window.addEventListener('vanta-preference', update);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener('vanta-preference', update); };
}
function subscribeReduced(update: () => void) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', update);
  return () => media.removeEventListener('change', update);
}
const subscribeInitialized = () => () => {};
function subscribe(update: () => void) {
  window.addEventListener(eventName, update);
  return () => window.removeEventListener(eventName, update);
}
export function useMotionEnabled() {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset.motion === 'running', () => false);
}

// One lifecycle owns decorative motion; content remains visible without JS.
export default function MotionSystem() {
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => 'system' as MotionPreference);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
  const initialized = useSyncExternalStore(subscribeInitialized, () => true, () => false);
  useEffect(() => {
    if (!initialized) return;
    const html = document.documentElement;
    html.dataset.motionPreference = preference;
    html.dataset.motion = preference === 'off' ? 'paused' : preference === 'system' && reduced ? 'reduced' : 'running';
    window.dispatchEvent(new Event(eventName));
    if (html.dataset.motion !== 'running') document.getAnimations().forEach(animation => animation.cancel());
  }, [initialized, preference, reduced]);
  useEffect(() => {
    const animations = new Set<Animation>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const ripples = new Set<HTMLElement>();
    const animate = (element: Element, frames: Keyframe[], delay = 0) => {
      if (document.documentElement.dataset.motion !== 'running') return;
      const animation = element.animate(frames, { duration: 720, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animations.add(animation);
      const remove = () => animations.delete(animation);
      animation.onfinish = remove; animation.oncancel = remove;
    };
    const reveal = (section: HTMLElement) => {
      if (document.documentElement.dataset.motion !== 'running' || section.dataset.inView !== 'true') return;
      const nodes = section.querySelectorAll<HTMLElement>('.hero-copy h1 span, .hero-description, .hero-copy .button, .story-copy h2, .design-notes span, .lookbook-copy h2, .lookbook .preview-poster, .detail-grid article, .section-heading h2, .signup h2');
      nodes.forEach((node, index) => {
        if (node.dataset.revealed) return;
        node.dataset.revealed = 'true';
        animate(node, node.matches('.preview-poster')
          ? [{ opacity: .3, scale: '.97' }, { opacity: 1, scale: '1' }]
          : [{ opacity: .15, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], Math.min(index * 85, 255));
      });
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const section = entry.target as HTMLElement;
        section.dataset.inView = String(entry.isIntersecting);
        if (!entry.isIntersecting) {
          section.getAnimations({ subtree: true }).forEach(animation => {
            if (animation.effect?.getTiming().iterations !== Infinity) animation.finish();
          });
          continue;
        }
        reveal(section);
      }
    }, { threshold: .18 });
    // Streaming hydration can attach ancestor/sibling sections after this child effect.
    const sections = new Set<HTMLElement>();
    const discover = () => {
      document.querySelectorAll<HTMLElement>('.hero, .story, .lookbook, .details, .color-section, .signup').forEach(node => {
        if (sections.has(node)) return;
        sections.add(node); observer.observe(node);
      });
    };
    const mutation = new MutationObserver(discover);
    mutation.observe(document.body, { childList: true, subtree: true });
    const startup = requestAnimationFrame(discover); discover();
    const resume = () => sections.forEach(reveal);
    window.addEventListener(eventName, resume);
    const visibility = () => {
      document.documentElement.dataset.pageVisible = String(!document.hidden);
      animations.forEach(animation => document.hidden ? animation.pause() : animation.play());
    };
    visibility(); document.addEventListener('visibilitychange', visibility);
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, .button, .text-link') : null;
      if (!target || document.documentElement.dataset.motion !== 'running') return;
      const bounds = target.getBoundingClientRect();
      const ripple = document.createElement('span'); ripple.className = 'tech-ripple'; ripple.ariaHidden = 'true';
      ripple.style.left = `${event.detail ? event.clientX - bounds.left : bounds.width / 2}px`;
      ripple.style.top = `${event.detail ? event.clientY - bounds.top : bounds.height / 2}px`;
      target.append(ripple); ripples.add(ripple);
      const timer = setTimeout(() => { ripple.remove(); ripples.delete(ripple); timers.delete(timer); }, 480);
      timers.add(timer);
    };
    document.addEventListener('click', click);
    return () => {
      observer.disconnect(); mutation.disconnect(); cancelAnimationFrame(startup); window.removeEventListener(eventName, resume); animations.forEach(animation => animation.cancel());
      timers.forEach(clearTimeout); ripples.forEach(ripple => ripple.remove());
      document.removeEventListener('click', click); document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return <><PointerEffects /><div className="motion-control">
    <label className="motion-toggle">Chuyển động
      <select value={preference} disabled={!initialized} onChange={event => {
        const value = validPreference(event.target.value); memoryPreference = value;
        try { localStorage.setItem(preferenceKey, value); } catch { /* Keep the choice in memory. */ }
        window.dispatchEvent(new Event('vanta-preference'));
      }}>
        <option value="system">Theo hệ thống</option>
        <option value="on">Bật hiệu ứng</option>
        <option value="off">Tắt hiệu ứng</option>
      </select>
    </label>
    <span className="motion-status" role="status">{!initialized ? 'Đang đọc cài đặt…' : preference === 'system' && reduced ? 'Đang theo cài đặt giảm chuyển động của máy' : preference === 'off' ? 'Hiệu ứng đang tắt' : preference === 'on' ? 'Hiệu ứng đang bật theo lựa chọn của bạn' : 'Đang theo cài đặt chuyển động của máy'}</span>
  </div></>;
}
