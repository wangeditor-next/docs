# 编辑器配置

快速了解可查看[视频教程](./video-course.md)。

```ts{5}
import { IEditorConfig } from '@wangeditor-next/editor'

const editorConfig: Partial<IEditorConfig> = {   // TS 语法
// const editorConfig = {                        // JS 语法
    /* 编辑器配置 */
}

// 创建 editor 或传入 Vue React <Editor> 组件
```

:::tip
可通过 `editor.getConfig()` 查看编辑器默认配置
:::

## placeholder

配置编辑器 placeholder

```ts
editorConfig.placeholder = '请输入内容...'
```

## readOnly

配置编辑器是否只读，默认为 `false`

```ts
editorConfig.readOnly = true
```

只读状态可通过 `editor.enable()` 和 `editor.disable()` 切换，详见 [API](./API.md) 。

## autoFocus

配置编辑器默认是否 focus ，默认为 `true`

```ts
editorConfig.autoFocus = false
```

## scroll

配置编辑器是否支持滚动，默认为 `true` 。注意，此时**不要固定 `editor-container` 的高度**，设置一个 `min-height` 即可。

```ts
editorConfig.scroll = false
```

:::tip
可将 scroll 设置为 `false` 的情况：
- 编辑器高度自增
- 在线文档，如腾讯文档、语雀那样的，参考 [demo](https://wangeditor-next.github.io/demo/like-qq-doc.html) 中的“仿腾讯文档”
:::

## textStyleMode

配置文本/段落样式导出模式。

```ts
editorConfig.textStyleMode = 'class' // 'inline' | 'class'
```

- `inline`（默认）：输出内联 `style`
- `class`：输出 `class + data-w-e-*`，适合严格 CSP 场景

详细使用与迁移建议见 [CSP class 样式模式](./csp-class-mode.md)。

## classStylePolicy

当 `textStyleMode = 'class'` 时，配置未注册 token 的处理策略。

```ts
editorConfig.classStylePolicy = 'preserve-data'
// 'preserve-data' | 'fallback-inline' | 'strict'
```

- `preserve-data`（默认）：保留 `data-w-e-*`
- `fallback-inline`：回退到 inline style
- `strict`：直接抛错

## styleClassTokens

扩展 class 模式允许的 token 集合。

```ts
editorConfig.styleClassTokens = {
    color: ['rgb(1, 2, 3)'],
    fontSize: ['20px'],
}
```

:::tip
`styleClassTokens` 只注册 token，不自动注入业务 CSS。
:::

## onClassStyleUnsupported

class 模式遇到未注册 token 时的通知回调。

```ts
editorConfig.onClassStyleUnsupported = payload => {
    // payload: { type, value, scene, fallback, message }
    console.warn(payload)
}
```

## maxLength onMaxLength

配置编辑器的 maxlength ，参考 [demo](https://wangeditor-next.github.io/demo/max-length.html)。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.maxLength = 1000
editorConfig.onMaxLength = function (editor: IDomEditor) {   // TS 语法
// editorConfig.onMaxLength = function (editor) {            // JS 语法
    // 当达到 maxlength 限制时，触发该回调函数
}
```

:::tip
无特殊需求，请慎用 maxLength ，这可能会导致编辑器内容过多时，编辑卡顿。
:::

## hoverbarKeys

配置编辑器的 hoverbar 菜单。通过 `editor.getConfig().hoverbarKeys` 可查看当前的 hoverbarKeys

![](/image/hoverbar.png)

:::tip
createEditor 时设置 `mode: 'simple'` 可隐藏选中文本时的 hoverbar 。
:::

### 使用 element type

可以通过元素 `type` 配置某种元素的 hoverbar

- 元素的 `type` 可通过 `editor.children` 查看，如下图
- 使用 `editor.getAllMenuKeys()` 可查看所有内置 menu key

![](/image/elem-type.png)

```ts
editorConfig.hoverbarKeys = {
  link: {
    // 重写 link 元素的 hoverbar
    menuKeys: ['editLink', 'unLink', 'viewLink'],
  },
  image: {
    // 清空 image 元素的 hoverbar
    menuKeys: [],
  }
}
```

### 自定义 match 函数

如果 element type 无法满足需求，可通过自定义 `match` 函数匹配元素。

```ts
import { SlateNode, IDomEditor } from '@wangeditor-next/editor'

editorConfig.hoverbarKeys = {
    'text': {
        // 如有 match 函数，则优先根据 match 判断，而忽略 element type
        match: (editor: IDomEditor, n: SlateNode) => {   // TS 语法
        // match: (editor, n) => {                       // JS 语法
            // 可参考下文的源码
        },
        menuKeys: [ ... ], // 定义你想要的 menu keys
    }
}
```

可参考 hoverbar 配置的[源码](https://github.com/wangeditor-next/wangEditor-next/blob/master/packages/editor/src/init-default-config/config/hoverbar.ts)。

## onCreated

编辑器创建完毕时的回调函数。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.onCreated = (editor: IDomEditor) => {   // TS 语法
// editorConfig.onCreated = (editor) => {            // JS 语法
    // editor created
}
```

## onChange

编辑器内容、选区变化时的回调函数。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.onChange = (editor: IDomEditor) => {   // TS 语法
// editorConfig.onChange = (editor) => {            // JS 语法
    // editor changed
    console.log('content', editor.children)
}
```

## onDestroyed

编辑器销毁时的回调函数。调用 `editor.destroy()` 即可销毁编辑器，详见 [API](./API.md) 。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.onDestroyed = (editor: IDomEditor) => {   // TS 语法
// editorConfig.onDestroyed = (editor) => {            // JS 语法
    // editor destroyed
}
```

## onFocus

编辑器 focus 时的回调函数。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.onFocus = (editor: IDomEditor) => {    // TS 语法
// editorConfig.onFocus = (editor) => {             // JS 语法
    // editor focused
}
```

## onBlur

编辑器 blur 时的回调函数。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.onBlur = (editor: IDomEditor) => {   // TS 语法
// editorConfig.onBlur = (editor) => {            // JS 语法
    // editor blur
}
```

## customPaste

自定义粘贴。可阻止编辑器的默认粘贴，实现自己的粘贴逻辑。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.customPaste = (editor: IDomEditor, event: ClipboardEvent): boolean => {     // TS 语法
// editorConfig.customPaste = (editor, event) => {                                       // JS 语法

    // event 是 ClipboardEvent 类型，可以拿到粘贴的数据
    // 可参考 https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent

    // const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
    // const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
    // const rtf = event.clipboardData.getData('text/rtf') // 获取 rtf 数据（如从 word wsp 复制粘贴）

    // 同步
    editor.insertText('xxx')

    // 异步
    setTimeout(() => {
        editor.insertText('yy')
    }, 1000)

    // 阻止默认的粘贴行为
    event.preventDefault()
    return false

    // 继续执行默认的粘贴行为
    // return true
}
```

## customCopy

自定义复制，可修改编辑器的复制结果。

```ts
import { IDomEditor } from '@wangeditor-next/editor'

editorConfig.customCopy = (editor: IDomEditor, event: ClipboardEvent): void => {     // TS 语法
// editorConfig.customCooy = (editor, event) => {                                       // JS 语法
    const originalText = event.clipboardData.getData('text/plain');
    const originalHtml = event.clipboardData.getData('text/html');
   // 修改或扩展内容
    const modifiedText = `${originalText}\n---\n添加的文本`;
    const modifiedHtml = `${originalHtml}<hr><p>添加的HTML内容</p>`;
    // 将修改后的内容写回剪贴板
    event.clipboardData.setData('text/plain', modifiedText);
    event.clipboardData.setData('text/html', modifiedHtml);
}
```

## customAlert

自定义编辑器 alert 。如想用 antd 的 message 功能。

```ts
import { message } from 'antd'

editorConfig.customAlert = (s: string, t: string) => {    // TS 语法
// editorConfig.customAlert = (s, t) => {                 // JS 语法
    switch (t) {
        case 'success':
            message.success(s)
            break
        case 'info':
            message.info(s)
            break
        case 'warning':
            message.warning(s)
            break
        case 'error':
            message.error(s)
            break
        default:
            message.info(s)
            break
    }
}
```

## EXTEND_CONF

用于第三方插件做扩展配置，如 [mention 插件](https://github.com/wangeditor-next/wangEditor-next/tree/master/packages/plugin-mention)。
