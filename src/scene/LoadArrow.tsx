// 顶端力箭头（轴向压力 N），向下指向柱顶

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../store';
import { useDerived } from '../store';

const REF_ARROW_LEN = 800; // mm，N=N_cr 时的箭头长度参考

export function LoadArrow() {
  const L = useStore((s) => s.L);
  const P = useStore((s) => s.P);
  const { N_cr } = useDerived();
  const section = useStore((s) => s.section);

  // 箭头长度按 P/Pcr 缩放，最少 200mm 起以便能看到
  const len = useMemo(() => {
    const ratio = Math.max(0.05, Math.min(1.5, P / Math.max(1, N_cr)));
    return Math.max(200, REF_ARROW_LEN * ratio);
  }, [P, N_cr]);

  const headLen = len * 0.25;
  const shaftLen = len - headLen;
  const shaftR = (() => {
    switch (section.kind) {
      case 'H': return Math.min(section.b, section.h) * 0.06;
      case 'BOX': return Math.min(section.B, section.H) * 0.06;
      case 'PIPE': return section.D * 0.06;
      case 'RECT': return Math.min(section.b, section.h) * 0.06;
    }
  })();
  const headR = shaftR * 2.6;

  // 着色：随利用率从绿 → 黄 → 红
  const color = useMemo(() => {
    const u = Math.max(0, Math.min(1, P / Math.max(1, N_cr)));
    const c = new THREE.Color();
    if (u < 0.5) c.lerpColors(new THREE.Color('#22c55e'), new THREE.Color('#eab308'), u / 0.5);
    else c.lerpColors(new THREE.Color('#eab308'), new THREE.Color('#ef4444'), (u - 0.5) / 0.5);
    return c;
  }, [P, N_cr]);

  return (
    <group position={[0, L, 0]}>
      {/* 箭杆：起点在柱顶上方 (len)，终点指向柱顶 */}
      <mesh position={[0, len - shaftLen / 2, 0]}>
        <cylinderGeometry args={[shaftR, shaftR, shaftLen, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* 箭头：尖朝下 */}
      <mesh position={[0, headLen / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[headR, headLen, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}
