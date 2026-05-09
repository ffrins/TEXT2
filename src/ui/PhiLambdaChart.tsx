// φ-λ 曲线 + 欧拉曲线 + 当前工作点

import { useMemo } from 'react';
import {
  ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, Scatter, ComposedChart,
} from 'recharts';
import { useStore, useDerived } from '../store';
import { phiGB } from '../mechanics/buckling';
import { E_STEEL } from '../mechanics/steel';
import type { SectionClass } from '../mechanics/classify';

const CLS_COLORS: Record<SectionClass, string> = {
  a: '#22c55e',
  b: '#3b82f6',
  c: '#f59e0b',
  d: '#ef4444',
};

export function PhiLambdaChart() {
  const fy = useDerived().fy;
  const lambdaCur = useDerived().lambda;
  const phiCur = useDerived().phi;
  const cls = useDerived().cls;
  const grade = useStore((s) => s.grade);

  // 生成 0..200 的 λ 网格，4 条 GB 曲线 + 欧拉曲线
  const data = useMemo(() => {
    const arr: { lambda: number; a: number; b: number; c: number; d: number; euler: number }[] = [];
    for (let lam = 1; lam <= 200; lam += 1) {
      const euler = (Math.PI ** 2 * E_STEEL) / (lam * lam) / fy; // 欧拉 σ_E / fy
      arr.push({
        lambda: lam,
        a: phiGB(lam, fy, 'a'),
        b: phiGB(lam, fy, 'b'),
        c: phiGB(lam, fy, 'c'),
        d: phiGB(lam, fy, 'd'),
        euler: Math.min(1, euler),
      });
    }
    return arr;
  }, [fy]);

  return (
    <div className="bg-[#151820] border border-[#2a2f3a] rounded-md p-3">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[13px] font-semibold text-slate-200">
          稳定系数曲线 φ - λ <span className="text-slate-500 text-[11px] ml-2">{grade} · fy = {fy} MPa</span>
        </div>
        <div className="text-[11px] text-slate-400">
          当前 (<span className="text-slate-100 font-mono">λ={lambdaCur.toFixed(1)}, φ={phiCur.toFixed(3)}</span>)
        </div>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 6, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#2a2f3a" strokeDasharray="3 3" />
            <XAxis
              dataKey="lambda"
              type="number"
              domain={[0, 200]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'λ', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 1.0]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'φ', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ background: '#0f1117', border: '1px solid #2a2f3a', fontSize: 12 }}
              labelFormatter={(v) => `λ = ${v}`}
              formatter={(v) => (typeof v === 'number' ? v.toFixed(3) : String(v))}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="euler" stroke="#9ca3af" strokeDasharray="4 3" dot={false} name="Euler σ/fy" />
            <Line type="monotone" dataKey="a" stroke={CLS_COLORS.a} dot={false} name="a 类" strokeWidth={cls === 'a' ? 2.5 : 1.2} />
            <Line type="monotone" dataKey="b" stroke={CLS_COLORS.b} dot={false} name="b 类" strokeWidth={cls === 'b' ? 2.5 : 1.2} />
            <Line type="monotone" dataKey="c" stroke={CLS_COLORS.c} dot={false} name="c 类" strokeWidth={cls === 'c' ? 2.5 : 1.2} />
            <Line type="monotone" dataKey="d" stroke={CLS_COLORS.d} dot={false} name="d 类" strokeWidth={cls === 'd' ? 2.5 : 1.2} />
            <ReferenceLine x={lambdaCur} stroke="#f8fafc" strokeDasharray="2 2" />
            <Scatter
              data={[{ lambda: lambdaCur, [cls]: phiCur }]}
              dataKey={cls}
              fill="#f8fafc"
              shape="circle"
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
