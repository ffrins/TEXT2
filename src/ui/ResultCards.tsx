// 实时数值卡：λ, λn, φ, N_E, N_GB, N/N_cr 利用率

import { useStore, useDerived } from '../store';
import { lambdaN } from '../mechanics/buckling';

export function ResultCards() {
  const P = useStore((s) => s.P);
  const d = useDerived();
  const ln = lambdaN(d.lambda, d.fy);
  const u = Math.max(0, d.utilization);
  const safe = u < 0.85;
  const danger = u >= 1.0;

  return (
    <div className="bg-[#151820] border border-[#2a2f3a] rounded-md p-3 space-y-3">
      <div className="text-[13px] font-semibold text-slate-200">实时计算结果</div>

      <div className="grid grid-cols-3 gap-2">
        <Cell label="λ"     value={d.lambda.toFixed(1)} />
        <Cell label="λ_n"   value={ln.toFixed(3)} />
        <Cell label="φ"     value={d.phi.toFixed(3)} />
        <Cell label="N_E"   value={`${(d.N_E / 1000).toFixed(1)} kN`} hint="欧拉" />
        <Cell label="N_GB"  value={`${(d.N_GB / 1000).toFixed(1)} kN`} hint="GB φAfy" />
        <Cell label="N_cr"  value={`${(d.N_cr / 1000).toFixed(1)} kN`} hint="min" highlight />
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
