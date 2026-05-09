// 屈曲振型注入：把 4 种支座条件下的解析振型作为顶点位移挂到任意 three 材质上

import * as THREE from 'three';

export interface BucklingUniforms {
  uL: { value: number };       // 柱长 mm
  uDelta: { value: number };   // 横向位移幅值（峰值，mm）
  uMode: { value: number };    // 0=PIN_PIN, 1=FIX_FIX, 2=FIX_PIN, 3=FIX_FREE
}

export function makeBucklingUniforms(): BucklingUniforms {
  return {
    uL: { value: 4000 },
    uDelta: { value: 0 },
    uMode: { value: 0 },
  };
}

/**
 * 给材质打补丁：在 vertex shader 的 transform 阶段，按 z（轴向）位置加一个 x 方向偏移。
 * 几何体应当沿 z 轴拉伸（ExtrudeGeometry 默认就是这样）。
 */
export function patchBucklingMaterial(mat: THREE.Material, u: BucklingUniforms): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uL = u.uL;
    shader.uniforms.uDelta = u.uDelta;
    shader.uniforms.uMode = u.uMode;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uL;
        uniform float uDelta;
        uniform int   uMode;
        const float PI_BUCKLE = 3.14159265358979;
        float bucklingShape(float t, int mode) {
          if (mode == 0) return sin(PI_BUCKLE * t);
          if (mode == 1) return (1.0 - cos(2.0 * PI_BUCKLE * t)) * 0.5;
          if (mode == 2) return (sin(PI_BUCKLE * t) - 0.5 * sin(2.0 * PI_BUCKLE * t)) / 1.299;
          if (mode == 3) return 1.0 - cos(PI_BUCKLE * t * 0.5);
          return 0.0;
        }
        `,
      )
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = vec3( position );
        float _t = clamp(transformed.z / uL, 0.0, 1.0);
        transformed.x += uDelta * bucklingShape(_t, uMode);
        `,
      );
  };
  mat.needsUpdate = true;
}
