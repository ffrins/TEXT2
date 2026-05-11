// 3D 画布下侧：几何 / 支座 / 荷载 / 显示 四卡横向排列

import { useStore, useDerived } from '../store';
import { SUPPORT_LIST } from '../mechanics/supports';

export function BottomControls() {
  const s = useStore();
  const d = useDerived();

  return (
    <div className="border-t border-[#2a2f3a] bg-[#151820] p-3 grid gap-3"
         style={{ gridTemplateColumns: 'minmax(220px,1.2fr) minmax(260px,1.4fr) minmax(220px,1.2fr) minmax(180px,1fr)' }}>
      {/* 几何 */}
      <Card title="几何 Geometry">
        <FieldRow label={`柱长 L`} value={`${(s.L / 1000).toFixed(2)} m`} />
        <input
          type="range"
          min={500}
          max={12000}
          step={100}
          value={s.L}
          onChange={(e) => s.setL(+e.target.value)}
          className="w-full accent-blue-500"
        />
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-slate-400">L (mm)</span>
          <input
            type="number"
            step={50}
            value={s.L}
            onChange={(e) => s.setL(+e.target.value)}
            className="flex-1 bg-[#1c2029] border border-[#2a2f3a] text-slate-100 px-2 py-1 rounded text-[12px]"
          />
        </div>
      </Card>

      {/* 支座 + 计算长度 */}
      <Card title="支座 Boundary Conditions">
        <div className="grid grid-cols-2 gap-1">
          {SUPPORT_LIST.map((sp) => (
            <label
              key={sp.kind}
              className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer border text-[11px] ${
                s.support === sp.kind
                  ? 'bg-blue-600/15 border-blue-500/60 text-blue-200'
                  : 'bg-[#1c2029] border-transparent hover:border-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <input
                  type="radio"
                  name="support"
                  checked={s.support === sp.kind}
                  onChange={() => s.setSupport(sp.kind)}
                  className="accent-blue-500"
                />
                <span className="truncate">{sp.label}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400 ml-1">μ={sp.mu}</span>
            </label>
          ))}
        </div>
        <div className="mt-1.5 p-1.5 bg-blue-600/10 border border-blue-500/30 rounded text-[11px] font-mono text-slate-100">
          L<sub>0</sub>=μ·L={d.mu}×{(s.L / 1000).toFixed(2)}m=
          <span className="text-blue-300 font-semibold"> {(d.mu * s.L / 1000).toFixed(2)} m</span>
        </div>
      </Card>

      {/* 荷载 */}
      <Card title="荷载 Axial Force">
        <FieldRow label="N" value={`${(s.P / 1000).toFixed(1)} kN`} />
        <input
          type="range"
          min={0}
          max={Math.max(d.N_cr * 1.2, 10000)}
          step={1000}
          value={s.P}
          onChange={(e) => s.setP(+e.target.value)}
          className="w-full accent-blue-500"
        />
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-slate-400">N (N)</span>
          <input
            type="number"
            step={1000}
            value={s.P}
            onChange={(e) => s.setP(+e.target.value)}
            className="flex-1 bg-[#1c2029] border border-[#2a2f3a] text-slate-100 px-2 py-1 rounded text-[12px]"
          />
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          N<sub>cr</sub> ≈ {(d.N_cr / 1000).toFixed(1)} kN ·
          利用率 {(d.utilization * 100).toFixed(0)}%
        </div>
      </Card>

      {/* 显示 */}
      <Card title="显示 Display">
        <FieldRow label="变形放大" value={s.deformAmp.toFixed(2)} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={s.deformAmp}
          onChange={(e) => s.setDeformAmp(+e.target.value)}
          className="w-full accent-blue-500"
        />
        <p className="text-[10px] text-slate-500 mt-1 leading-snug">
          仅视觉放大位移，不影响力学计算。
        </p>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1c2029] border border-[#2a2f3a] rounded-md p-2.5 flex flex-col gap-1 min-w-0">
      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-0.5">{title}</div>
      {children}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-[11px]">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 font-mono">{value}</span>
    </div>
  );
}
