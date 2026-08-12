<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 relative"
    :class="{ 'select-none': isDragging }"
  >
    <!-- Top bar -->
    <header class="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div class="mx-auto max-w-[1800px] px-6 py-4 flex items-center justify-between gap-6">
        <div class="min-w-0">
          <h1 class="text-xl font-semibold text-slate-900 tracking-tight truncate">
            Design Thinking
          </h1>
          <p class="text-sm text-slate-500 mt-0.5 hidden sm:block">
            {{ activeView === 'journey' ? 'Map user journeys across Thinking, Doing & Feeling' : activeView === 'graph' ? 'Visualise What → Why → How as a linked graph' : 'Track and prioritise pain points with linked solutions' }}
          </p>
        </div>

        <!-- View Toggle -->
        <div class="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 flex-shrink-0">
          <button
            @click="activeView = 'journey'"
            class="rounded-md px-3.5 py-1.5 text-sm font-medium transition-all"
            :class="activeView === 'journey' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            Journey Map
          </button>
          <button
            @click="activeView = 'painpoints'"
            class="rounded-md px-3.5 py-1.5 text-sm font-medium transition-all"
            :class="activeView === 'painpoints' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            Pain Points
          </button>
          <button
            @click="activeView = 'graph'"
            class="rounded-md px-3.5 py-1.5 text-sm font-medium transition-all"
            :class="activeView === 'graph' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            Graph
          </button>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <template v-if="activeView === 'journey'">
            <button
              @click="addPhase"
              class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Add Phase</span>
            </button>
            <button
              @click="toggleSidebar"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="hidden sm:inline">Notepads</span>
            </button>
          </template>
          <button
            @click="exportData"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="hidden md:inline">Export</span>
          </button>
          <button
            @click="importData"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span class="hidden md:inline">Import</span>
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileImport"
            class="hidden"
          />
        </div>
      </div>
    </header>

    <!-- Journey Map -->
    <main v-if="activeView === 'journey'" class="mx-auto max-w-[1800px] px-6 py-6" :class="{ 'mr-80': showSidebar }">
      <!-- Tip banner -->
      <div
        v-if="showTip"
        class="mb-5 flex items-start gap-3 rounded-xl bg-indigo-50/70 border border-indigo-100 px-4 py-3"
      >
        <svg class="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-indigo-700 leading-relaxed flex-1">
          Drag notepads from the sidebar into any cell. Drop them in the row
          (<strong>Thinking</strong>, <strong>Doing</strong>, or <strong>Feeling</strong>)
          where they belong.
        </p>
        <button @click="showTip = false" class="text-indigo-400 hover:text-indigo-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Grid table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <!-- Phase Headers -->
        <div class="grid" :style="gridTemplate">
          <!-- Corner cell -->
          <div class="bg-slate-50/80 border-b border-r border-slate-200/80 px-4 py-3"></div>
          <!-- Phase columns -->
          <div
            v-for="(phase, index) in phases"
            :key="'header-' + index"
            class="border-b border-r border-slate-200/80 last:border-r-0 px-4 py-3 bg-slate-50/80"
          >
            <div class="flex items-center gap-2">
              <input
                v-model="phase.title"
                class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white rounded-md px-2 py-1 -ml-2 transition-all"
                placeholder="Phase name"
              />
              <button
                v-if="phases.length > 1"
                @click="removePhase(index)"
                class="rounded-md p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Journey Rows -->
        <div
          v-for="(rowType, rowIndex) in rowTypes"
          :key="rowType.key"
          class="grid"
          :style="gridTemplate"
        >
          <!-- Row label -->
          <div
            class="border-r border-b border-slate-200/80 px-4 py-4 flex items-center gap-2.5 bg-slate-50/50"
            :class="{ 'border-b-0': rowIndex === rowTypes.length - 1 }"
          >
            <span class="text-lg">{{ rowType.icon }}</span>
            <span class="text-sm font-medium text-slate-600">{{ rowType.label }}</span>
          </div>

          <!-- Phase cells -->
          <div
            v-for="(phase, phaseIndex) in phases"
            :key="'cell-' + phaseIndex"
            class="border-r border-b border-slate-200/80 last:border-r-0 p-3 min-h-[140px] transition-colors"
            :class="{
              'border-b-0': rowIndex === rowTypes.length - 1,
              'bg-indigo-50/30': isDragging,
            }"
          >
            <draggable
              :list="getPhaseArray(phaseIndex, rowType.key)"
              group="notepads"
              class="flex flex-col gap-2 min-h-[100px] rounded-xl border-2 border-dashed p-2 transition-colors duration-200"
              :class="
                isDragging
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : 'border-transparent hover:border-slate-200'
              "
              item-key="id"
              @start="dragStart"
              @end="dragEnd"
              :animation="200"
              ghost-class="drag-ghost"
              chosen-class="drag-chosen"
              @add="onNotepadAdded"
              @change="onNotepadChange"
              @remove="onNotepadRemove"
              @update="onNotepadUpdate"
              :empty-insert-threshold="30"
              :force-fallback="true"
              fallback-class="drag-fallback"
            >
              <template #item="{ element: notepad }">
                <div
                  class="notepad-item group relative rounded-xl border bg-white px-3 py-2.5 shadow-sm cursor-grab active:cursor-grabbing"
                  :class="notepadBorder(rowType.key)"
                >
                  <textarea
                    v-model="notepad.content"
                    class="w-full min-h-[48px] resize-none bg-transparent text-sm text-slate-700 leading-relaxed placeholder-slate-400 focus:outline-none pointer-events-auto"
                    placeholder="Write a note..."
                    @blur="saveNotepad(notepad)"
                    @mousedown.stop
                  ></textarea>
                  <button
                    @click.stop="removeNotepad(phaseIndex, rowType.key, notepad)"
                    @mousedown.stop
                    @pointerdown.stop
                    class="absolute top-1.5 right-1.5 rounded-lg p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </main>

    <!-- Graph View -->
    <GraphView
      v-if="activeView === 'graph'"
      :pain-points="painPoints"
      :whys="whys"
      :solutions="solutions"
    />

    <!-- Pain Points View -->
    <PainPointsTracker
      v-if="activeView === 'painpoints'"
      :pain-points="painPoints"
      :whys="whys"
      :solutions="solutions"
      @update:pain-points="painPoints = $event"
      @update:whys="whys = $event"
      @update:solutions="solutions = $event"
    />

    <!-- Notepad Sidebar -->
    <aside
      v-if="activeView === 'journey'"
      class="fixed right-0 top-0 w-80 h-screen bg-white border-l border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-out shadow-xl shadow-slate-200/50"
      :class="showSidebar ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-slate-800">Available Notepads</h3>
        <button
          @click="toggleSidebar"
          class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-5 py-3 border-b border-slate-100">
        <button
          @click="addNewNotepad"
          class="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Notepad
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-3">
        <draggable
          :list="availableNotepads"
          group="notepads"
          class="flex flex-col gap-2 min-h-[40px]"
          item-key="id"
          @start="dragStart"
          @end="dragEnd"
          :animation="200"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          :empty-insert-threshold="30"
          :force-fallback="true"
          fallback-class="drag-fallback"
        >
          <template #item="{ element: notepad }">
            <div
              class="notepad-item group relative rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:border-amber-300 hover:shadow-md"
            >
              <p class="text-sm text-slate-700 leading-relaxed pr-12 min-h-[20px] select-none">
                {{ notepad.content || 'Empty notepad' }}
              </p>
              <div class="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click.stop="editNotepadInSidebar(notepad)"
                  class="rounded-md p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click.stop="removeNotepadFromSidebar(notepad)"
                  class="rounded-md p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <p v-if="availableNotepads.length === 0" class="text-center text-sm text-slate-400 py-8">
          No notepads yet. Add one above.
        </p>
      </div>
    </aside>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showEditModal"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          @click="closeEditModal"
        >
          <Transition
            enter-active-class="duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div
              v-if="showEditModal"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              @click.stop
            >
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 class="text-base font-semibold text-slate-800">Edit Notepad</h3>
                <button
                  @click="closeEditModal"
                  class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-6">
                <textarea
                  v-model="editingNotepadContent"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all resize-none"
                  placeholder="Write your note here..."
                  rows="5"
                ></textarea>
              </div>
              <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  @click="closeEditModal"
                  class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="saveEditModal"
                  class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Notepad, Phase, ImportData, PainPoint, Why, Solution } from '@/types'
