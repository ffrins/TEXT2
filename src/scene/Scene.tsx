// 3D 场景：相机 + 三向灯光 + 地面 + 坐标系 + 支座/柱/箭头 + 高度标尺

import { Canvas } from '@react-three/fiber';
import {
  OrbitControls, Grid, ContactShadows,
  GizmoHelper, GizmoViewport, Html,
} from '@react-three/drei';
import { Column } from './Column';
import { Supports } from './Supports';
import { LoadArrow } from './LoadArrow';
import { useStore } from '../store';

export function Scene() {
  const L = useStore((s) => s.L);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [L * 1.1, L * 0.65, L * 1.4],
        near: 1,
        far: 100000,
        fov: 32,
      }}
      gl={{ antialias: true }}
      style={{
        background:
          'radial-gradient(ellipse at 50% 30%, #1f2530 0%, #131720 55%, #0a0d14 100%)',
      }}
    >
      {/* 三向布光（不依赖外网 HDR 资源） */}
      <hemisphereLight args={['#9bb6ff', '#1a1f2a', 0.55]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[L * 1.5, L * 2, L * 1.5]}
        intensity={1.1}
        color="#fff7e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={L * 6}
        shadow-camera-left={-L}
        shadow-camera-right={L}
        shadow-camera-top={L * 2}
        shadow-camera-bottom={-L}
        shadow-bias={-0.0005}
      />
      {/* 反向冷色边缘光：加强体积感 */}
      <directionalLight position={[-L * 1.2, L * 0.5, -L * 1.2]} intensity={0.4} color="#88a8ff" />
      {/* 顶部点光 */}
      <pointLight position={[0, L * 1.3, 0]} intensity={0.25} color="#ffffff" />

      {/* 地面：网格 + 接触阴影 */}
      <Grid
        args={[L * 8, L * 8]}
        cellSize={200}
        cellThickness={0.5}
        cellColor="#1f2630"
        sectionSize={1000}
        sectionThickness={1}
        sectionColor="#3a4452"
        fadeDistance={L * 4.5}
        fadeStrength={1.4}
        infiniteGrid={false}
        followCamera={false}
        position={[0, -2, 0]}
      />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.55}
        scale={L * 4}
        blur={2.6}
        far={L * 0.4}
        color="#000000"
      />

      {/* 高度标尺：左侧每米一刻度 */}
      <HeightScale L={L} />

      {/* 主对象 */}
      <Column />
      <Supports />
      <LoadArrow />

      <OrbitControls
        target={[0, L / 2, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={L * 0.25}
        maxDistance={L * 6}
        maxPolarAngle={Math.PI * 0.495}
      />

      {/* 坐标系小工具 */}
      <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
        <GizmoViewport axisColors={['#fb7185', '#a78bfa', '#34d399']} labelColor="#0f1117" />
      </GizmoHelper>
    </Canvas>
  );
}

function HeightScale({ L }: { L: number }) {
  // 每米一刻度，最左侧外移 1.5 倍最大截面尺寸
  const offset = 700;
  const ticks: { y: number; label: string }[] = [];
  const stepMm = L > 6000 ? 2000 : 1000;
  for (let y = 0; y <= L + 1; y += stepMm) {
    ticks.push({ y, label: `${(y / 1000).toFixed(stepMm < 1000 ? 1 : 0)} m` });
  }

  return (
    <group position={[-offset, 0, 0]}>
      {/* 竖直主刻度线 */}
      <mesh position={[0, L / 2, 0]}>
        <boxGeometry args={[2, L, 2]} />
        <meshBasicMaterial color="#3a4452" />
      </mesh>
      {ticks.map((t) => (
        <group key={t.y} position={[0, t.y, 0]}>
          <mesh>
            <boxGeometry args={[40, 2, 2]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          <Html position={[-30, 0, 0]} center distanceFactor={L * 1.2} style={{ pointerEvents: 'none' }}>
            <div style={{
              color: '#cbd5e1',
              fontSize: 11,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              textShadow: '0 0 4px #000',
            }}>
              {t.label}
            </div>
          </Html>
        </group>
      ))}
      {/* 顶部标签：L = ... */}
      <Html position={[0, L + 200, 0]} center distanceFactor={L * 1.2} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(15,17,23,0.85)',
          border: '1px solid #3b82f6',
          color: '#cbd5e1',
          fontSize: 11,
          fontFamily: 'monospace',
          padding: '2px 6px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
        }}>
          L = {(L / 1000).toFixed(2)} m
        </div>
      </Html>
    </group>
  );
}
