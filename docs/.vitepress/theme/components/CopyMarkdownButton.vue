<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

type CopyState = 'idle' | 'loading' | 'copied' | 'missing' | 'error'

const { page, site } = useData()

// Load raw Markdown for every page so we can copy the original content.
const mdSources = import.meta.glob('../../../**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const state = ref<CopyState>('idle')
const headingEl = ref<HTMLElement | null>(null)

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

function clearHeadingHighlight() {
  headingEl.value?.classList.remove('vp-copy-h1')
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

watch(
  () => page.value.relativePath,
  () => {
    state.value = 'idle'
    scheduleSyncHeading()
  },
)

onMounted(() => {
  scheduleSyncHeading()
})

onBeforeUnmount(() => {
  clearHeadingHighlight()
})

const buttonText = computed(() => {
  if (locale.value === 'en') {
    if (state.value === 'copied') return 'Copied'
    if (state.value === 'loading') return 'Copying...'
    return 'Copy Markdown'
  }

  if (state.value === 'copied') return '已复制'
  if (state.value === 'loading') return '复制中...'
  return '复制页面'
})

const statusText = computed(() => {
  if (locale.value === 'en') {
    if (state.value === 'copied') return 'Copied'
    if (state.value === 'loading') return 'Loading source...'
    if (state.value === 'missing') return 'Markdown not found'
    if (state.value === 'error') return 'Copy failed'
    return ''
  }

  if (state.value === 'loading') return '获取中...'
  if (state.value === 'missing') return '未找到本页 Markdown'
  if (state.value === 'error') return '复制失败'
  return ''
})

const disabled = computed(() => state.value === 'loading')

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

async function copyMarkdown() {
  if (!sourceKey.value || !mdSources[sourceKey.value]) {
    state.value = 'missing'
    return
  }

  state.value = 'loading'

  try {
    const raw = await mdSources[sourceKey.value]()
    await copyToClipboard(raw)

    state.value = 'copied'

    window.setTimeout(() => {
      if (state.value === 'copied') {
        state.value = 'idle'
      }
    }, 2000)
  }
  catch (error) {
    console.error('Failed to copy Markdown source', error)
    state.value = 'error'
  }
}
</script>

<template>
  <Teleport v-if="headingEl" :to="headingEl">
    <span class="vp-copy-inline" :data-state="state">
      <button
        class="vp-copy-inline__btn"
        type="button"
        :disabled="disabled"
        @click="copyMarkdown"
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
        <span class="vp-copy-inline__label">{{ buttonText }}</span>
      </button>
      <span
        v-if="statusText"
        class="vp-copy-inline__status"
        :data-state="state"
        role="status"
        aria-live="polite"
      >
        {{ statusText }}
      </span>
    </span>
  </Teleport>
</template>