import PainPointsTracker from '@/components/PainPointsTracker.vue'
import GraphView from '@/components/GraphView.vue'

const SESSION_KEY = 'design-thinking-session'

function saveToSession() {
  const data = {
    phases: phases.value,
    availableNotepads: availableNotepads.value,
    painPoints: painPoints.value,
    whys: whys.value,
    solutions: solutions.value,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

function loadFromSession() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as {
      phases: Phase[]
      availableNotepads: Notepad[]
      painPoints?: PainPoint[]
      whys?: Why[]
      solutions?: Solution[]
    }
  } catch {
    return null
  }
}

const activeView = ref<'journey' | 'painpoints' | 'graph'>('journey')
const phases = ref<Phase[]>([])
const painPoints = ref<PainPoint[]>([])
const whys = ref<Why[]>([])
const solutions = ref<Solution[]>([])
const fileInput = ref<HTMLInputElement>()
const showTip = ref(true)

const rowTypes = [
  { key: 'thinking', label: 'Thinking', icon: '🧠' },
  { key: 'doing', label: 'Doing', icon: '✋' },
  { key: 'feeling', label: 'Feeling', icon: '💭' },
]

const gridTemplate = computed(() => {
  const cols = phases.value.length
  return { gridTemplateColumns: `140px repeat(${cols}, minmax(200px, 1fr))` }
})

