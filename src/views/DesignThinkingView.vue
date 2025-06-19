<template>
  <div class="design-thinking-container" :class="{ dragging: isDragging }">
    <header class="app-header">
      <h1>Design Thinking - User Research Tool</h1>
      <p>Map user journeys with Thinking, Doing, and Feeling across different phases</p>
    </header>

    <div class="controls">
      <div class="phase-controls">
        <button @click="addPhase" class="btn btn-primary">Add Phase</button>
        <button @click="toggleSidebar" class="btn btn-secondary">Toggle Notepad Sidebar</button>
        <button @click="exportData" class="btn btn-export">Export Data</button>
      </div>
      <div class="instructions">
        <p>
          💡 <strong>How to use:</strong> Drag notepads from the sidebar to any phase column. Drop
          them in the specific row (Thinking 🧠, Doing ✋, or Feeling 💭) where they belong.
        </p>
        <p>
          <small
            >💡 <strong>Tip:</strong> Each row type has its own drop zone. Look for the dashed
            borders and icons to know where to drop!</small
          >
        </p>
      </div>
    </div>

    <div class="journey-map">
      <!-- Phase Headers -->
      <div class="phase-headers">
        <div class="phase-header" v-for="(phase, index) in phases" :key="index">
          <div class="phase-title">
            <input v-model="phase.title" class="phase-input" placeholder="Phase name" />
            <button @click="removePhase(index)" class="remove-btn">×</button>
          </div>
          <!-- Phase-level drop zone that appears during drag -->
          <div class="phase-drop-zone" v-if="isDragging">
            <span>Drop notepad here</span>
          </div>
        </div>
      </div>

      <!-- Journey Rows -->
      <div class="journey-rows">
        <div class="journey-row" v-for="rowType in rowTypes" :key="rowType.key">
          <div class="row-label">
            <div class="row-icon">{{ rowType.icon }}</div>
            <span>{{ rowType.label }}</span>
          </div>

          <div class="row-content">
            <div class="phase-column" v-for="(phase, phaseIndex) in phases" :key="phaseIndex">
              <div class="notepad-container">
                <!-- Draggable notepads for this specific row type -->
                <draggable
                  :list="getPhaseArray(phaseIndex, rowType.key)"
                  group="notepads"
                  class="notepad-list"
                  item-key="id"
                  @start="dragStart"
                  @end="dragEnd"
                  :animation="200"
                  ghost-class="ghost-notepad"
                  chosen-class="chosen-notepad"
                  @add="onNotepadAdded"
                  @change="onNotepadChange"
                  @remove="onNotepadRemove"
                  @update="onNotepadUpdate"
                  :empty-insert-threshold="20"
                  :force-fallback="false"
                >
                  <template #item="{ element: notepad }">
                    <div class="notepad" :class="{ 'is-dragging': isDragging }">
                      <div class="notepad-content">
                        <textarea
                          v-model="notepad.content"
                          class="notepad-textarea"
                          placeholder="Write your note here..."
                          @blur="saveNotepad(notepad)"
                        ></textarea>
                      </div>
                      <div class="notepad-actions">
                        <button
                          @click="removeNotepad(phaseIndex, rowType.key, notepad)"
                          class="remove-notepad-btn"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notepad Sidebar -->
    <div class="notepad-sidebar" :class="{ show: showSidebar }">
      <div class="sidebar-header">
        <h3>Available Notepads</h3>
        <button @click="toggleSidebar" class="close-btn">×</button>
      </div>
      <div class="sidebar-content">
        <div class="sidebar-controls">
          <button @click="addNewNotepad" class="btn btn-primary">Add New Notepad</button>
        </div>
        <draggable
          :list="availableNotepads"
          group="notepads"
          class="sidebar-notepad-list"
          item-key="id"
          :animation="200"
          ghost-class="ghost-notepad"
          chosen-class="chosen-notepad"
          :empty-insert-threshold="20"
          :force-fallback="false"
        >
          <template #item="{ element: notepad }">
            <div class="sidebar-notepad">
              <div class="notepad-preview">
                <div class="notepad-preview-content">{{ notepad.content || 'Empty notepad' }}</div>
                <div class="notepad-preview-actions">
                  <button @click="editNotepadInSidebar(notepad)" class="edit-btn">✏️</button>
                  <button @click="removeNotepadFromSidebar(notepad)" class="remove-btn-small">
                    ×
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" v-if="showEditModal" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Notepad</h3>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <textarea
            v-model="editingNotepadContent"
            class="modal-textarea"
            placeholder="Write your note here..."
            rows="6"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveEditModal" class="btn btn-primary">Save</button>
          <button @click="closeEditModal" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import draggable from 'vuedraggable'

