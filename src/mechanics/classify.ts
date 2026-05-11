// GB 50017-2017 表 7.2.1-1（t<40mm）+ 表 7.2.1-2（t≥40mm）
// 按双轴返回截面类别。

import type { SectionKind, SectionParams } from './sections';
import type { SteelGrade } from './steel';

export type SectionClass = 'a' | 'b' | 'c' | 'd';

/** 制造方式：影响 H / BOX / PIPE 的类别判定 */
export type Fabrication =
  | 'rolled'              // 轧制（H/I 型钢、热轧无缝管、热轧矩形）
  | 'welded_flame'        // 焊接 H，翼缘为焰切边
  | 'welded_rolled_edge'; // 焊接 H，翼缘为轧制边或剪切边 / 焊接箱形 / 焊接圆管

export interface AxisClass { x: SectionClass; y: SectionClass }

export interface ClassifyOpts {
  fabrication?: Fabrication;
  /** 截面参数（用于 BOX 的 b/t 判定） */
  section?: SectionParams;
}

/**
 * GB 50017-2017 表 7.2.1-1 / -2 的双轴截面分类。
 *
 * 表 7.2.1-1 (t<40mm)：
 *   轧制 H/I：       x=a, y=b
 *   焊接 H 焰切边：  x=b, y=b
 *   焊接 H 轧/剪边： x=b, y=c
 *   热轧无缝圆管：   a (双轴)
 *   焊接圆管：       b (双轴)
 *   热轧矩形/方管：  a (双轴)
 *   焊接箱形 b/t<20: b (双轴)
 *   焊接箱形 b/t≥20: c (双轴)
 *
 * 表 7.2.1-2 (t≥40mm)，按 40≤t<80 / t≥80 两档：
 *   轧制 H/I：           t<80→x=b,y=c；t≥80→x=c,y=d
 *   焊接 H 焰切边：      t<80→x=b,y=b；t≥80→x=c,y=c
 *   焊接 H 轧/剪边：     t<80→x=b,y=c；t≥80→x=c,y=d
 *   焊接箱形 b/t<20：    t<80→x=b,y=b；t≥80→x=c,y=c
 *   圆管：               与 t<40 同
 *
 * 表注："当 Q235 钢材出现 a 类时，应改用 b 类。"
 */
export function classifySection(
  kind: SectionKind,
  grade: SteelGrade,
  tMax: number,
  opts: ClassifyOpts = {},
): AxisClass {
  const fab = opts.fabrication ?? 'rolled';
  const sec = opts.section;
  const t1 = tMax < 40;     // 表 1
  const t40_80 = tMax >= 40 && tMax < 80;

  let res: AxisClass;

  switch (kind) {
    case 'PIPE': {
      // 圆管：热轧无缝 a；焊接 b
      const cls: SectionClass = fab === 'rolled' ? 'a' : 'b';
      res = { x: cls, y: cls };
      break;
    }

    case 'H': {
      if (fab === 'rolled') {
        if (t1)       res = { x: 'a', y: 'b' };
        else if (t40_80) res = { x: 'b', y: 'c' };
        else /* t80 */ res = { x: 'c', y: 'd' };
      } else if (fab === 'welded_flame') {
        if (t1)       res = { x: 'b', y: 'b' };
        else if (t40_80) res = { x: 'b', y: 'b' };
        else /* t80 */ res = { x: 'c', y: 'c' };
      } else /* welded_rolled_edge */ {
        if (t1)       res = { x: 'b', y: 'c' };
        else if (t40_80) res = { x: 'b', y: 'c' };
        else /* t80 */ res = { x: 'c', y: 'd' };
      }
      break;
    }

    case 'BOX': {
      // 计算 b/t (使用更小宽 / 厚)
      const bt = sec && sec.kind === 'BOX'
        ? Math.min(sec.B, sec.H) / sec.t
        : 0;
      const slender = bt >= 20;
      if (t1) {
        const cls: SectionClass = slender ? 'c' : 'b';
        res = { x: cls, y: cls };
      } else if (t40_80) {
        const cls: SectionClass = slender ? 'c' : 'b';
        res = { x: cls, y: cls };
      } else {
        const cls: SectionClass = slender ? 'd' : 'c';
        res = { x: cls, y: cls };
      }
      break;
    }

    case 'RECT': {
      // 实心矩形 / 方形（按热轧棒材）：a 类
      const cls: SectionClass = t1 ? 'a' : (t40_80 ? 'b' : 'c');
      res = { x: cls, y: cls };
      break;
    }

    default:
      res = { x: 'b', y: 'b' };
  }

  // Q235 注：原 a → b
  if (grade === 'Q235') {
    if (res.x === 'a') res.x = 'b';
    if (res.y === 'a') res.y = 'b';
  }
  return res;
}

/** 取双轴中较保守（编号大）的一类 */
export function worseClass(c: AxisClass): SectionClass {
  const order: SectionClass[] = ['a', 'b', 'c', 'd'];
  return order[Math.max(order.indexOf(c.x), order.indexOf(c.y))];
}
