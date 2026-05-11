// 截面 2D 尺寸示意图（SVG，教学风）：填充 + 尺寸线 + 形心轴标注

import type { SectionParams } from '../mechanics/sections';

const FILL = '#3b82f6';
const FILL_ALPHA = 0.18;
const STROKE = '#60a5fa';
const DIM = '#94a3b8';
const AXIS = '#a78bfa';

const PAD = 36;       // 周边留白（给尺寸线）
const SIZE = 220;     // SVG 视图尺寸
const INNER = SIZE - PAD * 2;

export function SectionDiagram({ section }: { section: SectionParams }) {
  // 截面外包矩形（用于等比缩放）
  const [outerW, outerH] = outerSize(section);
  const scale = Math.min(INNER / outerW, INNER / outerH);
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <div className="bg-[#1c2029] rounded p-2.5 border border-[#2a2f3a]">
      <div className="text-[11px] text-slate-400 mb-1.5 flex justify-between items-baseline">
        <span>截面示意 (教学示意，非按比例)</span>
        <span className="text-slate-500 text-[10px]">单位 mm</span>
      </div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', maxHeight: 240 }}>
        {/* 网格背景 */}
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#22272f" strokeWidth="0.5" />
        </pattern>
        <rect width={SIZE} height={SIZE} fill="url(#grid)" />

        {/* 截面图形 */}
        <g transform={`translate(${cx},${cy}) scale(${scale},${-scale})`}>
          <ShapePath section={section} />
        </g>

        {/* 形心坐标轴（虚线） */}
        <line x1={PAD - 4} y1={cy} x2={SIZE - PAD + 4} y2={cy} stroke={AXIS} strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1={cx} y1={PAD - 4} x2={cx} y2={SIZE - PAD + 4} stroke={AXIS} strokeDasharray="3 3" strokeWidth="0.8" />
        <text x={SIZE - PAD + 6} y={cy + 4} fontSize="11" fill={AXIS} fontFamily="monospace">x</text>
        <text x={cx + 4} y={PAD - 6} fontSize="11" fill={AXIS} fontFamily="monospace">y</text>

        {/* 尺寸标注 */}
        <Dimensions section={section} scale={scale} cx={cx} cy={cy} outerW={outerW} outerH={outerH} />
      </svg>
    </div>
  );
}

function outerSize(s: SectionParams): [number, number] {
  switch (s.kind) {
    case 'H':    return [s.b, s.h];
    case 'BOX':  return [s.B, s.H];
    case 'PIPE': return [s.D, s.D];
    case 'RECT': return [s.b, s.h];
  }
}

