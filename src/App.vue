<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ASSETS } from './config/assets.js'
import { SCENARIO } from './config/scenario.js'

const isStart = ref(true)
const showEndScreen = ref(false)

const currentSceneId = ref('start')
const currentScene = computed(() => SCENARIO[currentSceneId.value])

const currentBgUrl = computed(() => ASSETS.bg[currentScene.value?.bgKey] || '')
const currentCharUrl = computed(() => ASSETS.characters[currentScene.value?.characterKey] || null)

const displayedText = ref('')
const isTyping = ref(false)
let typingInterval = null

function startTypewriter(fullText) {
  clearInterval(typingInterval)
  displayedText.value = ''
  isTyping.value = true

  let index = 0
  typingInterval = setInterval(() => {
    if (index < fullText.length) {
      displayedText.value += fullText.charAt(index)
      index++
    } else {
      completeTyping(fullText)
    }
  }, 25)
}

function completeTyping(fullText) {
  clearInterval(typingInterval)
  displayedText.value = fullText
  isTyping.value = false
}

watch(currentSceneId, () => {
  if (!isStart.value && currentScene.value?.text) {
    startTypewriter(currentScene.value.text)
  }
})

function startGame() {
  isStart.value = false
  showEndScreen.value = false
  currentSceneId.value = 'start'
  if (currentScene.value?.text) {
    startTypewriter(currentScene.value.text)
  }
}

function goToStartMenu() {
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

function handleScreenClick() {
  if (isStart.value || showEndScreen.value) return

  const fullText = currentScene.value?.text || ''

  if (isTyping.value) {
    completeTyping(fullText)
    return
  }

  if (currentScene.value?.isEnd) {
    showEndScreen.value = true
    return
  }

  if (currentScene.value?.nextId && (!currentScene.value.choices || currentScene.value.choices.length === 0)) {
    goToScene(currentScene.value.nextId)
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter') {
    if (isStart.value) {
      startGame()
      return
    }
    if (showEndScreen.value) {
      goToStartMenu()
      return
    }
    handleScreenClick()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(typingInterval)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="relative w-screen h-screen bg-slate-950 select-none overflow-hidden cursor-pointer font-sans"
    @click="handleScreenClick"
  >
    <Transition name="fade-overlay">
      <div
        v-if="isStart"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center"
      >
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          Йошкар-Ола
        </h1>
        <p class="text-lg md:text-xl text-gray-300 max-w-md mb-8 leading-relaxed">
          Интерактивная карта. Отправься в виртуальную прогулку по главным достопримечательностям города!
        </p>
        <button
          @click.stop="startGame"
          class="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg rounded-2xl shadow-lg hover:shadow-amber-500/40 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          Начать игру
        </button>
      </div>
    </Transition>

    <Transition name="fade-overlay">
      <div
        v-if="showEndScreen && !isStart"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white p-6 text-center"
      >
        <div class="text-6xl mb-4 animate-bounce">🏆</div>
        <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          Вы прошли новеллу!
        </h2>
        <p class="text-lg md:text-xl text-gray-300 max-w-md mb-8 leading-relaxed">
          Спасибо за прогулку по Йошкар-Оле! Надеемся, вам понравилось наше виртуальное путешествие.
        </p>
        <button
          @click.stop="goToStartMenu"
          class="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg rounded-2xl shadow-lg hover:shadow-amber-500/40 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          Пройти заново
        </button>
      </div>
    </Transition>

    <Transition name="fade-bg">
      <div
        v-if="!isStart"
        :key="currentBgUrl"
        class="absolute inset-0 bg-cover bg-center transition-all duration-700"
        :style="{ backgroundImage: currentBgUrl ? `url(${currentBgUrl})` : 'none' }"
      />
    </Transition>

    <button
      v-if="!isStart"
      @click.stop="goToStartMenu"
      class="absolute top-4 right-4 z-30 px-2 py-2 bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/20 backdrop-blur transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <img src="/assets/home.svg" class="size-8 stroke-amber-500">
    </button>

    <Transition name="fade-char">
      <div
        v-if="!isStart && currentCharUrl"
        :key="currentCharUrl"
        class="absolute bottom-0 left-1/2 -translate-x-1/2 h-[65vh] pointer-events-none z-10 flex items-end"
      >
        <img
          :src="currentCharUrl"
          alt="Character"
          class="h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
        />
      </div>
    </Transition>

    <div
      v-if="!isStart"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-white z-20 shadow-2xl"
    >
      <div class="text-amber-600 font-bold text-lg mb-1 tracking-wide">
        {{ currentScene?.speaker }}
      </div>

      <div class="text-base md:text-lg leading-relaxed text-gray-100 min-h-[4rem]">
        {{ displayedText }}
        <span v-if="isTyping" class="inline-block w-2 h-5 bg-amber-500 ml-1 animate-pulse align-middle"></span>
      </div>

      <div
        v-if="currentScene?.choices?.length && !isTyping"
        class="mt-4 flex flex-col gap-2"
      >
        <button
          v-for="(choice, index) in currentScene.choices"
          :key="index"
          @click.stop="goToScene(choice.nextId)"
          class="w-full text-left p-3.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 border border-white/10 font-medium transition-all duration-200 active:scale-[0.99] cursor-pointer"
        >
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
  </div>
</template>

<style scoped>
.fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 0.5s ease; }
.fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }

.fade-bg-enter-active, .fade-bg-leave-active { transition: opacity 0.6s ease-in-out; }
.fade-bg-enter-from, .fade-bg-leave-to { opacity: 0; }

.fade-char-enter-active, .fade-char-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-char-enter-from, .fade-char-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
