// φ-λ 曲线 + 欧拉曲线 + 4 类工作点（双轴 λ 参考线）

import { useMemo } from 'react';
import {
  ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, Scatter, ComposedChart, Label,
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
  const d = useDerived();
  const { fy, axisCls, lambdaX, lambdaY, phiX, phiY, controlAxis } = d;
  const grade = useStore((s) => s.grade);

  // 控制轴 λ 下，4 类的 φ（用于"如果按这一 λ 套用 4 种曲线分别会是多少"对照）
  const lambdaCtrl = controlAxis === 'y' ? lambdaY : lambdaX;
  const dotsAtCtrl = useMemo(() => ({
    a: phiGB(lambdaCtrl, fy, 'a'),
    b: phiGB(lambdaCtrl, fy, 'b'),
    c: phiGB(lambdaCtrl, fy, 'c'),
    d: phiGB(lambdaCtrl, fy, 'd'),
  }), [lambdaCtrl, fy]);

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
      <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-x-3 gap-y-1">
        <div className="text-[13px] font-semibold text-slate-200">
          稳定系数曲线 φ - λ <span className="text-slate-500 text-[11px] ml-2">{grade} · fy = {fy} MPa</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          λ<sub>x</sub>=<span className="text-rose-300">{lambdaX.toFixed(1)}</span>
          <span className="text-slate-500"> ({axisCls.x})</span>
          <span className="mx-1">·</span>
          λ<sub>y</sub>=<span className="text-emerald-300">{lambdaY.toFixed(1)}</span>
          <span className="text-slate-500"> ({axisCls.y})</span>
          <span className="mx-1">·</span>
          控制=<span className="text-blue-300">λ<sub>{controlAxis}</sub></span>
        </div>
      </div>
      <div className="text-[10px] text-slate-500 mb-2 flex flex-wrap gap-x-3 gap-y-0.5">
        <span><Dot c={CLS_COLORS[axisCls.x]}/> 工作点 x：λ={lambdaX.toFixed(1)}, φ<sub>x</sub>=<span className="text-slate-200 font-mono">{phiX.toFixed(3)}</span> （{axisCls.x} 类曲线）</span>
        <span><Dot c={CLS_COLORS[axisCls.y]}/> 工作点 y：λ={lambdaY.toFixed(1)}, φ<sub>y</sub>=<span className="text-slate-200 font-mono">{phiY.toFixed(3)}</span> （{axisCls.y} 类曲线）</span>
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
            <Line type="monotone" dataKey="a" stroke={CLS_COLORS.a} dot={false} name="a 类" strokeWidth={isUsed('a', axisCls) ? 2.5 : 1.1} />
            <Line type="monotone" dataKey="b" stroke={CLS_COLORS.b} dot={false} name="b 类" strokeWidth={isUsed('b', axisCls) ? 2.5 : 1.1} />
            <Line type="monotone" dataKey="c" stroke={CLS_COLORS.c} dot={false} name="c 类" strokeWidth={isUsed('c', axisCls) ? 2.5 : 1.1} />
            <Line type="monotone" dataKey="d" stroke={CLS_COLORS.d} dot={false} name="d 类" strokeWidth={isUsed('d', axisCls) ? 2.5 : 1.1} />
            {/* 双轴 λ 参考线 */}
            <ReferenceLine x={lambdaX} stroke="#fb7185" strokeDasharray="3 3" strokeWidth={controlAxis === 'x' ? 2 : 1}>
              <Label value={`λx=${lambdaX.toFixed(1)}`} position="top" fill="#fb7185" fontSize={10} />
            </ReferenceLine>
            <ReferenceLine x={lambdaY} stroke="#34d399" strokeDasharray="3 3" strokeWidth={controlAxis === 'y' ? 2 : 1}>
              <Label value={`λy=${lambdaY.toFixed(1)}`} position="top" fill="#34d399" fontSize={10} dy={14} />
            </ReferenceLine>

            {/* 在控制 λ 下，4 个类的 φ 值散点 */}
            <Scatter
              data={[{ lambda: lambdaCtrl, value: dotsAtCtrl.a }]}
              dataKey="value"
              fill={CLS_COLORS.a}
              stroke="#0f1117"
              shape="circle"
              legendType="none"
              r={5}
            />
            <Scatter
              data={[{ lambda: lambdaCtrl, value: dotsAtCtrl.b }]}
              dataKey="value"
              fill={CLS_COLORS.b}
              stroke="#0f1117"
              shape="circle"
              legendType="none"
              r={5}
            />
            <Scatter
              data={[{ lambda: lambdaCtrl, value: dotsAtCtrl.c }]}
              dataKey="value"
              fill={CLS_COLORS.c}
              stroke="#0f1117"
              shape="circle"
              legendType="none"
              r={5}
            />
            <Scatter
              data={[{ lambda: lambdaCtrl, value: dotsAtCtrl.d }]}
              dataKey="value"
              fill={CLS_COLORS.d}
              stroke="#0f1117"
              shape="circle"
              legendType="none"
              r={5}
            />
            {/* 当前柱的两个真实工作点：(λx, φx) 在 axisCls.x 曲线上，(λy, φy) 在 axisCls.y 曲线上 */}
            <Scatter
              data={[{ lambda: lambdaX, value: phiX }]}
              dataKey="value"
              fill={CLS_COLORS[axisCls.x]}
              stroke="#f8fafc"
              strokeWidth={2}
              shape="circle"
              legendType="none"
              r={7}
            />
            <Scatter
              data={[{ lambda: lambdaY, value: phiY }]}
              dataKey="value"
              fill={CLS_COLORS[axisCls.y]}
              stroke="#f8fafc"
              strokeWidth={2}
              shape="circle"
              legendType="none"
              r={7}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function isUsed(c: SectionClass, axisCls: { x: SectionClass; y: SectionClass }): boolean {
  return axisCls.x === c || axisCls.y === c;
}

function Dot({ c }: { c: string }) {
  return <span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: c }} />;
}
