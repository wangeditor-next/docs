<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

type CopyState = 'idle' | 'loading' | 'copied' | 'missing' | 'error'

const { page, site } = useData()

// Load raw Markdown for every page so we can copy/open the original content.
const mdSources = import.meta.glob('../../../**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const state = ref<CopyState>('idle')
const headingEl = ref<HTMLElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const menuId = 'vp-copy-menu'
const menuStyle = ref<Record<string, string>>({
  top: '0px',
  left: '0px',
  width: '320px',
})

const locale = computed(() => (site.value.lang?.startsWith('en') ? 'en' : 'zh'))

// page.relativePath is relative to docs root (e.g. guide/index.md),
// glob keys are relative to this file (../../../zh/guide/index.md).
const sourceKey = computed(() => {
  const rel = page.value.relativePath
  if (!rel) return ''

  const direct = `../../../${rel}`
  if (mdSources[direct]) return direct

  const candidates = Object.keys(mdSources).filter(key => key.endsWith(rel))
  if (!candidates.length) return ''

  const preferred = candidates.find(key => key.includes(`/${locale.value}/`))
  return preferred ?? candidates[0]
})

const i18n = computed(() => {
  if (locale.value === 'en') {
    return {
      trigger: 'Markdown',
      copied: 'Copied',
      loading: 'Processing...',
      missing: 'Markdown not found',
      error: 'Action failed',
      copyPage: 'Copy page',
      copyPageDesc: 'Copy this page as Markdown for LLMs',
      viewMd: 'View as Markdown',
      viewMdDesc: 'View this page as plain text',
      llmsFull: 'LLMs full',
      llmsFullDesc: 'See full docs as markdown for LLMs',
      openClaude: 'Open in Claude',
      openClaudeDesc: 'Ask questions about this page',
      openChatGPT: 'Open in ChatGPT',
      openChatGPTDesc: 'Ask questions about this page',
    }
  }

  return {
    trigger: 'Markdown',
    copied: '已复制',
    loading: '处理中...',
    missing: '未找到本页 Markdown',
    error: '操作失败',
    copyPage: '复制页面',
    copyPageDesc: '复制当前页面 Markdown（适合喂给 AI）',
    viewMd: '查看 Markdown',
    viewMdDesc: '以纯文本方式查看当前页面',
    llmsFull: 'LLMs full',
    llmsFullDesc: '查看完整文档 Markdown（面向 LLM）',
    openClaude: '在 Claude 中打开',
    openClaudeDesc: '围绕当前页面发起提问',
    openChatGPT: '在 ChatGPT 中打开',
    openChatGPTDesc: '围绕当前页面发起提问',
  }
})

const statusText = computed(() => {
  if (state.value === 'copied') return i18n.value.copied
  if (state.value === 'loading') return i18n.value.loading
  if (state.value === 'missing') return i18n.value.missing
  if (state.value === 'error') return i18n.value.error
  return ''
})

const disabled = computed(() => state.value === 'loading')

const llmsFullHref = computed(() => {
  return withBase(locale.value === 'en' ? '/ai/en-guide-full.txt' : '/ai/zh-guide-full.txt')
})

const currentPageUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.href.split('#')[0]
})

const chatPrompt = computed(() => {
  if (!currentPageUrl.value) return ''
  return `Read ${currentPageUrl.value} so I can ask questions about it.`
})

const claudeHref = computed(() => {
  if (!chatPrompt.value) return 'https://claude.ai/new'
  return `https://claude.ai/new?q=${encodeURIComponent(chatPrompt.value)}`
})

const chatGptHref = computed(() => {
  if (!chatPrompt.value) return 'https://chat.openai.com/?hint=search'
  return `https://chat.openai.com/?hint=search&q=${encodeURIComponent(chatPrompt.value)}`
})

function clearHeadingHighlight() {
  headingEl.value?.classList.remove('vp-copy-h1')
}

function closeMenu() {
  menuOpen.value = false
}

function updateMenuPosition() {
  if (typeof window === 'undefined') return

  const trigger = triggerEl.value
  if (!trigger || !menuOpen.value) return

  const rect = trigger.getBoundingClientRect()
  const sidePadding = 12
  const width = Math.min(340, window.innerWidth - sidePadding * 2)

  let left = rect.right - width
  left = Math.max(sidePadding, Math.min(left, window.innerWidth - width - sidePadding))

  let top = rect.bottom + 8
  const menuHeight = menuEl.value?.offsetHeight ?? 280
  if (top + menuHeight > window.innerHeight - sidePadding) {
    const aboveTop = rect.top - menuHeight - 8
    if (aboveTop >= sidePadding) {
      top = aboveTop
    }
  }

  menuStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    width: `${Math.round(width)}px`,
  }
}

function attachMenuPositionListeners() {
  if (typeof window === 'undefined') return
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
}

function detachMenuPositionListeners() {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
}

async function syncHeading() {
  if (typeof window === 'undefined') return

  await nextTick()

  const target = document.querySelector('.vp-doc h1') as HTMLElement | null

  if (!target) {
    clearHeadingHighlight()
    headingEl.value = null
    return
  }

  if (target !== headingEl.value) {
    clearHeadingHighlight()
    headingEl.value = target
    headingEl.value.classList.add('vp-copy-h1')
  }
}

function scheduleSyncHeading() {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => {
    syncHeading()
    window.setTimeout(syncHeading, 60)
  })
}

