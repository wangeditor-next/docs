# CSP class 样式模式

在严格 CSP（例如禁止内联 `style`）场景下，可使用 `textStyleMode: 'class'` 让样式以 `class + data-w-e-*` 输出。

:::tip
默认模式仍是 `inline`，老项目无需改动即可继续使用。
:::

## 快速开始

```ts
import { createEditor, IEditorConfig } from '@wangeditor-next/editor'

const editorConfig: Partial<IEditorConfig> = {
    textStyleMode: 'class',
    classStylePolicy: 'preserve-data',
    styleClassTokens: {
        color: ['rgb(1, 2, 3)'],
    },
    onClassStyleUnsupported(payload) {
        console.warn('[class-style-unsupported]', payload)
    },
}

const editor = createEditor({
    selector: '#editor-container',
    config: editorConfig,
    html: '<p><br></p>',
})
```

同时请确保引入编辑器样式文件（内置默认 token 的 class 样式）：

```html
<link
  href="https://unpkg.com/@wangeditor-next/editor@latest/dist/css/style.css"
  rel="stylesheet"
>
```

## 配置项说明

### `textStyleMode`

- `inline`（默认）：样式输出到 `style`。
- `class`：样式输出到 `class + data-w-e-*`。

### `classStylePolicy`

仅在 `textStyleMode: 'class'` 下生效。

- `preserve-data`（默认）：仅保留 `data-w-e-*`，不输出 class/inline（可回读，可能不展示）。
- `fallback-inline`：保留 `data-w-e-*`，并回退到内联样式（优先展示）。
- `strict`：遇到未注册 token 直接抛错（避免静默降级）。

### `styleClassTokens`

- 用于注册额外可接受的 token。
- 仅注册 token，不会自动注入你的业务样式。

### `onClassStyleUnsupported`

当遇到未注册 token 时回调，便于日志与监控。

回调 payload 包含：

- `type`
- `value`
- `scene`（`render` 或 `toHtml`）
- `fallback`（`preserve-data` / `inline` / `throw`）
- `message`

## 支持的文本样式类型

- `color`
- `bgColor`
- `fontSize`
- `fontFamily`
- `textAlign`
- `lineHeight`
- `indent`

## 自定义 token 的 CSS 约定

推荐优先基于 `data-w-e-*` 写规则，不依赖 hash class 名：

```css
[data-w-e-color="rgb(1, 2, 3)"] { color: rgb(1, 2, 3); }
[data-w-e-font-size="20px"] { font-size: 20px; }
[data-w-e-line-height="2"] { line-height: 2; }
```

## 模块行为说明

- `basic-modules`：文本样式按策略输出 class/data/inline。
- `list-module`：列表颜色 class 使用 `w-e-list-color-*`，并保留 `data-w-e-color`。
- `table-module`：`border-style` 在 class 模式下按策略处理（支持单值 class，复杂值按策略降级）。
- `video-module`、`image`、`plugin-float-image`：对齐、尺寸等优先走 class/data 输出。

## 迁移建议

1. 先在测试环境启用 `textStyleMode: 'class'` + `classStylePolicy: 'preserve-data'`。
2. 观察 `onClassStyleUnsupported` 日志，补齐 `styleClassTokens` 与 CSS。
3. 再按业务要求切到 `fallback-inline` 或 `strict`。