interface Notepad {
  id: string
  content: string
  createdAt: Date
}

interface Phase {
  title: string
  thinking: Notepad[]
  doing: Notepad[]
  feeling: Notepad[]
  [key: string]: string | Notepad[]
}

const phases = ref<Phase[]>([])

const rowTypes = [
  { key: 'thinking', label: 'Thinking', icon: '🧠' },
  { key: 'doing', label: 'Doing', icon: '✋' },
  { key: 'feeling', label: 'Feeling', icon: '💭' },
]

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

// Watch for changes in phaseNotepads and sync back to phases
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

// Watch phases for changes to ensure reactivity
watch(
  phases,
  () => {
    console.log('Phases updated:', phases.value)
  },
  { deep: true },
)

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

const dragStart = (event: any) => {
  isDragging.value = true
  console.log('Drag started', event)
  // Add dragging class to body for global styles
  document.body.classList.add('dragging')

  // Prevent text selection during drag
  if (event.originalEvent) {
    event.originalEvent.preventDefault()
  }
}

const dragEnd = (event: any) => {
  isDragging.value = false
  console.log('Drag ended', event)
  // Remove dragging class from body
  document.body.classList.remove('dragging')

  // Force a small delay to ensure drop zones are properly updated
  setTimeout(() => {
    phases.value = [...phases.value]
  }, 50)
}

const saveNotepad = (notepad: Notepad) => {
  // Save notepad content - could be extended to save to localStorage or backend
  console.log('Saving notepad:', notepad)
}