function handleGlobalMouseDown(event: MouseEvent) {
  if (!menuOpen.value) return

  const target = event.target as Node | null
  if (!target) return

  if (rootEl.value?.contains(target)) return
  if (menuEl.value?.contains(target)) return

  closeMenu()
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

watch(
  () => page.value.relativePath,
  () => {
    state.value = 'idle'
    closeMenu()
    scheduleSyncHeading()
  },
)

watch(menuOpen, async (open) => {
  if (open) {
    await nextTick()
    updateMenuPosition()
    window.requestAnimationFrame(updateMenuPosition)
    attachMenuPositionListeners()
  }
  else {
    detachMenuPositionListeners()
  }
})

onMounted(() => {
  scheduleSyncHeading()
  document.addEventListener('mousedown', handleGlobalMouseDown)
  document.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  clearHeadingHighlight()
  detachMenuPositionListeners()
  document.removeEventListener('mousedown', handleGlobalMouseDown)
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function toggleMenu() {
  if (disabled.value) return
  menuOpen.value = !menuOpen.value
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available on the server.')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

async function loadMarkdownSource() {
  if (!sourceKey.value || !mdSources[sourceKey.value]) {
    state.value = 'missing'
    return null
  }

  state.value = 'loading'

  try {
    return await mdSources[sourceKey.value]()
  }
  catch (error) {
    console.error('Failed to load Markdown source', error)
    state.value = 'error'
    return null
  }
}

function resetStateLater() {
  window.setTimeout(() => {
    if (state.value !== 'loading') {
      state.value = 'idle'
    }
  }, 2000)
}

async function handleCopyPage() {
  closeMenu()

  const raw = await loadMarkdownSource()
  if (!raw) return

  try {
    await copyToClipboard(raw)
    state.value = 'copied'
    resetStateLater()
  }
  catch (error) {
    console.error('Failed to copy Markdown source', error)
    state.value = 'error'
  }
}

async function handleViewMarkdown() {
  closeMenu()

  const raw = await loadMarkdownSource()
  if (!raw || typeof window === 'undefined') return

  const blob = new Blob([`\uFEFF${raw}`], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)

  state.value = 'idle'
}

function handleExternalMenuClick() {
  closeMenu()
  state.value = 'idle'
}
</script>

<template>
  <Teleport v-if="headingEl" :to="headingEl">
    <span ref="rootEl" class="vp-copy-inline" :data-state="state">
      <button
        ref="triggerEl"
        class="vp-copy-inline__trigger"
        type="button"
        :disabled="disabled"
        aria-haspopup="menu"
        :aria-expanded="menuOpen"
        :aria-controls="menuId"
        @click="toggleMenu"
      >
        <svg
          class="vp-copy-inline__icon"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="vp-copy-inline__label">{{ i18n.trigger }}</span>
        <svg class="vp-copy-inline__caret" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5.5 7.75L10 12.25L14.5 7.75" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        </svg>
      </button>

      <span
        v-if="statusText && !menuOpen"
        class="vp-copy-inline__status"
        :data-state="state"
        role="status"
        aria-live="polite"
      >
        {{ statusText }}
      </span>
    </span>
  </Teleport>

  <Teleport to="body">
    <div
      v-if="menuOpen"
      :id="menuId"
      ref="menuEl"
      class="vp-copy-inline__menu"
      role="menu"
      :aria-orientation="'vertical'"
      :style="menuStyle"
    >
      <button class="vp-copy-inline__item" type="button" role="menuitem" @click="handleCopyPage">
        <span class="vp-copy-inline__item-main">
          <span class="vp-copy-inline__item-icon">📋</span>
          <span class="vp-copy-inline__item-text">
            <span class="vp-copy-inline__item-title">{{ i18n.copyPage }}</span>
            <span class="vp-copy-inline__item-desc">{{ i18n.copyPageDesc }}</span>
          </span>
        </span>
      </button>

      <button class="vp-copy-inline__item" type="button" role="menuitem" @click="handleViewMarkdown">
        <span class="vp-copy-inline__item-main">
          <span class="vp-copy-inline__item-icon">📝</span>
          <span class="vp-copy-inline__item-text">
            <span class="vp-copy-inline__item-title">{{ i18n.viewMd }}</span>
            <span class="vp-copy-inline__item-desc">{{ i18n.viewMdDesc }}</span>
          </span>
        </span>
      </button>

      <a
        class="vp-copy-inline__item"
        :href="llmsFullHref"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        @click="handleExternalMenuClick"
      >
        <span class="vp-copy-inline__item-main">
          <span class="vp-copy-inline__item-icon">📄</span>
          <span class="vp-copy-inline__item-text">
            <span class="vp-copy-inline__item-title">{{ i18n.llmsFull }}</span>
            <span class="vp-copy-inline__item-desc">{{ i18n.llmsFullDesc }}</span>
          </span>
        </span>
        <span class="vp-copy-inline__item-ext">↗</span>
      </a>

      <a
        class="vp-copy-inline__item"
        :href="claudeHref"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        @click="handleExternalMenuClick"
      >
        <span class="vp-copy-inline__item-main">
          <span class="vp-copy-inline__item-icon">✦</span>
          <span class="vp-copy-inline__item-text">
            <span class="vp-copy-inline__item-title">{{ i18n.openClaude }}</span>
            <span class="vp-copy-inline__item-desc">{{ i18n.openClaudeDesc }}</span>
          </span>
        </span>
        <span class="vp-copy-inline__item-ext">↗</span>
      </a>

      <a
        class="vp-copy-inline__item"
        :href="chatGptHref"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        @click="handleExternalMenuClick"
      >
        <span class="vp-copy-inline__item-main">
          <span class="vp-copy-inline__item-icon">◌</span>
          <span class="vp-copy-inline__item-text">
            <span class="vp-copy-inline__item-title">{{ i18n.openChatGPT }}</span>
            <span class="vp-copy-inline__item-desc">{{ i18n.openChatGPTDesc }}</span>
          </span>
        </span>
        <span class="vp-copy-inline__item-ext">↗</span>
      </a>
    </div>
  </Teleport>
</template>
