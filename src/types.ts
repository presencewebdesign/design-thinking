export interface Notepad {
  id: string
  content: string
  createdAt: Date
}

export interface Phase {
  title: string
  thinking: Notepad[]
  doing: Notepad[]
  feeling: Notepad[]
  [key: string]: string | Notepad[]
}

export interface ImportData {
  phases: Phase[]
  availableNotepads: Notepad[]
  painPoints?: PainPoint[]
  whys?: Why[]
  solutions?: Solution[]
  exportedAt: string
}

export type Priority = 'high' | 'medium' | 'low'

export interface PainPoint {
  id: string
  description: string
  priority: Priority
  whyId: string | null
  solutionId: string | null
  createdAt: Date
}

export interface Why {
  id: string
  description: string
  createdAt: Date
}

export interface Solution {
  id: string
  description: string
  createdAt: Date
}
