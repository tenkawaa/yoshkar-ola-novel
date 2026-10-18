<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ASSETS, CREDITS } from './config/assets.js'
import { SCENARIO, ROUTE, QUESTIONS } from './config/scenario.js'
import { validateScenario } from './engine/validate.js'

if (import.meta.env.DEV) validateScenario(SCENARIO, ASSETS, ROUTE)

const isStart = ref(true)
const showEndScreen = ref(false)

const currentSceneId = ref('start')
const currentScene = computed(() => SCENARIO[currentSceneId.value])

// Переменные прохождения: очки викторины, флаги выборов
const vars = reactive({})

// Фон, персонаж и точка маршрута наследуются от предыдущей сцены, если не заданы
const bgKey = ref(null)
const characterKey = ref(null)
const stopId = ref(null)

const currentBgUrl = computed(() => ASSETS.bg[bgKey.value] || '')
const currentCharUrl = computed(() => {
  const sprites = ASSETS.characters[characterKey.value]
  if (!sprites) return null
  return sprites[currentScene.value?.emotion] || sprites.neutral
})
const stopIndex = computed(() => ROUTE.findIndex((s) => s.id === stopId.value))
const isNarration = computed(() => !currentScene.value?.speaker)

const resolve = (value) => (typeof value === 'function' ? value(vars) : value)

function applyScene(scene) {
  if (scene.bgKey !== undefined) bgKey.value = scene.bgKey
  if (scene.characterKey !== undefined) characterKey.value = scene.characterKey
  if (scene.stop !== undefined) stopId.value = scene.stop
}

const fullText = ref('')
const displayedText = ref('')
const isTyping = ref(false)
let typingInterval = null

function startTypewriter(text) {
  clearInterval(typingInterval)
  fullText.value = text
  displayedText.value = ''
  isTyping.value = true

  let index = 0
  typingInterval = setInterval(() => {
    if (index < text.length) {
      displayedText.value += text.charAt(index)
      index++
    } else {
      completeTyping()
    }
  }, 25)
}

function completeTyping() {
  clearInterval(typingInterval)
  displayedText.value = fullText.value
  isTyping.value = false
}

// Подгружаем картинки следующих сцен заранее, чтобы фон не мигал при переходе
const preloaded = new Set()
function preload(url) {
  if (!url || preloaded.has(url)) return
  preloaded.add(url)
  new Image().src = url
}
function preloadNext(scene) {
  const ids = [scene.nextId, ...(scene.choices || []).map((c) => c.nextId)]
  for (const id of ids) {
    const next = typeof id === 'string' ? SCENARIO[id] : null
    if (!next) continue
    preload(ASSETS.bg[next.bgKey])
    const sprites = ASSETS.characters[next.characterKey ?? characterKey.value]
    if (sprites) preload(sprites[next.emotion] || sprites.neutral)
  }
}

watch(currentSceneId, () => {
  if (isStart.value) return
  enterScene()
})

function enterScene() {
  const scene = currentScene.value
  if (!scene) return
  applyScene(scene)
  startTypewriter(resolve(scene.text) || '')
  preloadNext(scene)
}

// Android умеет зафиксировать альбомную ориентацию, но только в полноэкранном режиме.
// На iOS такого API нет — там остаётся экран с просьбой повернуть телефон.
const canLockOrientation = typeof screen !== 'undefined' && !!screen.orientation?.lock && !!document.documentElement.requestFullscreen
const isTouch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

async function enterLandscape() {
  if (!canLockOrientation) return
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    await screen.orientation.lock('landscape')
  } catch {
    // браузер отказал — остаётся ручной поворот
  }
}

function startGame() {
  if (isTouch) enterLandscape()
  for (const key of Object.keys(vars)) delete vars[key]
  vars.score = 0
  bgKey.value = characterKey.value = stopId.value = null
  isStart.value = false
  showEndScreen.value = false
  if (currentSceneId.value === 'start') enterScene()
  else currentSceneId.value = 'start'
}

function goToStartMenu() {
  clearInterval(typingInterval)
  showEndScreen.value = false
  isStart.value = true
  currentSceneId.value = 'start'
}

function goToScene(sceneId) {
  if (SCENARIO[sceneId]) {
    showEndScreen.value = false
    currentSceneId.value = sceneId
  }
}

function choose(choice) {
  for (const [key, value] of Object.entries(choice.add || {})) vars[key] = (vars[key] || 0) + value
  Object.assign(vars, choice.set || {})
  goToScene(resolve(choice.nextId))
}

const visibleChoices = computed(() => (!isTyping.value && currentScene.value?.choices) || [])

function handleScreenClick() {
  if (isStart.value || showEndScreen.value) return

  if (isTyping.value) {
    completeTyping()
    return
  }

  if (currentScene.value?.isEnd) {
    showEndScreen.value = true
    return
  }

  if (currentScene.value?.nextId && !currentScene.value.choices?.length) {
    goToScene(resolve(currentScene.value.nextId))
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (isStart.value) return startGame()
    if (showEndScreen.value) return goToStartMenu()
    return handleScreenClick()
  }

  if (isStart.value || showEndScreen.value) return
  const choice = visibleChoices.value[Number(event.key) - 1]
  if (choice) choose(choice)
}

