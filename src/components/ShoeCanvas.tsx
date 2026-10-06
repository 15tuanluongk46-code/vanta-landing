'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Box3, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Spherical, Vector3 } from 'three';
import type { Colorway, View, ViewerCommand } from './viewer-types';
import { useMotionEnabled } from './MotionSystem';

type Props = { colorway: Colorway; view: View; command: ViewerCommand; wheelZoom: boolean; onReady: () => void; onError: () => void };

function Model({ colorway, view, command, wheelZoom }: Props) {
  const motion = useMotionEnabled();
  const gltf = useLoader(GLTFLoader, '/models/form-01-v5.glb');
  const { camera, gl, size, invalidate } = useThree();
  const model = useMemo(() => {
    const shoe = gltf.scene.clone(true);
    shoe.position.sub(new Box3().setFromObject(shoe).getCenter(new Vector3()));
    const group = new Group(); group.add(shoe);
    if (view === 'pair') {
      const second = shoe.clone(true);
      second.position.add(new Vector3(.09, .06, -.23));
      second.rotation.y = Math.PI * .88;
      group.add(second);
    }
    group.position.sub(new Box3().setFromObject(group).getCenter(new Vector3()));
    const materials: MeshStandardMaterial[] = [];
    group.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const clone = (source: MeshStandardMaterial) => {
        const material = source.clone(); materials.push(material);
        // Same channel permutations as graphic_v5.py, after the texture's sRGB decode.
        material.onBeforeCompile = shader => {
          if (colorway === 'sakura') return;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
            `#include <map_fragment>\ndiffuseColor.rgb = diffuseColor.${colorway === 'lagoon' ? 'brg' : 'gbr'};`);
        };
        material.customProgramCacheKey = () => `vanta-${colorway}`;
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
    });
    return { group, materials, radius: new Box3().setFromObject(group).getSize(new Vector3()).length() / 2 };
  }, [gltf.scene, colorway, view]);
  useEffect(() => () => model.materials.forEach(material => material.dispose()), [model]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const flight = useRef<{ from: Spherical; to: Spherical; start: number } | null>(null);
  const motionRef = useRef(motion);
  useEffect(() => { motionRef.current = motion; if (!motion) invalidate(); }, [motion, invalidate]);
  const home = useMemo(() => {
    const vertical = camera instanceof PerspectiveCamera ? camera.fov * Math.PI / 360 : .375;
    const horizontal = Math.atan(Math.tan(vertical) * size.width / Math.max(size.height, 1));
    const distance = model.radius / Math.sin(Math.min(vertical, horizontal)) * 1.1;
    const direction = view === 'heel' ? new Vector3(.55, .23, .55) : view === 'side' ? new Vector3(0, .12, .7) : new Vector3(-.32, .28, .65);
    return { distance, position: direction.normalize().multiplyScalar(distance) };
  }, [camera, model.radius, size.width, size.height, view]);
  useEffect(() => {
    // Keep native page scrolling inline; OrbitControls retains drag and pinch.
    const passWheel = (event: WheelEvent) => event.stopImmediatePropagation();
    const canvas = gl.domElement;
    if (!wheelZoom) canvas.addEventListener('wheel', passWheel, { capture: true, passive: true });
    const controls = new OrbitControls(camera, gl.domElement);
    controlsRef.current = controls;
    controls.enablePan = false; controls.enableDamping = false;
    controls.minDistance = home.distance * .45; controls.maxDistance = home.distance * 2;
    controls.minPolarAngle = .001; controls.maxPolarAngle = Math.PI - .001;
    controls.target.set(0, 0, 0);
    const changed = () => invalidate();
    const start = () => {
      flight.current = null;
      canvas.setAttribute('data-camera-moving', 'false');
      canvas.closest<HTMLElement>('.viewer-session')?.setAttribute('data-interacting', 'true');
    };
    const end = () => canvas.closest<HTMLElement>('.viewer-session')?.setAttribute('data-interacting', 'false');
    controls.addEventListener('change', changed);
    controls.addEventListener('start', start); controls.addEventListener('end', end);
    camera.position.copy(home.position); camera.lookAt(0, 0, 0); controls.update(); invalidate();
    return () => { flight.current = null; canvas.removeEventListener('wheel', passWheel, true); controls.removeEventListener('change', changed); controls.removeEventListener('start', start); controls.removeEventListener('end', end); controls.dispose(); controlsRef.current = null; };
  }, [camera, gl, home, invalidate, wheelZoom]);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const destination = camera.position.clone();
    if (command.action === 'reset') destination.copy(home.position);
    if (command.action === 'bottom') destination.set(0, -home.distance, .001);
    if (command.action === 'in' || command.action === 'out') {
      const distance = Math.min(controls.maxDistance, Math.max(controls.minDistance, camera.position.length() * (command.action === 'in' ? .8 : 1.25)));
      destination.setLength(distance);
    }
    gl.domElement.setAttribute('data-view', command.action === 'bottom' ? 'bottom' : view);
    if (motionRef.current && command.serial > 0) {
      const from = new Spherical().setFromVector3(camera.position);
      const to = new Spherical().setFromVector3(destination);
      to.theta = from.theta + Math.atan2(Math.sin(to.theta - from.theta), Math.cos(to.theta - from.theta));
      flight.current = { from, to, start: performance.now() };
      gl.domElement.setAttribute('data-camera-moving', 'true');
    } else {
      flight.current = null; camera.position.copy(destination);
      gl.domElement.setAttribute('data-camera-moving', 'false');
    }
    controls.update(); invalidate();
  }, [command, camera, gl, home, invalidate, view]);
  useEffect(() => { gl.domElement.setAttribute('data-colorway', colorway); invalidate(); }, [colorway, gl, invalidate]);
  useFrame(() => {
    const movement = flight.current;
    if (!movement) return;
    const t = motionRef.current ? Math.min(1, (performance.now() - movement.start) / 480) : 1;
    const eased = 1 - (1 - t) ** 3;
    const { from, to } = movement;
    camera.position.setFromSpherical(new Spherical(
      from.radius + (to.radius - from.radius) * eased,
      from.phi + (to.phi - from.phi) * eased,
      from.theta + (to.theta - from.theta) * eased,
    ));
    controlsRef.current?.update();
    if (t === 1) { flight.current = null; gl.domElement.setAttribute('data-camera-moving', 'false'); }
    else invalidate();
  });
  return <primitive object={model.group} dispose={null} />;
}

