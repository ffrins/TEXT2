// 左侧参数面板（工程示意风格，自定义 Tailwind UI）

import { useStore, useDerived } from '../store';
import type { AppState } from '../store';
import { H_PRESETS } from '../mechanics/sections';
import { STEEL_GRADES } from '../mechanics/steel';
import { SUPPORT_LIST } from '../mechanics/supports';
import type { SectionKind, HParams } from '../mechanics/sections';
import { SectionDiagram } from './SectionDiagram';

const SECTION_KINDS: { value: SectionKind; label: string }[] = [
  { value: 'H',    label: 'H 型钢' },
  { value: 'BOX',  label: '箱形管' },
  { value: 'PIPE', label: '圆管' },
  { value: 'RECT', label: '实心矩形' },
];

export function ParamPanel() {
  const s = useStore();
  const d = useDerived();

  return (
    <div className="h-full overflow-y-auto bg-[#151820] border-r border-[#2a2f3a] text-slate-200 text-[13px]">
      <Header title="钢柱轴心受压稳定 · 参数" subtitle="GB 50017-2017 · 教学版" />

      {/* 截面 */}
      <Section title="截面 Cross-Section">
        <Field label="类型">
          <Segmented
            options={SECTION_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            value={s.sectionKind}
            onChange={(v) => s.setSectionKind(v as SectionKind)}
          />
        </Field>

        {s.sectionKind === 'H' && s.section.kind === 'H' && (() => {
          const sec = s.section;
          const preset = H_PRESETS.find((x) => x.name === s.hPresetName)?.p;
          const isModified = !preset ||
            preset.h !== sec.h || preset.b !== sec.b ||
            preset.tw !== sec.tw || preset.tf !== sec.tf;
          return (
            <>
              <Field label="标准规格 (GB/T 11263)">
                <select
                  className={selectCls}
                  value={isModified ? '__custom__' : s.hPresetName}
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') s.setHPreset(e.target.value);
                  }}
                >
                  <option value="__custom__" disabled={!isModified}>— 自定义 —</option>
                  {(['HW', 'HM', 'HN'] as const).map((series) => (
                    <optgroup key={series} label={series}>
                      {H_PRESETS.filter((p) => p.series === series).map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <div>
                <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                  <span>自定义尺寸 (mm)</span>
                  {isModified && (
                    <button
                      onClick={() => s.setHPreset(s.hPresetName)}
                      className="text-[10px] text-blue-300 hover:text-blue-200 underline decoration-dotted"
                    >
                      重置回 {s.hPresetName}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumInput label="h (截面高)" value={sec.h} onChange={(v) => updateH(s, sec, { h: v })} />
                  <NumInput label="b (翼缘宽)" value={sec.b} onChange={(v) => updateH(s, sec, { b: v })} />
                  <NumInput label="tw (腹板厚)" step={0.5} value={sec.tw} onChange={(v) => updateH(s, sec, { tw: v })} />
                  <NumInput label="tf (翼缘厚)" step={0.5} value={sec.tf} onChange={(v) => updateH(s, sec, { tf: v })} />
                </div>
              </div>
            </>
          );
        })()}

        {s.section.kind === 'BOX' && (() => {
          const sec = s.section;
          return (
            <div className="grid grid-cols-3 gap-2">
              <NumInput label="H (mm)" value={sec.H} onChange={(v) => s.setSection({ ...sec, H: v })} />
              <NumInput label="B (mm)" value={sec.B} onChange={(v) => s.setSection({ ...sec, B: v })} />
              <NumInput label="t (mm)" step={0.5} value={sec.t} onChange={(v) => s.setSection({ ...sec, t: v })} />
            </div>
          );
        })()}

        {s.section.kind === 'PIPE' && (() => {
          const sec = s.section;
          return (
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="D (mm)" value={sec.D} onChange={(v) => s.setSection({ ...sec, D: v })} />
              <NumInput label="t (mm)" step={0.5} value={sec.t} onChange={(v) => s.setSection({ ...sec, t: v })} />
            </div>
          );
        })()}

        {s.section.kind === 'RECT' && (() => {
          const sec = s.section;
          return (
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="h (mm)" value={sec.h} onChange={(v) => s.setSection({ ...sec, h: v })} />
              <NumInput label="b (mm)" value={sec.b} onChange={(v) => s.setSection({ ...sec, b: v })} />
            </div>
          );
        })()}

        <SectionDiagram section={s.section} />

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <Stat label="A"   value={`${d.props.A.toFixed(0)} mm²`} />
          <Stat label="tMax" value={`${d.props.tMax.toFixed(1)} mm`} />
          <Stat label="Ix"  value={fmtSci(d.props.Ix)} />
          <Stat label="Iy"  value={fmtSci(d.props.Iy)} />
          <Stat label="ix"  value={`${d.props.ix.toFixed(1)} mm`} />
          <Stat label="iy"  value={`${d.props.iy.toFixed(1)} mm`} />
        </div>
      </Section>

      {/* 钢材 */}
      <Section title="钢材 Steel Grade">
        <Field label="等级">
          <Segmented
            options={STEEL_GRADES.map((g) => ({ value: g, label: g }))}
            value={s.grade}
            onChange={(v) => s.setGrade(v as typeof s.grade)}
          />
        </Field>
        <Field label={`截面分类 (自动判定: ${d.cls})`}>
          <Segmented
            options={[
              { value: 'auto', label: '自动' },
              { value: 'a', label: 'a 类' },
              { value: 'b', label: 'b 类' },
              { value: 'c', label: 'c 类' },
              { value: 'd', label: 'd 类' },
            ]}
            value={s.classOverride}
            onChange={(v) => s.setClassOverride(v as typeof s.classOverride)}
          />
        </Field>
        <Stat label="fy" value={`${d.fy} MPa`} />
      </Section>

      {/* 几何 */}
      <Section title="几何 Geometry">
        <Field label={`柱长 L = ${(s.L / 1000).toFixed(2)} m`}>
          <input
            type="range"
            min={500}
            max={12000}
            step={100}
            value={s.L}
            onChange={(e) => s.setL(+e.target.value)}
            className={rangeCls}
          />
        </Field>
        <NumInput label="L (mm)" value={s.L} step={50} onChange={s.setL} />
      </Section>

      {/* 支座 */}
      <Section title="支座 Boundary Conditions">
        <div className="space-y-1.5">
          {SUPPORT_LIST.map((sp) => (
            <label
              key={sp.kind}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer border ${
                s.support === sp.kind
                  ? 'bg-blue-600/15 border-blue-500/60 text-blue-200'
                  : 'bg-[#1c2029] border-transparent hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="support"
                checked={s.support === sp.kind}
                onChange={() => s.setSupport(sp.kind)}
                className="accent-blue-500"
              />
              <span>{sp.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* 荷载 */}
      <Section title="荷载 Axial Force">
        <Field label={`N = ${(s.P / 1000).toFixed(1)} kN`}>
          <input
            type="range"
            min={0}
            max={Math.max(d.N_cr * 1.2, 10000)}
            step={1000}
            value={s.P}
            onChange={(e) => s.setP(+e.target.value)}
            className={rangeCls}
          />
        </Field>
        <NumInput label="N (N)" value={s.P} step={1000} onChange={s.setP} />
        <div className="text-xs text-slate-400 mt-1">N_cr ≈ {(d.N_cr / 1000).toFixed(1)} kN</div>
      </Section>

      {/* 显示 */}
      <Section title="显示 Display">
        <Field label={`变形放大系数 ${(s.deformAmp).toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={s.deformAmp}
            onChange={(e) => s.setDeformAmp(+e.target.value)}
            className={rangeCls}
          />
        </Field>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          仅放大视觉位移，不影响力学计算。N→N_cr 时变形按 P-δ 公式急剧增大。
        </p>
      </Section>
    </div>
  );
}

/* ============================ helpers ============================ */

function updateH(store: AppState, sec: HParams, patch: Partial<Omit<HParams, 'kind'>>) {
  store.setSection({ ...sec, ...patch });
}

function fmtSci(x: number): string {
  if (!Number.isFinite(x) || x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / 10 ** e;
  return `${m.toFixed(2)}e${e}`;
}

/* ============================ 子组件 ============================ */

const selectCls =
  'w-full bg-[#1c2029] border border-[#2a2f3a] text-slate-100 px-2 py-1.5 rounded outline-none focus:border-blue-500 text-[13px]';
const inputCls = selectCls;
const rangeCls = 'w-full accent-blue-500';

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-[#2a2f3a]">
      <div className="text-[15px] font-semibold text-slate-100">{title}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-[#2a2f3a] space-y-2.5">
      <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function NumInput({
  label, value, onChange, step = 1,
}: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-400">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function Segmented<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2 py-1.5 rounded text-[12px] border transition-colors ${
            value === o.value
              ? 'bg-blue-600/20 border-blue-500/60 text-blue-200'
              : 'bg-[#1c2029] border-[#2a2f3a] text-slate-300 hover:border-slate-600'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-2 py-1 bg-[#1c2029] rounded text-[12px]">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 font-mono">{value}</span>
    </div>
  );
}
