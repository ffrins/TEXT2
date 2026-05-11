// 全局状态：参数 + 派生量

import { create } from 'zustand';
import type { SectionParams, SectionKind, SectionProps } from './mechanics/sections';
import { computeSectionProps, H_PRESETS } from './mechanics/sections';
import type { SteelGrade } from './mechanics/steel';
import { fyOf, E_STEEL } from './mechanics/steel';
import type { SupportKind } from './mechanics/supports';
import { SUPPORTS } from './mechanics/supports';
import type { SectionClass, AxisClass, Fabrication } from './mechanics/classify';
import { classifySection, worseClass } from './mechanics/classify';
import { eulerNcr, gbNcr, phiGB, slenderness } from './mechanics/buckling';

export interface AppState {
  // 输入
  sectionKind: SectionKind;
  section: SectionParams;
  hPresetName: string;            // H 型钢规格名（仅 sectionKind === 'H' 用）
  L: number;                       // 柱长 mm
  support: SupportKind;
  grade: SteelGrade;
  classOverride: SectionClass | 'auto';
  fabrication: Fabrication;        // 制造方式，影响截面分类
  P: number;                       // 轴向力 N
  deformAmp: number;               // 教学用变形放大系数 [0..1]，仅显示，不影响力学计算

  // setters
  setSectionKind: (k: SectionKind) => void;
  setSection: (s: SectionParams) => void;
  setHPreset: (name: string) => void;
  setL: (mm: number) => void;
  setSupport: (s: SupportKind) => void;
  setGrade: (g: SteelGrade) => void;
  setClassOverride: (c: SectionClass | 'auto') => void;
  setFabrication: (f: Fabrication) => void;
  setP: (N: number) => void;
  setDeformAmp: (a: number) => void;
}

/** 派生量（每次 selector 重新计算，便宜） */
export interface DerivedState {
  props: SectionProps;
  fy: number;
  /** 自动判定的双轴截面类别（按规范） */
  axisClsAuto: AxisClass;
  /** 实际使用的双轴截面类别（受 classOverride 影响） */
  axisCls: AxisClass;
  /** 控制轴（较保守一侧）类别，仅用于徽标摘要 */
  cls: SectionClass;
  mu: number;
  /** 绕 x 轴长细比（μL / ix），即弱轴方向位移对应的强轴 i */
  lambdaX: number;
  lambdaY: number;
  /** 控制长细比（取大者） */
  lambda: number;
  /** 控制轴 'x' | 'y' */
  controlAxis: 'x' | 'y';
  phiX: number;
  phiY: number;
  phi: number;        // = min(phiX, phiY)
  N_E: number;        // 欧拉临界力（按 iMin）
  N_GB: number;       // φ · A · fy
  N_cr: number;       // min(N_E, N_GB)
  utilization: number;
}

const defaultH = H_PRESETS.find((x) => x.name === 'HW200×200')!.p;

export const useStore = create<AppState>((set) => ({
  sectionKind: 'H',
  section: defaultH,
  hPresetName: 'HW200×200',
  L: 4000,
  support: 'PIN_PIN',
  grade: 'Q235',
  classOverride: 'auto',
  fabrication: 'rolled',
  P: 200_000, // 200 kN
  deformAmp: 0.5,

  setSectionKind: (k) =>
    set((s) => {
      // 切换截面类型时给一个合理默认
      let section: SectionParams = s.section;
      let hPresetName = s.hPresetName;
      if (k === 'H' && s.section.kind !== 'H') {
        section = defaultH;
        hPresetName = 'HW200×200';
      } else if (k === 'BOX' && s.section.kind !== 'BOX') {
        section = { kind: 'BOX', H: 200, B: 200, t: 8 };
      } else if (k === 'PIPE' && s.section.kind !== 'PIPE') {
        section = { kind: 'PIPE', D: 200, t: 8 };
      } else if (k === 'RECT' && s.section.kind !== 'RECT') {
        section = { kind: 'RECT', h: 200, b: 100 };
      }
      return { sectionKind: k, section, hPresetName };
    }),
  setSection: (section) => set({ section }),
  setHPreset: (name) => {
    const preset = H_PRESETS.find((x) => x.name === name);
    if (!preset) return;
    set({ hPresetName: name, section: preset.p, sectionKind: 'H' });
  },
  setL: (L) => set({ L }),
  setSupport: (support) => set({ support }),
  setGrade: (grade) => set({ grade }),
  setClassOverride: (classOverride) => set({ classOverride }),
  setFabrication: (fabrication) => set({ fabrication }),
  setP: (P) => set({ P }),
  setDeformAmp: (deformAmp) => set({ deformAmp }),
}));

/**
 * 从原始参数派生所有力学结果。
 * 在组件中用 `const d = useDerived()` 即可拿到全部派生值。
 */
export function deriveAll(s: AppState): DerivedState {
  const props = computeSectionProps(s.section);
  const fy = fyOf(s.grade, props.tMax);
  const axisClsAuto = classifySection(s.sectionKind, s.grade, props.tMax, {
    fabrication: s.fabrication,
    section: s.section,
  });
  // 手动覆盖时两轴统一为同一类
  const axisCls: AxisClass = s.classOverride === 'auto'
    ? axisClsAuto
    : { x: s.classOverride, y: s.classOverride };
  const cls = worseClass(axisCls);
  const mu = SUPPORTS[s.support].mu;

  const lambdaX = slenderness(mu, s.L, props.ix);
  const lambdaY = slenderness(mu, s.L, props.iy);

  // 双轴各用其对应的类别曲线
  const phiX = phiGB(lambdaX, fy, axisCls.x);
  const phiY = phiGB(lambdaY, fy, axisCls.y);
  // 控制轴：φ 小者（承载力低者）
  const controlAxis: 'x' | 'y' = phiY < phiX ? 'y' : 'x';
  const lambda = controlAxis === 'y' ? lambdaY : lambdaX;
  const phi = Math.min(phiX, phiY);

  const Imin = Math.min(props.Ix, props.Iy);
  const N_E = eulerNcr(E_STEEL, Imin, mu, s.L);
  const N_GB = gbNcr(phi, props.A, fy);
  const N_cr = Math.min(N_E, N_GB);
  const utilization = s.P / N_cr;

  return {
    props, fy, axisClsAuto, axisCls, cls, mu,
    lambdaX, lambdaY, lambda, controlAxis,
    phiX, phiY, phi,
    N_E, N_GB, N_cr, utilization,
  };
}

export function useDerived(): DerivedState {
  const s = useStore();
  return deriveAll(s);
}
