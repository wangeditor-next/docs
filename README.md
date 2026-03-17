# wangEditor v5 doc

线上地址：https://wangeditor-next.github.io/docs/

## 本地开发

使用 [VitePress](https://vitepress.dev/zh/) 搭建的文档。

下载当前代码，然后启动

```shell
pnpm install  # 安装依赖
pnpm docs:dev # 启动，浏览器访问 http://localhost:5173/docs/
```

## 发布上线

提交 main 分支代码，即可触发 [github actions](https://github.com/wangeditor-next/docs/actions) 并发布上线。
