# 钢柱轴心受压稳定可视化

教学用纯前端 SPA：3D 预览参数化钢柱（4 种主流截面、4 种支座条件），实时显示 GB 50017-2017 稳定系数 φ-λ 曲线（abcd 四类）与欧拉曲线对比。

🌐 在线预览：https://ffrins.github.io/TEXT2/

## 功能

- **截面**：H 型钢（HW/HM/HN 标准表）、箱形管、圆管、实心矩形
- **支座**：两端铰 (μ=1)、两端固 (μ=0.5)、一固一铰 (μ=0.7)、悬臂 (μ=2)
- **钢材**：Q235 / Q355 / Q390 / Q420 / Q460
- **3D 屈曲变形**：vertex shader 注入解析振型，N→N_cr 时按 P-δ 公式急剧增大
- **图表**：4 条 GB φ 曲线 + 欧拉曲线 + 当前工作点同图对比

## 技术栈

Vite + React 19 + TypeScript · three.js + @react-three/fiber + @react-three/drei · zustand · recharts · Tailwind CSS v4

## 本地开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 输出到 dist/
```

## 部署

push 到 `main` 即触发 GitHub Actions 自动构建并发布到 GitHub Pages。仓库 Settings → Pages → Source 选 **GitHub Actions** 即可。

---

## 模板原始说明（保留供参考）

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
