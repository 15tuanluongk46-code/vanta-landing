'use client';

import dynamic from 'next/dynamic';
import { Component, createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Colorway, View, ViewerCommand } from './viewer-types';
import { useMotionEnabled } from './MotionSystem';

const ShoeCanvas = dynamic(() => import('./ShoeCanvas'), { ssr: false, loading: () => <p className="preview-message">Đang tải 3D…</p> });
const PreviewContext = createContext<{ active: string | null; activate: (id: string | null) => void }>({ active: null, activate: () => {} });

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [active, activate] = useState<string | null>(null);
  return <PreviewContext.Provider value={{ active, activate }}>{children}</PreviewContext.Provider>;
}

class ViewerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? <p className="preview-message" role="status">3D chưa khả dụng. Chọn “Xem ảnh” để tiếp tục.</p> : this.props.children; }
}

function Expanded({ children, close, title }: { children: ReactNode; close: () => void; title: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const motion = useMotionEnabled();
  const closing = useRef(false);
  const animation = useRef<Animation | null>(null);
  function dismiss() {
    if (closing.current) return;
    closing.current = true;
    if (!motion) { close(); return; }
    animation.current = ref.current!.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '.98' }], { duration: 180, easing: 'ease-in' });
    animation.current.onfinish = close;
    animation.current.oncancel = close;
  }
  useEffect(() => {
    const dialog = ref.current!;
    const overflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = 'hidden';
    return () => { if (animation.current) { animation.current.oncancel = null; animation.current.cancel(); } dialog.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={ref} className="preview-dialog" aria-label={`3D — ${title}`} onCancel={event => { event.preventDefault(); dismiss(); }}>
    <div className="preview-dialog-heading"><h2>{title}</h2><button onClick={dismiss} autoFocus>Thu nhỏ / Đóng ✕</button></div>
    {children}
  </dialog>;
}

function ViewerSession({ colorway, view, command, expanded, title, children }: {
  colorway: Colorway; view: View; command: ViewerCommand; expanded: boolean; title: string; children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  return <div className="viewer-session" data-ready={ready}>
    {!ready && <div className="viewer-loading-poster" aria-hidden="true">{children}</div>}
    <div className="tech-corners" aria-hidden="true" />
    <div className="tech-scan" aria-hidden="true" />
    <div className="preview-canvas" role="group" aria-label={`Mô hình 3D ${title}`}>
      <ViewerBoundary onError={onError}><ShoeCanvas colorway={colorway} view={view} command={command} wheelZoom={expanded} onReady={onReady} onError={onError} /></ViewerBoundary>
    </div>
    <span className="view-angle" aria-hidden="true" />
    <span className="viewer-load-status" role="status">{failed ? 'Tiếp tục với ảnh sản phẩm' : ready ? '3D sẵn sàng' : 'Đang tải mô hình 3D…'}</span>
  </div>;
}

export default function ProductPreview({ id, title, children, className = '', colorway = 'sakura', view = 'three-quarter' }: {
  id: string; title: string; children: ReactNode; className?: string; colorway?: Colorway; view?: View;
}) {
  const { active, activate } = useContext(PreviewContext);
  const [expanded, setExpanded] = useState(false);
  const [command, setCommand] = useState<ViewerCommand>({ action: 'reset', serial: 0 });
  const expandButton = useRef<HTMLButtonElement>(null);
  const enabled = active === id;
  function send(action: ViewerCommand['action']) { setCommand(previous => ({ action, serial: previous.serial + 1 })); }
  function closeExpanded() { setExpanded(false); requestAnimationFrame(() => expandButton.current?.focus()); }
  const viewer = <>
    <ViewerSession colorway={colorway} view={view} command={command} expanded={expanded} title={title}>{children}</ViewerSession>
    <div className="preview-tools" role="group" aria-label={`Điều khiển ${title}`}>
      <button onClick={() => send('reset')}>Đặt lại góc nhìn</button>
      <button onClick={() => send('bottom')}>Xem mặt đế</button>
      <button onClick={() => send('in')} aria-label="Zoom gần">＋</button>
      <button onClick={() => send('out')} aria-label="Zoom xa">−</button>
    </div>
    <p className="preview-hint">{expanded ? 'Kéo / vuốt để xoay · Cuộn / chụm để zoom' : 'Kéo / vuốt để xoay · ＋ / − để zoom · Cuộn để lướt trang'}</p>
  </>;
  return <div data-preview-id={id} className={`product-preview ${className}${enabled ? ' preview-active' : ''}`}>
    <div className="tech-corners card-corners" aria-hidden="true" />
    <div className="preview-poster" style={{ visibility: enabled && !expanded ? 'hidden' : undefined }}>{children}</div>
    {enabled && !expanded && viewer}
    <div className="preview-actions">
      {enabled ? <><button onClick={() => { activate(null); setExpanded(false); }}>Xem ảnh</button><button ref={expandButton} onClick={() => setExpanded(true)}>Phóng to</button></> : <button onClick={() => activate(id)}>Xem 3D <span aria-hidden="true">↗</span></button>}
    </div>
    {enabled && expanded && <Expanded title={title} close={closeExpanded}>{viewer}</Expanded>}
  </div>;
}