function RenderProof({ onReady }: { onReady: () => void }) {
  const notified = useRef(false);
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
    gl.domElement.dataset.modelReady = String(gl.info.render.triangles > 0);
    gl.domElement.dataset.camera = camera.position.toArray().map(value => value.toFixed(5)).join(',');
    if (gl.info.render.triangles > 0 && !notified.current) { notified.current = true; onReady(); }
    const hud = gl.domElement.closest('.viewer-session')?.querySelector('.view-angle');
    if (hud) {
      const yaw = Math.round(Math.atan2(camera.position.x, camera.position.z) * 180 / Math.PI);
      const pitch = Math.round(Math.atan2(camera.position.y, Math.hypot(camera.position.x, camera.position.z)) * 180 / Math.PI);
      const text = `↔ ${yaw}°  /  ↕ ${pitch}°`;
      if (hud.textContent !== text) hud.textContent = text;
    }
  }, 1);
  return null;
}

function Unavailable({ onError }: { onError: () => void }) {
  useEffect(onError, [onError]);
  return <p className="preview-message">3D chưa khả dụng. Bạn vẫn có thể xem ảnh sản phẩm.</p>;
}

export default function ShoeCanvas(props: Props) {
  return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [-.13, .13, .43], fov: 43, near: .001, far: 20 }} gl={{ alpha: true, antialias: true }} fallback={<Unavailable onError={props.onError} />}>
    <ambientLight intensity={1.8} /><directionalLight position={[-2, 4, 3]} intensity={3} /><directionalLight position={[3, 1, -2]} intensity={2} />
    <Suspense fallback={null}><Model {...props} /></Suspense><RenderProof onReady={props.onReady} />
  </Canvas>;
}
