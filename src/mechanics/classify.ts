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
 * 表 7.2.1-1 (板厚 t<40mm)：
 *   轧制 H/工字钢  b/h  > 0.8：           x=a*, y=a*
 *   轧制 H/工字钢  b/h ≤ 0.8：            x=a*, y=b
 *   焊接 H，翼缘为焰切边：                x=b,  y=b
 *   焊接 H，翼缘为轧制/剪切边：           x=b,  y=c
 *   热轧无缝圆管：                        x=a*, y=a*
 *   焊接圆管：                            x=b,  y=b
 *   轧制实心方/矩形、热轧方管：           x=a*, y=a*
 *   焊接箱形 b/t < 20：                   x=b,  y=b
 *   焊接箱形 b/t ≥ 20：                   x=c,  y=c
 *
 * 表 7.2.1-2 (板厚 t≥40mm)，按翼缘厚 40≤t<80 / t≥80 分档：
 *   轧制 H/工字钢：         t<80 → x=b, y=c；t≥80 → x=c, y=d
 *   焊接 H 焰切边：         t<80 → x=b, y=b；t≥80 → x=c, y=c
 *   焊接 H 轧/剪边：        t<80 → x=b, y=c；t≥80 → x=c, y=d
 *   焊接箱形 b/t<20：       t<80 → x=b, y=b；t≥80 → x=c, y=c
 *   圆管：                  与 t<40 表同
 *
 * 注：规范中 Q235 改 b 类的注（带 * 项）仅适用于热轧无缝圆管/热轧实心矩形等特定行，
 *     不适用于轧制 H/工字钢、焊接箱形等。本实现按各行直接列出的类别返回。
 */
export function classifySection(
  kind: SectionKind,
  _grade: SteelGrade,
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
        // 轧制 H/工字钢（按表 7.2.1-1 第 1/2 行）
        // b/h 系翼缘宽与截面高之比
        const bh = sec && sec.kind === 'H' ? sec.b / sec.h : 0.8;
        const wide = bh > 0.8;
        if (t1) {
          // b/h>0.8: x=a, y=a ；b/h≤0.8: x=a, y=b
          res = wide ? { x: 'a', y: 'a' } : { x: 'a', y: 'b' };
        } else if (t40_80) {
          res = { x: 'b', y: 'c' };
        } else /* t≥80 */ {
          res = { x: 'c', y: 'd' };
        }
      } else if (fab === 'welded_flame') {
        if (t1 || t40_80) res = { x: 'b', y: 'b' };
        else              res = { x: 'c', y: 'c' };
      } else /* welded_rolled_edge */ {
        if (t1 || t40_80) res = { x: 'b', y: 'c' };
        else              res = { x: 'c', y: 'd' };
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

  return res;
}

/** 取双轴中较保守（编号大）的一类 */
export function worseClass(c: AxisClass): SectionClass {
  const order: SectionClass[] = ['a', 'b', 'c', 'd'];
  return order[Math.max(order.indexOf(c.x), order.indexOf(c.y))];
}
