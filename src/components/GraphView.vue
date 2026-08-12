<template>
  <div class="flex flex-col" style="height: calc(100vh - 73px)">
    <div
      class="flex items-center gap-6 px-8 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur flex-wrap flex-shrink-0"
    >
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 rounded-full bg-rose-400"></span>
        <span class="text-xs font-medium text-slate-500">What — Pain Point</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 rounded-full bg-sky-400"></span>
        <span class="text-xs font-medium text-slate-500">Why — Root Cause</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 rounded-full bg-emerald-400"></span>
        <span class="text-xs font-medium text-slate-500">How — Solution</span>
      </div>
      <p v-if="isEmpty" class="text-xs text-slate-400 italic ml-2">
        No data yet — add items in the Pain Points view.
      </p>
      <div class="ml-auto flex items-center gap-2">
        <button
          @click="onFitView"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5"
            />
          </svg>
          Fit view
        </button>
      </div>
    </div>

    <div class="relative flex-1 min-h-0">
      <VueFlow
        id="what-why-how"
        v-model:nodes="nodes"
        v-model:edges="edges"
        :min-zoom="0.3"
        :max-zoom="2"
        :nodes-connectable="false"
        :delete-key-code="null"
        :default-edge-options="defaultEdgeOptions"
        fit-view-on-init
        class="graph-canvas"
      >
        <Background :gap="20" :size="1" color="#e2e8f0" />
        <Controls />
        <MiniMap :node-color="minimapColor" pannable zoomable />

        <template #node-what="{ data }">
          <div
            class="w-[240px] rounded-xl border-l-4 bg-white shadow-sm px-3 py-2.5"
            :class="priorityBorderClass(data.priority)"
          >
            <Handle type="source" :position="Position.Right" class="graph-handle graph-handle-rose" />
            <div class="flex items-start gap-1.5 mb-1">
              <span class="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full" :class="priorityDotClass(data.priority)"></span>
              <p class="text-xs font-semibold text-slate-700 leading-snug line-clamp-3">
                {{ data.label || 'Untitled' }}
              </p>
            </div>
            <span
              class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="priorityPillClass(data.priority)"
            >
              {{ data.priority }}
            </span>
          </div>
        </template>

        <template #node-why="{ data }">
          <div class="w-[240px] rounded-xl border border-sky-200 bg-sky-50/80 shadow-sm px-3 py-2.5">
            <Handle type="target" :position="Position.Left" class="graph-handle graph-handle-sky" />
            <Handle type="source" :position="Position.Right" class="graph-handle graph-handle-sky" />
            <div class="flex items-start gap-1.5">
              <svg class="w-3 h-3 text-sky-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-xs text-sky-800 leading-snug line-clamp-3">{{ data.label || 'Untitled' }}</p>
            </div>
          </div>
        </template>

        <template #node-how="{ data }">
          <div class="w-[240px] rounded-xl border border-emerald-200 bg-emerald-50/80 shadow-sm px-3 py-2.5">
            <Handle type="target" :position="Position.Left" class="graph-handle graph-handle-emerald" />
            <div class="flex items-start gap-1.5">
              <svg
                class="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <p class="text-xs text-emerald-800 leading-snug line-clamp-3">{{ data.label || 'Untitled' }}</p>
            </div>
          </div>
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { VueFlow, Handle, Position, MarkerType, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Edge, Node } from '@vue-flow/core'
import type { PainPoint, Why, Solution, Priority } from '@/types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const COL_X = { what: 40, why: 380, how: 720 }
const ROW_GAP = 130

const props = defineProps<{
  painPoints: PainPoint[]
  whys: Why[]
  solutions: Solution[]
}>()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const { fitView, onPaneReady } = useVueFlow({ id: 'what-why-how' })

const isEmpty = computed(
  () => props.painPoints.length === 0 && props.whys.length === 0 && props.solutions.length === 0,
)

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  markerEnd: MarkerType.ArrowClosed,
}

function buildGraph() {
  const nextNodes: Node[] = []
  const nextEdges: Edge[] = []

  props.painPoints.forEach((pp, i) => {
    nextNodes.push({
      id: `pp-${pp.id}`,
      type: 'what',
      position: { x: COL_X.what, y: i * ROW_GAP },
      data: { label: pp.description, priority: pp.priority },
      draggable: true,
    })
  })

  props.whys.forEach((why, i) => {
    nextNodes.push({
      id: `why-${why.id}`,
      type: 'why',
      position: { x: COL_X.why, y: i * ROW_GAP },
      data: { label: why.description },
      draggable: true,
    })
  })

  props.solutions.forEach((sol, i) => {
    nextNodes.push({
      id: `sol-${sol.id}`,
      type: 'how',
      position: { x: COL_X.how, y: i * ROW_GAP },
      data: { label: sol.description },
      draggable: true,
    })
  })

  const whyIds = new Set(props.whys.map((w) => w.id))
  const solutionIds = new Set(props.solutions.map((s) => s.id))

  props.painPoints.forEach((pp) => {
    if (pp.whyId && whyIds.has(pp.whyId)) {
      nextEdges.push({
        id: `pp-${pp.id}-why-${pp.whyId}`,
        source: `pp-${pp.id}`,
        target: `why-${pp.whyId}`,
      })
    }

    if (pp.solutionId && solutionIds.has(pp.solutionId)) {
      if (pp.whyId && whyIds.has(pp.whyId)) {
        nextEdges.push({
          id: `why-${pp.whyId}-sol-${pp.solutionId}-${pp.id}`,
          source: `why-${pp.whyId}`,
          target: `sol-${pp.solutionId}`,
        })
      } else {
        nextEdges.push({
          id: `pp-${pp.id}-sol-${pp.solutionId}`,
          source: `pp-${pp.id}`,
          target: `sol-${pp.solutionId}`,
          style: { stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '6 4' },
        })
      }
    }
  })

  nodes.value = nextNodes
  edges.value = nextEdges
}

watch(
  () => [props.painPoints, props.whys, props.solutions],
  () => {
    buildGraph()
    nextTick(() => fitView({ padding: 0.2 }))
  },
  { immediate: true, deep: true },
)

onPaneReady(() => {
  fitView({ padding: 0.2 })
})

function onFitView() {
  fitView({ padding: 0.2, duration: 300 })
}

function minimapColor(node: Node) {
  if (node.type === 'what') return '#fb7185'
  if (node.type === 'why') return '#38bdf8'
  return '#34d399'
}

function priorityBorderClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'border-l-rose-400 border border-rose-200/60',
    medium: 'border-l-amber-400 border border-amber-200/60',
    low: 'border-l-emerald-400 border border-emerald-200/60',
  }
  return map[priority]
}

function priorityDotClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'bg-rose-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
  }
  return map[priority]
}

function priorityPillClass(priority: Priority) {
  const map: Record<Priority, string> = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700',
  }
  return map[priority]
}
</script>

<style>
.graph-canvas {
  width: 100%;
  height: 100%;
  background: transparent;
}

.vue-flow__node-what,
.vue-flow__node-why,
.vue-flow__node-how {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  width: 240px;
  text-align: left;
}

.graph-handle {
  width: 8px;
  height: 8px;
  border: 2px solid white;
}

.graph-handle-rose {
  background: #fb7185;
}

.graph-handle-sky {
  background: #38bdf8;
}

.graph-handle-emerald {
  background: #34d399;
}

.vue-flow__controls {
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.08);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.vue-flow__minimap {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.08);
}
</style>
