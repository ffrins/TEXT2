// GB 50017-2017 表 7.2.1-1 / -2 截面分类（简化版）
// 仅覆盖最常见组合：轧制 H、热轧厚壁箱形/箱管、热轧无缝圆管、轧制实心矩形

import type { SectionKind } from './sections';
import type { SteelGrade } from './steel';

export type SectionClass = 'a' | 'b' | 'c' | 'd';

/**
 * 简化的截面分类规则（板厚 t < 40mm）：
 *   - 圆管：a 类（绕任意轴）
 *   - 箱形（焊接，板厚一般）：b 类
 *   - 实心矩形：b 类
 *   - 轧制 H：绕强轴 a 类，绕弱轴 b 类（取保守较小者 → b 类）
 *
 * 板厚 t ≥ 40mm：整体降一级（a→b, b→c, c→d）
 *
 * Q235 钢：原 a 类 → b 类（GB 表注 a*）
 *
 * 真实工程中分类还区分轧制/焊接、翼缘宽厚比等，第一版给出的是教学常用近似。
 */
export function classifySection(
  kind: SectionKind,
  grade: SteelGrade,
  tMax: number,
): SectionClass {
  let cls: SectionClass;
  switch (kind) {
    case 'PIPE': cls = 'a'; break;
    case 'H':    cls = 'b'; break; // 取保守（弱轴）
    case 'BOX':  cls = 'b'; break;
    case 'RECT': cls = 'b'; break;
    default:     cls = 'b';
  }
  // 厚板修正
  if (tMax >= 40) cls = bump(cls);
  // Q235 修正：原 a 类 → b 类
  if (grade === 'Q235' && cls === 'a') cls = 'b';
  return cls;
}

function bump(c: SectionClass): SectionClass {
  return c === 'a' ? 'b' : c === 'b' ? 'c' : c === 'c' ? 'd' : 'd';
}
