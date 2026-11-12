import { createContext } from 'react'
import type { Note, NoteInput } from '../types/note'

export interface NotesContextValue {
  notes: Note[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  create: (input: NoteInput) => Promise<Note>
  update: (id: string, input: NoteInput) => Promise<Note>
  remove: (id: string) => Promise<void>
  notify: (message: string, type?: 'success' | 'error') => void
}

export const NotesContext = createContext<NotesContextValue | null>(null)
