// 实时数值卡：双轴 λ/φ，N_E, N_GB, N/N_cr 利用率

import { useStore, useDerived } from '../store';

export function ResultCards() {
  const P = useStore((s) => s.P);
  const d = useDerived();
  const u = Math.max(0, d.utilization);
  const safe = u < 0.85;
  const danger = u >= 1.0;

  return (
    <div className="bg-[#151820] border border-[#2a2f3a] rounded-md p-3 space-y-3">
      <div className="text-[13px] font-semibold text-slate-200">实时计算结果</div>

      {/* 双轴长细比与稳定系数 */}
      <div className="space-y-1.5">
        <AxisRow
          axis="x"
          label={d.props.Ix >= d.props.Iy ? '绕 x 轴 (强轴)' : '绕 x 轴 (弱轴)'}
          lambda={d.lambdaX}
          phi={d.phiX}
          cls={d.axisCls.x}
          isControl={d.controlAxis === 'x'}
          i={d.props.ix}
        />
        <AxisRow
          axis="y"
          label={d.props.Iy > d.props.Ix ? '绕 y 轴 (强轴)' : '绕 y 轴 (弱轴)'}
          lambda={d.lambdaY}
          phi={d.phiY}
          cls={d.axisCls.y}
          isControl={d.controlAxis === 'y'}
          i={d.props.iy}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Cell label="N_E"  value={`${(d.N_E / 1000).toFixed(1)} kN`} hint="欧拉" />
        <Cell label="N_GB" value={`${(d.N_GB / 1000).toFixed(1)} kN`} hint="GB φAfy" />
        <Cell label="N_cr" value={`${(d.N_cr / 1000).toFixed(1)} kN`} hint="min" highlight />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[11px] text-slate-400">N / N_cr 利用率</span>
          <span className={`text-sm font-mono ${danger ? 'text-red-400' : safe ? 'text-emerald-300' : 'text-amber-300'}`}>
            {(u * 100).toFixed(1)}%
            {danger && <span className="ml-2 text-[11px] text-red-400">⚠ 已失稳</span>}
            {!danger && !safe && <span className="ml-2 text-[11px] text-amber-300">接近临界</span>}
          </span>
        </div>
        <div className="h-2.5 bg-[#1c2029] rounded-full overflow-hidden">
          <div
            className={`h-full transition-[width] duration-100 ${
              danger ? 'bg-red-500' : safe ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, u * 100)}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-500 mt-1.5">N = {(P / 1000).toFixed(1)} kN</div>
      </div>
    </div>
  );
}

const AXIS_COLORS = { x: '#fb7185', y: '#34d399' } as const;
const CLS_COLOR_MAP: Record<string, string> = {
  a: '#22c55e', b: '#3b82f6', c: '#f59e0b', d: '#ef4444',
};

function AxisRow({
  axis, label, lambda, phi, cls, isControl, i,
}: { axis: 'x' | 'y'; label: string; lambda: number; phi: number; cls: string; isControl: boolean; i: number }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] ${
      isControl ? 'bg-blue-600/15 border border-blue-500/40' : 'bg-[#1c2029] border border-transparent'
    }`}>
      <span className="font-mono text-[11px] w-6" style={{ color: AXIS_COLORS[axis] }}>
        λ<sub>{axis}</sub>
      </span>
      <span className="text-slate-400 text-[11px] flex-1">{label}</span>
      <span
        className="text-[10px] font-bold w-4 h-4 inline-flex items-center justify-center rounded-sm text-white"
        style={{ background: CLS_COLOR_MAP[cls] }}
        title={`截面类别 ${cls}`}
      >
        {cls}
      </span>
      <span className="text-slate-400 text-[10px] font-mono">i={i.toFixed(1)}</span>
      <span className="text-slate-100 font-mono w-12 text-right">{lambda.toFixed(1)}</span>
      <span className="text-slate-400 text-[10px]">→φ=</span>
      <span className="text-slate-100 font-mono w-12 text-right">{phi.toFixed(3)}</span>
      {isControl && <span className="text-[10px] text-blue-300">控制</span>}
    </div>
  );
}

function Cell({
  label, value, hint, highlight,
}: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`px-2.5 py-2 rounded ${highlight ? 'bg-blue-600/15 border border-blue-500/40' : 'bg-[#1c2029]'}`}>
      <div className="text-[10px] text-slate-400 flex items-baseline gap-1">
        <span>{label}</span>
        {hint && <span className="text-[9px] text-slate-500">{hint}</span>}
      </div>
      <div className="text-[14px] font-mono text-slate-100 mt-0.5">{value}</div>
    </div>
  );
}
