// 4 种支座符号（工程示意风格）

import { useStore } from '../store';
import { SUPPORTS } from '../mechanics/supports';
import type { SectionParams } from '../mechanics/sections';

function maxDim(s: SectionParams): number {
  switch (s.kind) {
    case 'H': return Math.max(s.h, s.b);
    case 'BOX': return Math.max(s.H, s.B);
    case 'PIPE': return s.D;
    case 'RECT': return Math.max(s.h, s.b);
  }
}

interface EndProps {
  type: 'pin' | 'fix' | 'free';
  size: number; // 支座符号特征尺寸 mm
  flip?: boolean; // 顶端时翻转
}

function EndSymbol({ type, size, flip = false }: EndProps) {
  const dir = flip ? -1 : 1; // 朝向：底端向下扩展，顶端向上扩展
  const plateThick = size * 0.12;
  const plateWidth = size * 1.6;
  const wedgeH = size * 0.5;

  if (type === 'free') return null;

  if (type === 'pin') {
    return (
      <group>
        {/* 楔形（三棱柱朝向柱身）*/}
        <mesh position={[0, -dir * wedgeH * 0.5, 0]} rotation={[0, 0, flip ? Math.PI : 0]}>
          <coneGeometry args={[size * 0.55, wedgeH, 4]} />
          <meshStandardMaterial color="#5b6573" roughness={0.6} />
        </mesh>
        {/* 铰接销 */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[size * 0.08, size * 0.08, plateWidth * 0.3, 24]} />
          <meshStandardMaterial color="#cbd2db" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* 底板 */}
        <mesh position={[0, -dir * (wedgeH + plateThick / 2), 0]}>
          <boxGeometry args={[plateWidth, plateThick, plateWidth]} />
          <meshStandardMaterial color="#3a3f4a" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // fix: 一块厚墩 + 周围更宽的底板
  return (
    <group>
      <mesh position={[0, -dir * size * 0.25, 0]}>
        <boxGeometry args={[size * 1.2, size * 0.5, size * 1.2]} />
        <meshStandardMaterial color="#5b6573" roughness={0.7} />
      </mesh>
      <mesh position={[0, -dir * (size * 0.5 + plateThick / 2), 0]}>
        <boxGeometry args={[plateWidth, plateThick, plateWidth]} />
        <meshStandardMaterial color="#3a3f4a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function Supports() {
  const section = useStore((s) => s.section);
  const L = useStore((s) => s.L);
  const support = useStore((s) => s.support);
  const info = SUPPORTS[support];
  const size = maxDim(section);

  return (
    <>
      {/* 底端 */}
      <group position={[0, 0, 0]}>
        <EndSymbol type={info.ends[0]} size={size} flip={false} />
      </group>
      {/* 顶端 */}
      <group position={[0, L, 0]}>
        <EndSymbol type={info.ends[1]} size={size} flip={true} />
      </group>
    </>
  );
}
