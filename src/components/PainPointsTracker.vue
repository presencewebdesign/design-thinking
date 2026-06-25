<template>
  <main class="mx-auto max-w-[1800px] px-6 py-6">
    <!-- Filter Bar -->
    <div class="mb-5 flex items-center gap-2">
      <span class="text-sm font-medium text-slate-500 mr-1">Filter:</span>
      <button
        v-for="f in filterOptions"
        :key="f.value"
        @click="activeFilter = f.value"
        class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border"
        :class="activeFilter === f.value ? f.activeClass : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
      >
        {{ f.label }}
        <span
          v-if="f.value !== 'all'"
          class="ml-1 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] min-w-[18px]"
          :class="activeFilter === f.value ? 'bg-white/30 text-current' : 'bg-slate-100 text-slate-400'"
        >{{ countByPriority(f.value) }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pain Points Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Pain Points
            <span class="text-sm font-normal text-slate-400">({{ filteredPainPoints.length }})</span>
          </h2>
          <button
            @click="showAddPainPoint = !showAddPainPoint"
            class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        <!-- Add Pain Point Form -->
        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="showAddPainPoint"
            class="mb-4 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4"
          >
            <textarea
              v-model="newPainPointDesc"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 resize-none transition-all"
              placeholder="Describe the pain point..."
              rows="2"
              @keydown.meta.enter="addPainPoint"
              @keydown.ctrl.enter="addPainPoint"
            ></textarea>
            <div class="flex items-center gap-3 mt-3">
              <select
                v-model="newPainPointPriority"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <div class="flex-1"></div>
              <button
                @click="showAddPainPoint = false; newPainPointDesc = ''"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="addPainPoint"
                :disabled="!newPainPointDesc.trim()"
                class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Pain Point
              </button>
            </div>
          </div>
        </Transition>

        <!-- Pain Point Cards -->
        <div class="space-y-3">
          <TransitionGroup
            enter-active-class="duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-for="pp in filteredPainPoints"
              :key="pp.id"
              :ref="(el) => setPainPointRef(pp.id, el)"
              class="group relative rounded-xl border-l-4 border bg-white px-4 py-3.5 shadow-sm transition-all duration-300 hover:shadow-md"
              :class="[priorityCardClass(pp.priority), highlightedPainPointId === pp.id ? 'ring-2 ring-indigo-400 ring-offset-1' : '']"
            >
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <textarea
                    v-model="pp.description"
                    class="w-full resize-none bg-transparent text-sm text-slate-700 leading-relaxed placeholder-slate-400 focus:outline-none"
                    placeholder="Describe the pain point..."
                    rows="2"
                    @input="emitPainPoints"
                  ></textarea>
                  <div class="flex items-center gap-2 mt-2 flex-wrap">
                    <select
                      v-model="pp.priority"
                      @change="emitPainPoints"
                      class="rounded-md border px-2 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      :class="prioritySelectClass(pp.priority)"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      v-model="pp.solutionId"
                      @change="emitPainPoints"
                      class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 max-w-[200px] transition-all"
                    >
                      <option :value="null">Unassigned</option>
                      <option
                        v-for="sol in localSolutions"
                        :key="sol.id"
                        :value="sol.id"
                      >{{ truncate(sol.description, 30) }}</option>
                    </select>
                  </div>
                </div>
                <button
                  @click="removePainPoint(pp.id)"
                  class="rounded-md p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <!-- Linked Solution Badge -->
              <div v-if="pp.solutionId && getSolution(pp.solutionId)" class="mt-2 pt-2 border-t border-slate-100">
                <span class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {{ truncate(getSolution(pp.solutionId)?.description ?? '', 40) }}
                </span>
              </div>
            </div>
          </TransitionGroup>

          <p v-if="filteredPainPoints.length === 0" class="text-center text-sm text-slate-400 py-10 rounded-xl border-2 border-dashed border-slate-200">
            {{ localPainPoints.length === 0 ? 'No pain points yet. Add one above.' : 'No pain points match the current filter.' }}
          </p>
        </div>
      </section>

      <!-- Solutions Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Solutions
            <span class="text-sm font-normal text-slate-400">({{ localSolutions.length }})</span>
          </h2>
          <button
            @click="showAddSolution = !showAddSolution"
            class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        <!-- Add Solution Form -->
        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="showAddSolution"
            class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4"
          >
            <textarea
              v-model="newSolutionDesc"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 resize-none transition-all"
              placeholder="Describe the solution..."
              rows="2"
              @keydown.meta.enter="addSolution"
              @keydown.ctrl.enter="addSolution"
            ></textarea>
            <div class="flex items-center justify-end gap-2 mt-3">
              <button
                @click="showAddSolution = false; newSolutionDesc = ''"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="addSolution"
                :disabled="!newSolutionDesc.trim()"
                class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Solution
              </button>
            </div>
          </div>
        </Transition>

        <!-- Solution Cards -->
        <div class="space-y-3">
          <TransitionGroup
            enter-active-class="duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-for="sol in localSolutions"
              :key="sol.id"
              class="group relative rounded-xl border border-emerald-200/80 bg-white px-4 py-3.5 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <textarea
                    v-model="sol.description"
                    class="w-full resize-none bg-transparent text-sm text-slate-700 leading-relaxed placeholder-slate-400 focus:outline-none"
                    placeholder="Describe the solution..."
                    rows="2"
                    @input="emitSolutions"
                  ></textarea>
                </div>
                <button
                  @click="removeSolution(sol.id)"
                  class="rounded-md p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Linked Pain Points -->
              <div v-if="linkedPainPoints(sol.id).length > 0" class="mt-2 pt-2 border-t border-slate-100">
                <p class="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5">Linked Pain Points</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="lpp in linkedPainPoints(sol.id)"
                    :key="lpp.id"
                    @click="scrollToPainPoint(lpp.id)"
                    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer hover:opacity-80"
                    :class="priorityBadgeClass(lpp.priority)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="priorityDotClass(lpp.priority)"></span>
                    {{ truncate(lpp.description, 25) }}
                  </button>
                </div>
              </div>
              <p v-else class="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 italic">
                No pain points linked yet
              </p>
            </div>
          </TransitionGroup>

          <p v-if="localSolutions.length === 0" class="text-center text-sm text-slate-400 py-10 rounded-xl border-2 border-dashed border-slate-200">
            No solutions yet. Add one above.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import type { PainPoint, Solution, Priority } from '@/types'

const props = defineProps<{
  painPoints: PainPoint[]
  solutions: Solution[]
}>()

const emit = defineEmits<{
  'update:pain-points': [value: PainPoint[]]
  'update:solutions': [value: Solution[]]
}>()

const localPainPoints = computed({
  get: () => props.painPoints,
  set: (val) => emit('update:pain-points', val),
})

const localSolutions = computed({
  get: () => props.solutions,
  set: (val) => emit('update:solutions', val),
})

const activeFilter = ref<Priority | 'all'>('all')
const showAddPainPoint = ref(false)
const showAddSolution = ref(false)
const newPainPointDesc = ref('')
const newPainPointPriority = ref<Priority>('medium')
const newSolutionDesc = ref('')
const highlightedPainPointId = ref<string | null>(null)
const painPointRefs = reactive<Record<string, HTMLElement>>({})

function setPainPointRef(id: string, el: unknown) {
  if (!el) return
  const node = el as Record<string, unknown>
  painPointRefs[id] = (node.$el ?? node) as HTMLElement
}

const filterOptions: { value: Priority | 'all'; label: string; activeClass: string }[] = [
  { value: 'all', label: 'All', activeClass: 'border-indigo-300 bg-indigo-50 text-indigo-700' },
  { value: 'high', label: 'High', activeClass: 'border-rose-300 bg-rose-50 text-rose-700' },
  { value: 'medium', label: 'Medium', activeClass: 'border-amber-300 bg-amber-50 text-amber-700' },
  { value: 'low', label: 'Low', activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
]

const filteredPainPoints = computed(() => {
  if (activeFilter.value === 'all') return localPainPoints.value
  return localPainPoints.value.filter((pp) => pp.priority === activeFilter.value)
})

function countByPriority(priority: Priority | 'all') {
  if (priority === 'all') return localPainPoints.value.length
  return localPainPoints.value.filter((pp) => pp.priority === priority).length
}

const generateId = () => Math.random().toString(36).substr(2, 9)

function emitPainPoints() {
  emit('update:pain-points', [...localPainPoints.value])
}

function emitSolutions() {
  emit('update:solutions', [...localSolutions.value])
}

function addPainPoint() {
  if (!newPainPointDesc.value.trim()) return
  const pp: PainPoint = {
    id: generateId(),
    description: newPainPointDesc.value.trim(),
    priority: newPainPointPriority.value,
    solutionId: null,
    createdAt: new Date(),
  }
  emit('update:pain-points', [...localPainPoints.value, pp])
  newPainPointDesc.value = ''
  newPainPointPriority.value = 'medium'
  showAddPainPoint.value = false
}

function removePainPoint(id: string) {
  emit('update:pain-points', localPainPoints.value.filter((pp) => pp.id !== id))
  delete painPointRefs[id]
}

function addSolution() {
  if (!newSolutionDesc.value.trim()) return
  const sol: Solution = {
    id: generateId(),
    description: newSolutionDesc.value.trim(),
    createdAt: new Date(),
  }
  emit('update:solutions', [...localSolutions.value, sol])
  newSolutionDesc.value = ''
  showAddSolution.value = false
}

function removeSolution(id: string) {
  const linked = linkedPainPoints(id)
  if (linked.length > 0) {
    if (!confirm(`This solution is linked to ${linked.length} pain point(s). Removing it will unlink them. Continue?`)) return
    const updated = localPainPoints.value.map((pp) =>
      pp.solutionId === id ? { ...pp, solutionId: null } : pp,
    )
    emit('update:pain-points', updated)
  }
  emit('update:solutions', localSolutions.value.filter((s) => s.id !== id))
}

function getSolution(id: string) {
  return localSolutions.value.find((s) => s.id === id)
}

function linkedPainPoints(solutionId: string) {
  return localPainPoints.value.filter((pp) => pp.solutionId === solutionId)
}

function scrollToPainPoint(id: string) {
  activeFilter.value = 'all'
  nextTick(() => {
    const el = painPointRefs[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightedPainPointId.value = id
      setTimeout(() => {
        highlightedPainPointId.value = null
      }, 2000)
    }
  })
}

function truncate(text: string, len: number) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

function priorityCardClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'border-l-rose-400 border-rose-200/60 bg-rose-50/30',
    medium: 'border-l-amber-400 border-amber-200/60 bg-amber-50/30',
    low: 'border-l-emerald-400 border-emerald-200/60 bg-emerald-50/30',
  }
  return map[priority]
}

function prioritySelectClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'border-rose-300 bg-rose-50 text-rose-700',
    medium: 'border-amber-300 bg-amber-50 text-amber-700',
    low: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  }
  return map[priority]
}

function priorityBadgeClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'bg-rose-50 text-rose-700',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-emerald-50 text-emerald-700',
  }
  return map[priority]
}

function priorityDotClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  }
  return map[priority]
}
</script>