function ShapePath({ section }: { section: SectionParams }) {
  const fill = FILL;
  const opacity = FILL_ALPHA;
  switch (section.kind) {
    case 'H': {
      const { h, b, tw, tf } = section;
      const halfB = b / 2, halfH = h / 2, halfTw = tw / 2;
      const d = `M ${-halfB} ${-halfH} L ${halfB} ${-halfH} L ${halfB} ${-halfH + tf} L ${halfTw} ${-halfH + tf} L ${halfTw} ${halfH - tf} L ${halfB} ${halfH - tf} L ${halfB} ${halfH} L ${-halfB} ${halfH} L ${-halfB} ${halfH - tf} L ${-halfTw} ${halfH - tf} L ${-halfTw} ${-halfH + tf} L ${-halfB} ${-halfH + tf} Z`;
      return <path d={d} fill={fill} fillOpacity={opacity} stroke={STROKE} strokeWidth={2 / 4} vectorEffect="non-scaling-stroke" />;
    }
    case 'BOX': {
      const { H, B, t } = section;
      return (
        <>
          <rect x={-B / 2} y={-H / 2} width={B} height={H} fill={fill} fillOpacity={opacity} stroke={STROKE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <rect x={-B / 2 + t} y={-H / 2 + t} width={B - 2 * t} height={H - 2 * t} fill="#0f1117" stroke={STROKE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </>
      );
    }
    case 'PIPE': {
      const { D, t } = section;
      return (
        <>
          <circle r={D / 2} fill={fill} fillOpacity={opacity} stroke={STROKE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle r={D / 2 - t} fill="#0f1117" stroke={STROKE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </>
      );
    }
    case 'RECT': {
      const { h, b } = section;
      return <rect x={-b / 2} y={-h / 2} width={b} height={h} fill={fill} fillOpacity={opacity} stroke={STROKE} strokeWidth="1" vectorEffect="non-scaling-stroke" />;
    }
  }
}

interface DimProps {
  section: SectionParams;
  scale: number;
  cx: number;
  cy: number;
  outerW: number;
  outerH: number;
}

function Dimensions({ section, scale, cx, cy, outerW, outerH }: DimProps) {
  // 把"截面坐标 (mm)"转换为 SVG 像素
  const sx = (x: number) => cx + x * scale;
  const sy = (y: number) => cy - y * scale;
  const wHalf = outerW / 2;
  const hHalf = outerH / 2;

  // 外尺寸的尺寸线偏移（像素）
  const offX = 18;
  const offY = 18;

  const elements: React.ReactNode[] = [];

  // 公共：外宽尺寸（顶部）
  elements.push(
    <HorzDim key="W"
      x1={sx(-wHalf)} x2={sx(wHalf)} y={sy(hHalf) - offY}
      label={labelW(section)} />,
  );
  // 公共：外高尺寸（右侧）
  elements.push(
    <VertDim key="H"
      y1={sy(-hHalf)} y2={sy(hHalf)} x={sx(wHalf) + offX}
      label={labelH(section)} />,
  );

  // 各截面特有的厚度标注
  if (section.kind === 'H') {
    const { h, b, tw, tf } = section;
    // tf：右上翼缘厚度（小尺寸标注）
    elements.push(
      <SmallDim key="tf"
        x1={sx(b / 2)} y1={sy(h / 2)} x2={sx(b / 2)} y2={sy(h / 2 - tf)}
        label={`tf=${tf}`} side="right" />,
    );
    // tw：底部翼缘上方腹板厚度
    elements.push(
      <SmallDim key="tw"
        x1={sx(-tw / 2)} y1={sy(-h / 2 + tf + Math.min(h * 0.15, 40))}
        x2={sx(tw / 2)} y2={sy(-h / 2 + tf + Math.min(h * 0.15, 40))}
        label={`tw=${tw}`} side="bottom" horizontal />,
    );
  } else if (section.kind === 'BOX') {
    elements.push(
      <SmallDim key="t"
        x1={sx(-section.B / 2)} y1={sy(section.H / 2)}
        x2={sx(-section.B / 2 + section.t)} y2={sy(section.H / 2)}
        label={`t=${section.t}`} side="top" horizontal />,
    );
  } else if (section.kind === 'PIPE') {
    elements.push(
      <SmallDim key="t"
        x1={sx(section.D / 2 - section.t)} y1={sy(0)}
        x2={sx(section.D / 2)} y2={sy(0)}
        label={`t=${section.t}`} side="top" horizontal />,
    );
  }

  return <>{elements}</>;
}

function labelW(s: SectionParams): string {
  switch (s.kind) {
    case 'H':    return `b=${s.b}`;
    case 'BOX':  return `B=${s.B}`;
    case 'PIPE': return `D=${s.D}`;
    case 'RECT': return `b=${s.b}`;
  }
}
function labelH(s: SectionParams): string {
  switch (s.kind) {
    case 'H':    return `h=${s.h}`;
    case 'BOX':  return `H=${s.H}`;
    case 'PIPE': return `D=${s.D}`;
    case 'RECT': return `h=${s.h}`;
  }
}

/* ====== 尺寸线小组件 ====== */

function HorzDim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const arrow = 4;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={DIM} strokeWidth="1" />
      <line x1={x1} y1={y - arrow} x2={x1} y2={y + arrow} stroke={DIM} />
      <line x1={x2} y1={y - arrow} x2={x2} y2={y + arrow} stroke={DIM} />
      <text x={(x1 + x2) / 2} y={y - 4} fontSize="11" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace">{label}</text>
    </g>
  );
}

function VertDim({ y1, y2, x, label }: { y1: number; y2: number; x: number; label: string }) {
  const arrow = 4;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={DIM} strokeWidth="1" />
      <line x1={x - arrow} y1={y1} x2={x + arrow} y2={y1} stroke={DIM} />
      <line x1={x - arrow} y1={y2} x2={x + arrow} y2={y2} stroke={DIM} />
      <text x={x + 6} y={(y1 + y2) / 2 + 3} fontSize="11" fill="#cbd5e1" fontFamily="monospace">{label}</text>
    </g>
  );
}

function SmallDim({
  x1, y1, x2, y2, label, side = 'right', horizontal = false,
}: { x1: number; y1: number; x2: number; y2: number; label: string; side?: 'top' | 'bottom' | 'right'; horizontal?: boolean }) {
  const tx = (x1 + x2) / 2 + (horizontal ? 0 : 8);
  const ty = (y1 + y2) / 2 + (horizontal ? (side === 'top' ? -4 : 12) : 4);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth="1" strokeDasharray="2 2" />
      <text x={tx} y={ty} fontSize="10" fill="#94a3b8" textAnchor={horizontal ? 'middle' : 'start'} fontFamily="monospace">{label}</text>
    </g>
  );
}
