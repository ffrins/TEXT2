// 3D 场景：相机、灯光、地面、柱、支座、力箭头

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
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
        position: [L * 1.2, L * 0.7, L * 1.2],
        near: 1,
        far: 100000,
        fov: 35,
      }}
      gl={{ antialias: true }}
      style={{ background: '#1a1d24' }}
    >
      {/* 灯光：工程示意感，柔和不抢色 */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[L * 1.5, L * 2, L * 1.5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={L * 6}
        shadow-camera-left={-L}
        shadow-camera-right={L}
        shadow-camera-top={L * 2}
        shadow-camera-bottom={-L}
      />
      <directionalLight position={[-L, L * 0.5, -L]} intensity={0.3} />

      {/* 地面 + 网格 */}
      <Grid
        args={[L * 6, L * 6]}
        cellSize={200}
        cellThickness={0.6}
        cellColor="#2a2f3a"
        sectionSize={1000}
        sectionThickness={1.0}
        sectionColor="#3f4654"
        fadeDistance={L * 4}
        fadeStrength={1.0}
        infiniteGrid={false}
        position={[0, -1, 0]}
      />

      {/* 主对象 */}
      <Column />
      <Supports />
      <LoadArrow />

      <OrbitControls
        target={[0, L / 2, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={L * 0.3}
        maxDistance={L * 6}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}