const removeNotepad = (phaseIndex: number, rowType: string, notepad: Notepad) => {
  const phase = phases.value[phaseIndex]
  const row = phase[rowType as keyof Phase] as Notepad[]
  const index = row.findIndex((n) => n.id === notepad.id)
  if (index > -1) {
    row.splice(index, 1)
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
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ibm-design-thinking-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

const onNotepadAdded = (event: any) => {
  console.log('Notepad added:', event)
  console.log('Event details:', {
    added: event.added,
    removed: event.removed,
    moved: event.moved,
  })

  // With vuedraggable groups, notepads are automatically moved between lists
  // No need to manually remove from availableNotepads as it's handled by the group
  if (event.added) {
    console.log('Notepad added to phase:', event.added.element)
    // Force reactivity update to ensure UI updates
    setTimeout(() => {
      phases.value = [...phases.value]
    }, 10)
  }
}

const onNotepadChange = (event: any) => {
  console.log('Notepad change event:', event)
  console.log('Event details:', {
    added: event.added,
    removed: event.removed,
    moved: event.moved,
  })

  // Force reactivity update
  phases.value = [...phases.value]

  // If a notepad was added, ensure it's properly placed
  if (event.added) {
    console.log('Notepad added in change event:', event.added)
  }
}

const onNotepadRemove = (event: any) => {
  console.log('Notepad removed:', event)
}

const onNotepadUpdate = (event: any) => {
  console.log('Notepad updated:', event)
}

const getNotepadArray = (phase: Phase, rowType: string) => {
  return phase[rowType as keyof Phase] as Notepad[]
}

const updateNotepadArray = (phaseIndex: number, rowType: string, value: Notepad[]) => {
  const phase = phases.value[phaseIndex]
  console.log(`Updating ${rowType} for phase ${phaseIndex}:`, value.length, 'notepads')
  if (rowType === 'thinking') {
    phase.thinking = value
  } else if (rowType === 'doing') {
    phase.doing = value
  } else if (rowType === 'feeling') {
    phase.feeling = value
  }
  console.log('Updated phase:', phase)
}

const getPhaseArray = (phaseIndex: number, rowType: string) => {
  const result = getNotepadArray(phases.value[phaseIndex], rowType)
  console.log(`Getting ${rowType} for phase ${phaseIndex}:`, result.length, 'notepads')
  return result
}

onMounted(() => {
  // Initialize with some sample data
  const sampleNotepads: Notepad[] = [
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
  availableNotepads.value = sampleNotepads
})
</script>

<style scoped>
.design-thinking-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  padding: 40px 0;
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.controls {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.phase-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.instructions {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.instructions p {
  margin: 0;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.btn-export {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
}

.btn-export:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.journey-map {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-right: 320px;
  transition: margin-right 0.3s ease;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.journey-map.sidebar-closed {
  margin-right: 20px;
}

.phase-headers {
  display: flex;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e2e8f0;
}

.phase-header {
  flex: 1;
  min-width: 200px;
  padding: 20px;
  border-right: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.phase-header:hover {
  background: rgba(59, 130, 246, 0.05);
}

.phase-header:last-child {
  border-right: none;
}

.phase-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phase-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.phase-input:focus {
  outline: none;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.remove-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  margin-left: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.remove-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.journey-rows {
  display: flex;
  flex-direction: column;
}

.journey-row {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  z-index: 1;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.journey-row:hover {
  background: rgba(59, 130, 246, 0.02);
}

.journey-row:last-child {
  border-bottom: none;
}

.row-label {
  width: 150px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1e293b;
  border-right: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.row-label:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.row-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.row-content {
  display: flex;
  flex: 1;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.phase-column {
  flex: 1;
  min-width: 200px;
  padding: 20px;
  border-right: 1px solid #e2e8f0;
  min-height: 140px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.phase-column:hover {
  background: rgba(59, 130, 246, 0.02);
  z-index: 20;
}

.phase-column:last-child {
  border-right: none;
}

.notepad-container {
  min-height: 100px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px;
  background: rgba(248, 250, 252, 0.5);
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.notepad-container:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  z-index: 50;
}

.notepad-list {
  min-height: 80px;
  position: relative;
  z-index: 10;
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 8px;
}

.notepad-list:empty {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notepad-list:empty::before {
  content: 'Drop notepads here';
  color: #2196f3;
  font-size: 14px;
  font-style: italic;
  opacity: 0.7;
}

.notepad-list:empty:hover {
  border-color: #1976d2;
  background: rgba(33, 150, 243, 0.1);
}

.notepad-list:empty:hover::before {
  opacity: 1;
}

.drop-zone {
  border: 2px dashed #2196f3;
  background: rgba(33, 150, 243, 0.05);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 8px 0;
  transition: all 0.3s ease;
  color: #2196f3;
  font-size: 14px;
  font-style: italic;
  opacity: 0.7;
  position: relative;
  z-index: 10;
}

.drop-zone:hover {
  border-color: #1976d2;
  background: rgba(33, 150, 243, 0.1);
  opacity: 1;
}

.drop-zone.has-notepads {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  opacity: 0.9;
}

.drop-zone-indicator {
  border: 2px dashed #2196f3;
  background: rgba(33, 150, 243, 0.05);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 8px 0;
  transition: all 0.3s ease;
  color: #2196f3;
  font-size: 14px;
  font-style: italic;
  opacity: 0.7;
  position: relative;
  z-index: 10;
}

.drop-zone-indicator:hover {
  border-color: #1976d2;
  background: rgba(33, 150, 243, 0.1);
  opacity: 1;
  transform: scale(1.02);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.drop-zone-icon {
  font-size: 24px;
  opacity: 0.8;
}

.phase-drop-zone {
  background: rgba(33, 150, 243, 0.1);
  border: 2px dashed #2196f3;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  text-align: center;
  color: #2196f3;
  font-size: 14px;
  font-weight: 500;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

.notepad {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: none;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.notepad:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.25);
  z-index: 2;
}

.notepad.is-dragging {
  opacity: 0.6;
  transform: rotate(2deg) scale(1.05);
  z-index: 2;
  pointer-events: none;
}

.ghost-notepad {
  opacity: 0.5;
  transform: rotate(5deg);
  z-index: 1000;
}

.chosen-notepad {
  opacity: 0.8;
  transform: scale(1.05);
  z-index: 1000;
}

.fallback-notepad {
  opacity: 0.8;
  transform: rotate(5deg);
  z-index: 1000;
  pointer-events: none;
}

.notepad-content {
  margin-bottom: 12px;
}

.notepad-textarea {
  width: 100%;
  min-height: 60px;
  border: none;
  background: transparent;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: #1e293b;
  font-weight: 500;
}

.notepad-textarea:focus {
  outline: none;
}

.notepad-textarea::placeholder {
  color: #94a3b8;
  font-style: italic;
}

.notepad-actions {
  display: flex;
  justify-content: flex-end;
}

.remove-notepad-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.remove-notepad-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.notepad-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 320px;
  height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  border-left: 1px solid #e2e8f0;
}

.notepad-sidebar.show {
  transform: translateX(0);
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.sidebar-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.close-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.sidebar-content {
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 80px);
}

.sidebar-controls {
  margin-bottom: 24px;
}

.sidebar-notepad {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: none;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.sidebar-notepad:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.25);
}

.sidebar-notepad:active {
  cursor: grabbing;
}

.notepad-preview-content {
  font-size: 14px;
  line-height: 1.5;
  color: #1e293b;
  margin-bottom: 12px;
  word-wrap: break-word;
  font-weight: 500;
}

.notepad-preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.edit-btn,
.remove-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #64748b;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: scale(1.1);
}

.remove-btn-small:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
}

.modal-content {
  padding: 24px;
}

.modal-textarea {
  width: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #1e293b;
  font-weight: 500;
}

.modal-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-textarea::placeholder {
  color: #94a3b8;
  font-style: italic;
}

.modal-actions {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0 0 20px 20px;
}

@media (max-width: 768px) {
  .design-thinking-container {
    padding: 10px;
  }

  .app-header h1 {
    font-size: 2rem;
  }

  .row-label {
    width: 120px;
    padding: 15px;
  }

  .phase-column {
    min-width: 150px;
    padding: 10px;
  }

  .journey-map {
    margin-right: 20px;
  }

  .notepad-sidebar {
    width: 100%;
  }
}

/* Global styles for drag and drop */
body.dragging .notepad-list {
  z-index: 200 !important;
  border-color: #2196f3 !important;
  background: rgba(33, 150, 243, 0.15) !important;
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.4) !important;
  transform: scale(1.02);
}

body.dragging .phase-drop-zone {
  z-index: 200 !important;
  border-color: #2196f3 !important;
  background: rgba(33, 150, 243, 0.2) !important;
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.4) !important;
}

body.dragging .phase-column {
  z-index: 150 !important;
}

body.dragging .journey-map {
  z-index: 200 !important;
}

body.dragging .notepad-sidebar {
  z-index: 50 !important;
}

/* Touch and drag improvements */
.notepad-list {
  min-height: 80px;
  position: relative;
  z-index: 10;
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 8px;
}

.notepad-list:empty {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notepad-list:empty::before {
  content: 'Drop notepads here';
  color: #2196f3;
  font-size: 14px;
  font-style: italic;
  opacity: 0.7;
}

.notepad-list:empty:hover {
  border-color: #1976d2;
  background: rgba(33, 150, 243, 0.1);
}

.notepad-list:empty:hover::before {
  opacity: 1;
}

.ghost-notepad {
  opacity: 0.5;
  transform: rotate(5deg);
  z-index: 1000;
}

.chosen-notepad {
  opacity: 0.8;
  transform: scale(1.05);
  z-index: 1000;
}

.phase-drop-zone {
  background: rgba(33, 150, 243, 0.1);
  border: 2px dashed #2196f3;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  text-align: center;
  color: #2196f3;
  font-size: 14px;
  font-weight: 500;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

/* Ensure notepads are draggable on touch devices */
.sidebar-notepad-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 20px;
}

.sidebar-notepad {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: none;
}

.sidebar-notepad:active {
  cursor: grabbing;
}

.notepad {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: none;
}

.notepad:active {
  cursor: grabbing;
}

/* Prevent text selection during drag */
.design-thinking-container.dragging * {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
</style>
