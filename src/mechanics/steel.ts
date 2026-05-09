// 钢材等级与屈服强度（GB 50017-2017 表 4.4.6，简化版：仅区分 t<16 / 16≤t<40 / t≥40）
// 单位：MPa

export type SteelGrade = 'Q235' | 'Q355' | 'Q390' | 'Q420' | 'Q460';

export const STEEL_GRADES: SteelGrade[] = ['Q235', 'Q355', 'Q390', 'Q420', 'Q460'];

/** 弹性模量 E，GB 50017 取 206000 MPa */
export const E_STEEL = 206000;

/** 不同钢种、不同板厚区间下的屈服强度 fy (MPa) */
const FY_TABLE: Record<SteelGrade, { t16: number; t40: number; t63: number }> = {
  Q235: { t16: 235, t40: 225, t63: 215 },
  Q355: { t16: 355, t40: 345, t63: 335 },
  Q390: { t16: 390, t40: 370, t63: 350 },
  Q420: { t16: 420, t40: 400, t63: 380 },
  Q460: { t16: 460, t40: 440, t63: 420 },
};

/**
 * 按板厚分段查屈服强度。
 * @param grade 钢材等级
 * @param t 最大板厚 (mm)
 */
export function fyOf(grade: SteelGrade, t: number): number {
  const row = FY_TABLE[grade];
  if (t < 16) return row.t16;
  if (t < 40) return row.t40;
  return row.t63;
}
