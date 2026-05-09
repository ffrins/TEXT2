// 4 种截面对应的 THREE.Shape 工厂

import * as THREE from 'three';
import type { SectionParams } from '../mechanics/sections';

export function buildSectionShape(p: SectionParams): THREE.Shape {
  switch (p.kind) {
    case 'H': {
      const { h, b, tw, tf } = p;
      const halfB = b / 2, halfH = h / 2, halfTw = tw / 2;
      // 工字形外轮廓（顺时针绕外边）
      const s = new THREE.Shape();
      s.moveTo(-halfB, -halfH);
      s.lineTo( halfB, -halfH);
      s.lineTo( halfB, -halfH + tf);
      s.lineTo( halfTw, -halfH + tf);
      s.lineTo( halfTw,  halfH - tf);
      s.lineTo( halfB,  halfH - tf);
      s.lineTo( halfB,  halfH);
      s.lineTo(-halfB,  halfH);
      s.lineTo(-halfB,  halfH - tf);
      s.lineTo(-halfTw, halfH - tf);
      s.lineTo(-halfTw,-halfH + tf);
      s.lineTo(-halfB, -halfH + tf);
      s.closePath();
      return s;
    }
    case 'BOX': {
      const { H, B, t } = p;
      const s = new THREE.Shape();
      s.moveTo(-B / 2, -H / 2);
      s.lineTo( B / 2, -H / 2);
      s.lineTo( B / 2,  H / 2);
      s.lineTo(-B / 2,  H / 2);
      s.closePath();
      // 内孔
      const hole = new THREE.Path();
      hole.moveTo(-B / 2 + t, -H / 2 + t);
      hole.lineTo( B / 2 - t, -H / 2 + t);
      hole.lineTo( B / 2 - t,  H / 2 - t);
      hole.lineTo(-B / 2 + t,  H / 2 - t);
      hole.closePath();
      s.holes.push(hole);
      return s;
    }
    case 'PIPE': {
      const { D, t } = p;
      const s = new THREE.Shape();
      s.absarc(0, 0, D / 2, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, D / 2 - t, 0, Math.PI * 2, true);
      s.holes.push(hole);
      return s;
    }
    case 'RECT': {
      const { h, b } = p;
      const s = new THREE.Shape();
      s.moveTo(-b / 2, -h / 2);
      s.lineTo( b / 2, -h / 2);
      s.lineTo( b / 2,  h / 2);
      s.lineTo(-b / 2,  h / 2);
      s.closePath();
      return s;
    }
  }
}