function notepadBorder(rowKey: string) {
  const map: Record<string, string> = {
    thinking: 'border-sky-200/80 bg-sky-50/30',
    doing: 'border-emerald-200/80 bg-emerald-50/30',
    feeling: 'border-violet-200/80 bg-violet-50/30',
  }
  return map[rowKey] ?? 'border-slate-200'
}

const availableNotepads = ref<Notepad[]>([])
const showSidebar = ref(false)
const isDragging = ref(false)
const showEditModal = ref(false)
const editingNotepad = ref<Notepad | null>(null)
const editingNotepadContent = computed({
  get: () => editingNotepad.value?.content || '',
  set: (value: string) => {
    if (editingNotepad.value) {
      editingNotepad.value.content = value
    }
  },
})

const phaseNotepads = computed(() => {
  return phases.value.map((phase) => ({
    thinking: phase.thinking,
    doing: phase.doing,
    feeling: phase.feeling,
  }))
})

watch(
  phaseNotepads,
  (newValue) => {
    newValue.forEach((phaseData, index) => {
      if (phases.value[index]) {
        phases.value[index].thinking = phaseData.thinking
        phases.value[index].doing = phaseData.doing
        phases.value[index].feeling = phaseData.feeling
      }
    })
  },
  { deep: true },
)

watch([phases, availableNotepads, painPoints, whys, solutions], saveToSession, { deep: true })

const generateId = () => Math.random().toString(36).substr(2, 9)

const addPhase = () => {
  phases.value.push({
    title: `Phase ${phases.value.length + 1}`,
    thinking: [],
    doing: [],
    feeling: [],
  })
}

