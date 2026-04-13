import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const bundles = [
  {
    locale: 'zh',
    output: 'docs/public/ai/zh-guide-full.txt',
    title: 'wangEditor-next 中文全量文档（Raw Markdown）',
    intro: [
      '本文件由脚本自动生成，汇总中文 Guide 的完整 Markdown，适合一次性投喂 AI。',
      '这是原始 Markdown 文件，不经过页面渲染。',
    ],
    crossLinkText: 'English Raw Markdown',
    crossLinkPath: '/ai/en-guide-full.txt',
  },
  {
    locale: 'en',
    output: 'docs/public/ai/en-guide-full.txt',
    title: 'wangEditor-next English Full Docs (Raw Markdown)',
    intro: [
      'This file is auto-generated and consolidates full Markdown from the English guide pages.',
      'It is raw Markdown for one-shot AI context feeding (no page rendering).',
    ],
    crossLinkText: '中文 Raw Markdown',
    crossLinkPath: '/ai/zh-guide-full.txt',
  },
];

const preferredFileOrder = [
  'index.md',
  'installation.md',
  'getting-started.md',
  'for-frame.md',
  'content.md',
  'toolbar-config.md',
  'editor-config.md',
  'csp-class-mode.md',
  'menu-config.md',
  'API.md',
  'node-define.md',
  'development.md',
  'i18n.md',
  'theme.md',
  'for-ts.md',
  'plugins.md',
  'video-course.md',
];

const excludedFiles = new Set(['full-docs.md']);

function stripFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return normalized;
  }

  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) {
    return normalized;
  }

  return normalized.slice(end + 5);
}

function formatGeneratedAt(locale) {
  const formatter = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });

  return `${formatter.format(new Date())} (Asia/Shanghai)`;
}

async function listGuideFiles(locale) {
  const guideDir = path.join(repoRoot, 'docs', locale, 'guide');
  const files = await fs.readdir(guideDir);

  const mdFiles = files
    .filter(file => file.endsWith('.md'))
    .filter(file => !excludedFiles.has(file));

  const orderMap = new Map(preferredFileOrder.map((name, index) => [name, index]));

  mdFiles.sort((a, b) => {
    const aRank = orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
    const bRank = orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });

  return mdFiles.map(file => ({
    file,
    relativePath: `${locale}/guide/${file}`,
    absPath: path.join(guideDir, file),
  }));
}

async function readSection(section) {
  const raw = await fs.readFile(section.absPath, 'utf8');
  const content = stripFrontmatter(raw).trim();

  return {
    ...section,
    content,
  };
}

function buildRawMarkdown(bundle, sections) {
  const generatedLabel = bundle.locale === 'zh' ? '生成时间' : 'Generated at';
  const languageLabel = bundle.locale === 'zh' ? '语言切换' : 'Language';
  const filesLabel = bundle.locale === 'zh' ? '## 包含文件' : '## Included Files';

  const lines = [
    `# ${bundle.title}`,
    '',
    ...bundle.intro.map(line => `> ${line}`),
    `> ${generatedLabel}: ${formatGeneratedAt(bundle.locale)}`,
    `> ${languageLabel}: [${bundle.crossLinkText}](${bundle.crossLinkPath})`,
    '',
    filesLabel,
    ...sections.map((section, index) => `${index + 1}. \`docs/${section.relativePath}\``),
    '',
  ];

  sections.forEach((section, index) => {
    lines.push('---', '');
    lines.push(`<!-- source: docs/${section.relativePath} -->`, '');
    lines.push(`## ${index + 1}. ${section.file}`, '');
    lines.push(section.content, '');
  });

  const content = `${lines.join('\n').trimEnd()}\n`;
  // Add UTF-8 BOM so browsers can render Chinese correctly even when charset
  // is not explicitly set in text/plain headers.
  return `\uFEFF${content}`;
}

async function writeBundle(bundle) {
  const files = await listGuideFiles(bundle.locale);
  const sections = [];

  for (const file of files) {
    sections.push(await readSection(file));
  }

  const markdown = buildRawMarkdown(bundle, sections);
  const outputPath = path.join(repoRoot, bundle.output);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, markdown, 'utf8');

  return outputPath;
}

async function main() {
  const outputs = [];

  for (const bundle of bundles) {
    outputs.push(await writeBundle(bundle));
  }

  console.log(`Generated raw full docs: ${outputs.map(p => path.relative(repoRoot, p)).join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
