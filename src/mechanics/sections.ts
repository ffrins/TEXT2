// 4 种主流截面的属性计算 + GB/T 11263 部分常用 H 型钢规格表
// 所有尺寸单位 mm，面积 mm²，惯性矩 mm⁴

export type SectionKind = 'H' | 'BOX' | 'PIPE' | 'RECT';

/** H 型钢参数（双轴对称工字形） */
export interface HParams {
  kind: 'H';
  h: number;   // 截面高
  b: number;   // 翼缘宽
  tw: number;  // 腹板厚
  tf: number;  // 翼缘厚
}

/** 箱形（矩形钢管） */
export interface BoxParams {
  kind: 'BOX';
  H: number; // 外高
  B: number; // 外宽
  t: number; // 壁厚（四壁等厚）
}

/** 圆管 */
export interface PipeParams {
  kind: 'PIPE';
  D: number; // 外径
  t: number; // 壁厚
}

/** 实心矩形 */
export interface RectParams {
  kind: 'RECT';
  h: number;
  b: number;
}

export type SectionParams = HParams | BoxParams | PipeParams | RectParams;

/** 截面派生属性 */
export interface SectionProps {
  A: number;     // 截面积 mm²
  Ix: number;    // 强轴惯性矩 mm⁴ (绕水平轴)
  Iy: number;    // 弱轴惯性矩 mm⁴
  ix: number;    // 强轴回转半径 mm
  iy: number;    // 弱轴回转半径 mm
  iMin: number;  // 最小回转半径 mm
  tMax: number;  // 最大板厚 mm（用于查 fy 与截面分类）
}

export function computeSectionProps(p: SectionParams): SectionProps {
  let A = 0, Ix = 0, Iy = 0, tMax = 0;
  switch (p.kind) {
    case 'H': {
      const { h, b, tw, tf } = p;
      A = 2 * b * tf + (h - 2 * tf) * tw;
      // 强轴：绕翼缘平行的轴（宽度方向）；按工程习惯 Ix 取绕水平轴
      Ix = (b * h ** 3) / 12 - ((b - tw) * (h - 2 * tf) ** 3) / 12;
      Iy = (2 * tf * b ** 3) / 12 + ((h - 2 * tf) * tw ** 3) / 12;
      tMax = Math.max(tf, tw);
      break;
    }
    case 'BOX': {
      const { H, B, t } = p;
      A = B * H - (B - 2 * t) * (H - 2 * t);
      Ix = (B * H ** 3) / 12 - ((B - 2 * t) * (H - 2 * t) ** 3) / 12;
      Iy = (H * B ** 3) / 12 - ((H - 2 * t) * (B - 2 * t) ** 3) / 12;
      tMax = t;
      break;
    }
    case 'PIPE': {
      const { D, t } = p;
      const d = D - 2 * t;
      A = (Math.PI / 4) * (D ** 2 - d ** 2);
      Ix = Iy = (Math.PI / 64) * (D ** 4 - d ** 4);
      tMax = t;
      break;
    }
    case 'RECT': {
      const { h, b } = p;
      A = b * h;
      Ix = (b * h ** 3) / 12;
      Iy = (h * b ** 3) / 12;
      tMax = Math.min(h, b); // 实心矩形，整段都"厚"
      break;
    }
  }
  const ix = Math.sqrt(Ix / A);
  const iy = Math.sqrt(Iy / A);
  return { A, Ix, Iy, ix, iy, iMin: Math.min(ix, iy), tMax };
}

/** GB/T 11263 部分常用 H 型钢规格（h × b × tw × tf, mm） */
export const H_PRESETS: { name: string; series: 'HW' | 'HM' | 'HN'; p: HParams }[] = [
  { name: 'HW100×100', series: 'HW', p: { kind: 'H', h: 100, b: 100, tw: 6,  tf: 8  } },
  { name: 'HW150×150', series: 'HW', p: { kind: 'H', h: 150, b: 150, tw: 7,  tf: 10 } },
  { name: 'HW200×200', series: 'HW', p: { kind: 'H', h: 200, b: 200, tw: 8,  tf: 12 } },
  { name: 'HW250×250', series: 'HW', p: { kind: 'H', h: 250, b: 250, tw: 9,  tf: 14 } },
  { name: 'HW300×300', series: 'HW', p: { kind: 'H', h: 300, b: 300, tw: 10, tf: 15 } },
  { name: 'HW350×350', series: 'HW', p: { kind: 'H', h: 350, b: 350, tw: 12, tf: 19 } },
  { name: 'HW400×400', series: 'HW', p: { kind: 'H', h: 400, b: 400, tw: 13, tf: 21 } },
  { name: 'HM194×150', series: 'HM', p: { kind: 'H', h: 194, b: 150, tw: 6,  tf: 9  } },
  { name: 'HM244×175', series: 'HM', p: { kind: 'H', h: 244, b: 175, tw: 7,  tf: 11 } },
  { name: 'HM294×200', series: 'HM', p: { kind: 'H', h: 294, b: 200, tw: 8,  tf: 12 } },
  { name: 'HM340×250', series: 'HM', p: { kind: 'H', h: 340, b: 250, tw: 9,  tf: 14 } },
  { name: 'HN198×99',  series: 'HN', p: { kind: 'H', h: 198, b: 99,  tw: 4.5,tf: 7  } },
  { name: 'HN248×124', series: 'HN', p: { kind: 'H', h: 248, b: 124, tw: 5,  tf: 8  } },
  { name: 'HN298×149', series: 'HN', p: { kind: 'H', h: 298, b: 149, tw: 5.5,tf: 8  } },
  { name: 'HN346×174', series: 'HN', p: { kind: 'H', h: 346, b: 174, tw: 6,  tf: 9  } },
  { name: 'HN396×199', series: 'HN', p: { kind: 'H', h: 396, b: 199, tw: 7,  tf: 11 } },
  { name: 'HN446×199', series: 'HN', p: { kind: 'H', h: 446, b: 199, tw: 8,  tf: 12 } },
  { name: 'HN500×200', series: 'HN', p: { kind: 'H', h: 500, b: 200, tw: 10, tf: 16 } },
];