const removePhase = (index: number) => {
  if (phases.value.length > 1) {
    phases.value.splice(index, 1)
  }
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const addNewNotepad = () => {
  const newNotepad: Notepad = {
    id: generateId(),
    content: '',
    createdAt: new Date(),
  }
  availableNotepads.value.push(newNotepad)
  editingNotepad.value = newNotepad
  showEditModal.value = true
}

const dragStart = () => {
  isDragging.value = true
}

const dragEnd = () => {
  isDragging.value = false
  setTimeout(() => {
    phases.value = [...phases.value]
  }, 50)
}

const saveNotepad = (_notepad: Notepad) => {
  // Persistence is handled by the session storage watcher
}

const removeNotepad = (phaseIndex: number, rowType: string, notepad: Notepad) => {
  const phase = phases.value[phaseIndex]
  const row = phase[rowType as keyof Phase] as Notepad[]
  const index = row.findIndex((n) => n.id === notepad.id)
  if (index > -1) {
    row.splice(index, 1)
    phases.value = [...phases.value]
  }
}

const editNotepadInSidebar = (notepad: Notepad) => {
  editingNotepad.value = { ...notepad }
  showEditModal.value = true
}

const removeNotepadFromSidebar = (notepad: Notepad) => {
  const index = availableNotepads.value.findIndex((n) => n.id === notepad.id)
  if (index > -1) {
    availableNotepads.value.splice(index, 1)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingNotepad.value = null
}

const saveEditModal = () => {
  if (editingNotepad.value) {
    const index = availableNotepads.value.findIndex((n) => n.id === editingNotepad.value!.id)
    if (index > -1) {
      availableNotepads.value[index] = { ...editingNotepad.value }
    }
  }
  closeEditModal()
}

const exportData = () => {
  const data = {
    phases: phases.value,
    availableNotepads: availableNotepads.value,
    painPoints: painPoints.value,
    whys: whys.value,
    solutions: solutions.value,
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'design-thinking-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

const onNotepadAdded = (event: {
  added?: { element: Notepad }
  removed?: unknown
  moved?: unknown
}) => {
  if (event.added) {
    setTimeout(() => {
      phases.value = [...phases.value]
    }, 10)
  }
}

const onNotepadChange = () => {
  phases.value = [...phases.value]
}

const onNotepadRemove = () => {}

const onNotepadUpdate = () => {}

const getNotepadArray = (phase: Phase, rowType: string) => {
  return phase[rowType as keyof Phase] as Notepad[]
}

const getPhaseArray = (phaseIndex: number, rowType: string) => {
  return getNotepadArray(phases.value[phaseIndex], rowType)
}

const importData = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data: ImportData = JSON.parse(content)

      if (
        data.phases &&
        Array.isArray(data.phases) &&
        data.availableNotepads &&
        Array.isArray(data.availableNotepads)
      ) {
        phases.value = data.phases
        availableNotepads.value = data.availableNotepads
        painPoints.value = data.painPoints ?? []
        whys.value = data.whys ?? []
        solutions.value = data.solutions ?? []
        alert(`Successfully imported data from ${new Date(data.exportedAt).toLocaleString()}`)
      } else {
        throw new Error('Invalid data structure')
      }
    } catch (error) {
      alert("Error importing file. Please make sure it's a valid JSON file exported from this app.")
      console.error('Import error:', error)
    }
  }

  reader.readAsText(file)
  target.value = ''
}

onMounted(() => {
  const saved = loadFromSession()
  if (saved) {
    phases.value = saved.phases
    availableNotepads.value = saved.availableNotepads
    painPoints.value = saved.painPoints ?? []
    whys.value = saved.whys ?? []
    solutions.value = saved.solutions ?? []
    return
  }

  availableNotepads.value = [
    { id: generateId(), content: 'Do I have everything packed?', createdAt: new Date() },
    { id: generateId(), content: 'Will my flight be on time?', createdAt: new Date() },
    { id: generateId(), content: 'How do I get to my hotel?', createdAt: new Date() },
    { id: generateId(), content: 'What should I explore first?', createdAt: new Date() },
    { id: generateId(), content: 'Searching Google, packing', createdAt: new Date() },
    { id: generateId(), content: 'Going through airport security', createdAt: new Date() },
    { id: generateId(), content: 'Using maps, booking Uber', createdAt: new Date() },
    { id: generateId(), content: 'Walking to a café', createdAt: new Date() },
    { id: generateId(), content: 'Excited, anxious', createdAt: new Date() },
    { id: generateId(), content: 'Impatient, bored', createdAt: new Date() },
    { id: generateId(), content: 'Tired, disoriented', createdAt: new Date() },
    { id: generateId(), content: 'Curious, eager', createdAt: new Date() },
  ]
})
</script>

<style>
/* vuedraggable ghost/chosen/fallback classes are applied to cloned DOM
   elements outside the scoped component, so they must be global. */
.drag-ghost {
  opacity: 0.4 !important;
}

.drag-chosen {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  ring: 2px solid #818cf8 !important;
  outline: 2px solid #818cf8 !important;
  outline-offset: 1px;
  transform: scale(1.02);
}

.drag-fallback {
  opacity: 0.9 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  transform: rotate(2deg) !important;
}

.notepad-item {
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
</style>