const ending = computed(() => currentScene.value?.ending)
const menuBg = ASSETS.bg.menu
const menuCat = ASSETS.characters.cat.happy

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  preload(ASSETS.bg[SCENARIO.start.bgKey])
})

onUnmounted(() => {
  clearInterval(typingInterval)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="relative w-screen h-dvh bg-slate-950 select-none overflow-hidden cursor-pointer font-sans"
    @click="handleScreenClick"
  >
    <Transition name="fade-overlay">
      <div
        v-if="isStart"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center text-white p-6 text-center bg-cover bg-center"
        :style="{ backgroundImage: `url(${menuBg})` }"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950/95"></div>

        <div class="relative flex flex-col items-center">
          <img :src="menuCat" alt="" class="h-40 md:h-52 short:h-24 mb-2 short:mb-1 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
          <h1 class="font-display text-5xl md:text-7xl short:text-4xl font-bold tracking-tight mb-2 text-cream drop-shadow-lg">
            Йошкар-Ола
          </h1>
          <div class="ornament-strip w-48 mb-5 short:mb-2"></div>
          <p class="text-lg md:text-xl short:text-base text-gray-200 max-w-md mb-8 short:mb-4 leading-relaxed">
            Прогулка с Йошкиным котом по главным местам столицы Марий Эл
          </p>
          <button
            @click.stop="startGame"
            class="px-8 py-4 bg-mari-red hover:bg-mari-red-light text-cream font-bold text-lg rounded-2xl shadow-lg shadow-black/40 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            Начать прогулку
          </button>
          <p class="mt-6 text-sm text-gray-400 short:hidden">Клик или Enter — дальше · 1, 2, 3 — выбор ответа</p>
        </div>
      </div>
    </Transition>

    <Transition name="fade-overlay">
      <div
        v-if="showEndScreen && !isStart"
        class="absolute inset-0 z-50 flex flex-col items-center bg-slate-950/90 backdrop-blur-md text-white p-6 short:p-4 text-center overflow-y-auto cursor-default"
        @click.stop
      >
        <!-- mt-auto/mb-auto вместо justify-center: при переполнении экран прокручивается, а не обрезается сверху -->
        <img :src="menuCat" alt="" class="mt-auto h-32 short:h-16 mb-3 short:mb-1" />
        <div class="text-sm uppercase tracking-[0.2em] text-gray-400 mb-2">Концовка</div>
        <h2 class="font-display text-4xl md:text-5xl short:text-3xl font-bold tracking-tight mb-3 text-cream">
          {{ ending?.title || 'Прогулка окончена' }}
        </h2>
        <div class="ornament-strip w-48 mb-5"></div>
        <p class="text-lg md:text-xl short:text-base text-gray-300 max-w-md mb-2 leading-relaxed">
          {{ ending?.text || 'Спасибо за прогулку по Йошкар-Оле!' }}
        </p>
        <p class="text-amber-300 font-semibold mb-8 short:mb-4">Верных ответов: {{ vars.score }} из {{ QUESTIONS }}</p>
        <button
          @click.stop="goToStartMenu"
          class="px-8 py-4 bg-mari-red hover:bg-mari-red-light text-cream font-bold text-lg rounded-2xl shadow-lg shadow-black/40 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          Пройти заново
        </button>

        <details class="mt-8 short:mt-4 mb-auto max-w-xl text-left text-xs text-gray-400">
          <summary class="cursor-pointer text-center">Источники фотографий</summary>
          <ul class="mt-3 space-y-1">
            <li v-for="c in CREDITS" :key="c.url">
              {{ c.what }} — {{ c.author }},
              <a :href="c.url" target="_blank" rel="noopener" class="underline hover:text-white">{{ c.license }}</a>,
              Wikimedia Commons
            </li>
          </ul>
        </details>
      </div>
    </Transition>

    <Transition name="fade-bg">
      <div
        v-if="!isStart"
        :key="currentBgUrl"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: currentBgUrl ? `url(${currentBgUrl})` : 'none' }"
      />
    </Transition>

    <div
      v-if="!isStart && stopIndex >= 0"
      class="absolute top-4 left-4 short:top-2 short:left-2 z-30 max-w-[70%] px-4 py-2.5 short:px-3 short:py-1.5 bg-black/60 text-white rounded-xl border border-white/20 backdrop-blur"
    >
      <div class="text-sm md:text-base font-semibold leading-tight">📍 {{ ROUTE[stopIndex].title }}</div>
      <div class="mt-1.5 flex gap-1.5">
        <span
          v-for="(stop, i) in ROUTE"
          :key="stop.id"
          :title="stop.title"
          class="h-1.5 w-6 rounded-full transition-colors duration-500"
          :class="i <= stopIndex ? 'bg-mari-red-light' : 'bg-white/25'"
        ></span>
      </div>
    </div>

    <button
      v-if="!isStart"
      @click.stop="goToStartMenu"
      title="В меню"
      class="absolute top-4 right-4 short:top-2 short:right-2 z-30 p-2.5 short:p-1.5 bg-black/60 hover:bg-black/80 text-cream rounded-xl border border-white/20 backdrop-blur transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <svg viewBox="0 0 16 16" class="size-7 short:size-6" fill="currentColor" aria-hidden="true">
        <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" />
      </svg>
    </button>

    <Transition name="fade-char">
      <div
        v-if="!isStart && currentCharUrl"
        :key="characterKey"
        class="absolute bottom-0 right-[6%] short:right-2 h-[62vh] short:h-[88vh] w-max pointer-events-none z-10 hidden md:flex short:flex items-end"
      >
        <img
          :src="currentCharUrl"
          alt=""
          class="h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
        />
      </div>
    </Transition>

    <div
      v-if="!isStart"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl short:bottom-3 short:left-3 short:right-[13.5rem] short:w-auto short:max-w-none short:translate-x-0 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-6 pt-7 short:p-3 short:pt-5 text-white z-20 shadow-2xl"
    >
      <div class="ornament-strip absolute top-0 inset-x-6 opacity-80"></div>

      <!-- На телефоне персонаж сидит прямо на окне диалога, чтобы его не перекрывал текст -->
      <Transition name="fade-char">
        <img
          v-if="currentCharUrl"
          :key="characterKey"
          :src="currentCharUrl"
          alt=""
          class="md:hidden short:hidden absolute bottom-full right-3 h-[26vh] pointer-events-none drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]"
        />
      </Transition>

      <div
        v-if="!isNarration"
        class="absolute -top-4 left-6 short:-top-3.5 short:left-4 px-4 py-1 short:py-0.5 short:text-sm bg-mari-red text-cream font-bold rounded-lg shadow-md tracking-wide"
      >
        {{ currentScene?.speaker }}
      </div>

      <div
        class="text-base md:text-lg short:text-sm leading-relaxed min-h-16 short:min-h-0"
        :class="isNarration ? 'italic text-gray-300' : 'text-gray-100'"
      >
        {{ displayedText }}
        <span v-if="isTyping" class="inline-block w-2 h-5 bg-mari-red-light ml-1 animate-pulse align-middle"></span>
      </div>

      <div v-if="visibleChoices.length" class="mt-4 short:mt-2 flex flex-col gap-2 short:gap-1.5">
        <button
          v-for="(choice, index) in visibleChoices"
          :key="index"
          @click.stop="choose(choice)"
          class="group w-full flex items-center gap-3 text-left p-3.5 short:px-3 short:py-2 short:text-sm rounded-xl bg-white/10 hover:bg-cream hover:text-slate-950 border border-white/10 font-medium transition-all duration-200 active:scale-[0.99] cursor-pointer"
        >
          <span class="hidden md:inline-flex short:hidden size-6 shrink-0 items-center justify-center rounded-md bg-white/15 group-hover:bg-mari-red group-hover:text-cream text-xs font-bold">
            {{ index + 1 }}
          </span>
          {{ choice.text }}
        </button>
      </div>

      <div
        v-else-if="currentScene?.nextId || currentScene?.isEnd"
        class="mt-2 text-right text-xs text-gray-400"
      >
        <span v-if="isTyping">▶</span>
        <span v-else class="animate-pulse">▶</span>
      </div>
    </div>

    <div
      class="hidden portrait-phone:flex fixed inset-0 z-[100] flex-col items-center justify-center gap-6 bg-slate-950 p-8 text-center text-white cursor-default"
      @click.stop
    >
      <svg viewBox="0 0 24 24" class="rotate-phone size-20 text-cream" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <path d="M10.5 18.5h3" stroke-linecap="round" />
      </svg>
      <div>
        <p class="font-display text-2xl font-bold text-cream mb-2">Поверните телефон</p>
        <p class="text-gray-300">Прогулка по Йошкар-Оле смотрится только в альбомной ориентации</p>
      </div>
      <button
        v-if="canLockOrientation"
        @click.stop="enterLandscape"
        class="px-6 py-3 bg-mari-red hover:bg-mari-red-light text-cream font-bold rounded-2xl shadow-lg shadow-black/40 active:scale-95 cursor-pointer"
      >
        Развернуть на весь экран
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 0.5s ease; }
.fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }

.fade-bg-enter-active, .fade-bg-leave-active { transition: opacity 0.6s ease-in-out; }
.fade-bg-enter-from, .fade-bg-leave-to { opacity: 0; }

.fade-char-enter-active, .fade-char-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-char-enter-from, .fade-char-leave-to { opacity: 0; transform: translateY(10px); }
</style>
