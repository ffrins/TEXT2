// 钢柱主体：参数化截面 ExtrudeGeometry + 屈曲位移 shader + 描边

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { useStore } from '../store';
import { useDerived } from '../store';
import { SUPPORTS } from '../mechanics/supports';
import { buildSectionShape } from '../utils/extrudeShapes';
import { makeBucklingUniforms, patchBucklingMaterial } from './bucklingShader';

const DEFORM_CAP_RATIO = 0.12; // 视觉上变形最大不超过 12% × L，避免画面崩

export function Column() {
  const section = useStore((s) => s.section);
  const L = useStore((s) => s.L);
  const support = useStore((s) => s.support);
  const deformAmp = useStore((s) => s.deformAmp);
  const { utilization } = useDerived();

  // 屈曲 uniforms：跨渲染保持引用稳定
  const uniforms = useMemo(() => makeBucklingUniforms(), []);

  // 截面材质：浅灰金属，平面感强（工程示意）
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: '#9aa3b0',
      roughness: 0.55,
      metalness: 0.25,
      flatShading: false,
    });
    patchBucklingMaterial(m, uniforms);
    return m;
  }, [uniforms]);

  useEffect(() => () => material.dispose(), [material]);

  // 几何体：截面 Shape + 拉伸长度 L
  const geometry = useMemo(() => {
    const shape = buildSectionShape(section);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: L,
      bevelEnabled: false,
      curveSegments: 24,
      steps: Math.max(40, Math.ceil(L / 80)), // 高度方向的细分，shader 偏移要平滑
    });
    geo.computeVertexNormals();
    return geo;
  }, [section, L]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // 同步 uniforms
  useEffect(() => {
    uniforms.uL.value = L;
    uniforms.uMode.value = SUPPORTS[support].modeId;
  }, [L, support, uniforms]);

  // 教学 P-δ 放大：u = (P/Pcr) / (1 - P/Pcr)，再乘视觉系数
  useEffect(() => {
    const u = Math.min(0.99, Math.max(0, utilization));
    const amplify = u / Math.max(0.01, 1 - u);
    const cap = L * DEFORM_CAP_RATIO;
    // deformAmp ∈ [0..1] 控制总体视觉放大强度
    const delta = Math.min(cap, deformAmp * 0.4 * L * amplify);
    uniforms.uDelta.value = delta;
  }, [utilization, deformAmp, L, uniforms]);

  // mesh 在 mm 空间，外层 group 缩放成 m
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <Edges threshold={20} color="#2a2f3a" />
    </mesh>
  );
}
