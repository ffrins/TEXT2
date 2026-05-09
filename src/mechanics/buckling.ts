// 轴心受压稳定计算：欧拉公式 + GB 50017-2017 附录 D 稳定系数 φ

import { E_STEEL } from './steel';
import type { SectionClass } from './classify';

/** 稳定系数 α 表（GB 50017-2017 表 D.0.5） */
const ALPHA: Record<SectionClass, { a1: number; lo: { a2: number; a3: number }; hi: { a2: number; a3: number }; split: number }> = {
  a: { a1: 0.41, lo: { a2: 0.986, a3: 0.152 }, hi: { a2: 0.986, a3: 0.152 }, split: 1.05 },
  b: { a1: 0.65, lo: { a2: 0.965, a3: 0.300 }, hi: { a2: 0.965, a3: 0.300 }, split: 1.05 },
  c: { a1: 0.73, lo: { a2: 0.906, a3: 0.595 }, hi: { a2: 1.216, a3: 0.302 }, split: 1.05 },
  d: { a1: 1.35, lo: { a2: 0.868, a3: 0.915 }, hi: { a2: 1.375, a3: 0.432 }, split: 1.05 },
};

/**
 * 计算正则化长细比 λ_n = (λ/π)·√(fy/E)
 */
export function lambdaN(lambda: number, fy: number): number {
  return (lambda / Math.PI) * Math.sqrt(fy / E_STEEL);
}

/**
 * GB 50017 附录 D 稳定系数 φ
 * @param lambda 长细比
 * @param fy 屈服强度 (MPa)
 * @param cls 截面类别
 */
export function phiGB(lambda: number, fy: number, cls: SectionClass): number {
  if (lambda <= 0) return 1;
  const ln = lambdaN(lambda, fy);
  const A = ALPHA[cls];
  if (ln <= 0.215) {
    return Math.max(0, 1 - A.a1 * ln * ln);
  }
  const params = ln <= A.split ? A.lo : A.hi;
  const term = params.a2 + params.a3 * ln + ln * ln;
  const disc = term * term - 4 * ln * ln;
  if (disc < 0) return 0;
  const phi = (1 / (2 * ln * ln)) * (term - Math.sqrt(disc));
  return Math.min(1, Math.max(0, phi));
}

/**
 * 欧拉临界力 N_E (N)
 * @param E 弹性模量 MPa
 * @param Imin 最小惯性矩 mm⁴
 * @param mu 计算长度系数
 * @param L 实际柱长 mm
 */
export function eulerNcr(E: number, Imin: number, mu: number, L: number): number {
  return (Math.PI ** 2 * E * Imin) / (mu * L) ** 2;
}

/**
 * GB 承载力设计值 N_GB = φ · A · fy （未考虑材料抗力分项系数；教学用）
 */
export function gbNcr(phi: number, A: number, fy: number): number {
  return phi * A * fy;
}

/** 长细比 λ = μL/i */
export function slenderness(mu: number, L: number, iMin: number): number {
  return (mu * L) / iMin;
}
