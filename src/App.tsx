import { Scene } from './scene/Scene';
import { ParamPanel } from './ui/ParamPanel';
import { ResultCards } from './ui/ResultCards';
import { PhiLambdaChart } from './ui/PhiLambdaChart';

function App() {
  return (
    <div className="h-screen w-screen flex bg-[#0f1117] text-slate-200 overflow-hidden">
      {/* 左：参数面板 */}
      <aside className="w-[340px] flex-shrink-0">
        <ParamPanel />
      </aside>

      {/* 中：3D 视口 */}
      <main className="flex-1 relative min-w-0">
        <Scene />
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/40 rounded text-[12px] text-slate-300 backdrop-blur-sm pointer-events-none">
          钢柱轴心受压稳定可视化 · GB 50017-2017
        </div>
      </main>

      {/* 右：结果 + 图表 */}
      <aside className="w-[420px] flex-shrink-0 border-l border-[#2a2f3a] p-3 space-y-3 overflow-y-auto">
        <ResultCards />
        <PhiLambdaChart />
        <Notes />
      </aside>
    </div>
  );
}

function Notes() {
  return (
    <div className="bg-[#151820] border border-[#2a2f3a] rounded-md p-3 text-[12px] text-slate-400 space-y-1.5 leading-relaxed">
      <div className="text-[12px] text-slate-200 font-semibold mb-1">教学说明</div>
      <p>· <span className="text-slate-300">长细比</span> λ = μL/i_min。</p>
      <p>· <span className="text-slate-300">欧拉曲线</span>（虚线）= π²E/(λ²·fy)，仅在 λ 较大时与 GB 曲线吻合。</p>
      <p>· <span className="text-slate-300">GB φ 曲线</span> 考虑残余应力与初弯曲，低 λ 段进入塑性，明显低于欧拉。</p>
      <p>· <span className="text-slate-300">支座切换</span> 改变 μ → λ 整体放缩 → 工作点在曲线上左右滑动。</p>
      <p>· 滑动 N 接近 N_cr，柱身按解析振型放大变形（教学放大，非真实位移）。</p>
    </div>
  );
}

export default App;
