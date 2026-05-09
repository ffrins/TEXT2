// 支座条件 + 计算长度系数 μ + 屈曲振型类型（用于 shader）

export type SupportKind = 'PIN_PIN' | 'FIX_FIX' | 'FIX_PIN' | 'FIX_FREE';

export interface SupportInfo {
  kind: SupportKind;
  label: string;
  mu: number;
  /** 振型函数 ID（与 shader 中 uMode 对应） */
  modeId: 0 | 1 | 2 | 3;
  /** 端部条件：[底端, 顶端] —— 'fix' | 'pin' | 'free' */
  ends: ['fix' | 'pin', 'fix' | 'pin' | 'free'];
}

export const SUPPORTS: Record<SupportKind, SupportInfo> = {
  PIN_PIN:  { kind: 'PIN_PIN',  label: '两端铰接 (μ=1)',       mu: 1.0, modeId: 0, ends: ['pin', 'pin'] },
  FIX_FIX:  { kind: 'FIX_FIX',  label: '两端固接 (μ=0.5)',     mu: 0.5, modeId: 1, ends: ['fix', 'fix'] },
  FIX_PIN:  { kind: 'FIX_PIN',  label: '一固一铰 (μ=0.7)',     mu: 0.7, modeId: 2, ends: ['fix', 'pin'] },
  FIX_FREE: { kind: 'FIX_FREE', label: '一固一自由悬臂 (μ=2)', mu: 2.0, modeId: 3, ends: ['fix', 'free'] },
};

export const SUPPORT_LIST = Object.values(SUPPORTS);
