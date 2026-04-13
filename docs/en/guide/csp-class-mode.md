# CSP Class Style Mode

For strict CSP environments (for example, inline `style` is blocked), use `textStyleMode: 'class'` so style output uses `class + data-w-e-*`.

:::tip
The default mode is still `inline`, so existing projects keep working without changes.
:::

## Quick Start

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

Make sure the editor stylesheet is loaded (it includes built-in token class styles):

```html
<link
  href="https://unpkg.com/@wangeditor-next/editor@latest/dist/css/style.css"
  rel="stylesheet"
>
```

## Config Fields

### `textStyleMode`

- `inline` (default): style output goes to `style`.
- `class`: style output goes to `class + data-w-e-*`.

### `classStylePolicy`

Only works when `textStyleMode: 'class'`.

- `preserve-data` (default): keep `data-w-e-*` only, no class/inline (round-trip safe, may not render visual style).
- `fallback-inline`: keep `data-w-e-*` and fallback to inline style (render-first behavior).
- `strict`: throw on unsupported tokens (no silent degradation).

### `styleClassTokens`

- Registers additional accepted tokens.
- It only registers tokens and does not inject your custom CSS automatically.

### `onClassStyleUnsupported`

Called when an unsupported token is detected. Useful for logging and monitoring.

Payload fields:

- `type`
- `value`
- `scene` (`render` or `toHtml`)
- `fallback` (`preserve-data` / `inline` / `throw`)
- `message`

## Supported Text Style Types

- `color`
- `bgColor`
- `fontSize`
- `fontFamily`
- `textAlign`
- `lineHeight`
- `indent`

## CSS for Custom Tokens

For custom tokens, prefer rules based on `data-w-e-*` instead of hash class names:

```css
[data-w-e-color="rgb(1, 2, 3)"] { color: rgb(1, 2, 3); }
[data-w-e-font-size="20px"] { font-size: 20px; }
[data-w-e-line-height="2"] { line-height: 2; }
```

## Module Behavior

- `basic-modules`: text styles follow policy output (class/data/inline).
- `list-module`: list marker color class is `w-e-list-color-*` and keeps `data-w-e-color`.
- `table-module`: `border-style` in class mode follows policy (single-value class support, complex values degrade by policy).
- `video-module`, `image`, `plugin-float-image`: alignment and size prefer class/data output.

## Migration Suggestion

1. Start in test env with `textStyleMode: 'class'` + `classStylePolicy: 'preserve-data'`.
2. Observe `onClassStyleUnsupported` logs, then add `styleClassTokens` and matching CSS.
3. Move to `fallback-inline` or `strict` based on your production policy.
