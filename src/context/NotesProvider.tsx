import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getApiErrorMessage } from '../services/notesApi'
import {
  createNote as createNoteRequest,
  deleteNote as deleteNoteRequest,
  fetchNotes,
  updateNote as updateNoteRequest,
} from '../services/notesApi'
import type { Note, NoteInput } from '../types/note'
import { NotesContext } from './notesContext'

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
    id: number
  } | null>(null)

  const loadNotes = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setLoading(true)
      setError(null)
    }

    try {
      setNotes(await fetchNotes())
      setError(null)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
      throw loadError
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = useCallback(() => loadNotes(true), [loadNotes])

  useEffect(() => {
    // Load server data once on mount; subsequent state updates happen after the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotes(false).catch(() => undefined)
  }, [loadNotes])

  const notify = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type, id: Date.now() })
    },
    [],
  )

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const create = useCallback(async (input: NoteInput) => {
    const created = await createNoteRequest(input)
    setNotes((current) => [created, ...current])
    return created
  }, [])

  const update = useCallback(async (id: string, input: NoteInput) => {
    const updated = await updateNoteRequest(id, input)
    setNotes((current) =>
      current.map((note) => (note.id === id ? updated : note)),
    )
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteNoteRequest(id)
    setNotes((current) => current.filter((note) => note.id !== id))
  }, [])

  const value = useMemo(
    () => ({ notes, loading, error, reload, create, update, remove, notify }),
    [notes, loading, error, reload, create, update, remove, notify],
  )

  return (
    <NotesContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`toast-message toast-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          key={toast.id}
        >
          <span className="toast-mark" aria-hidden="true">
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          {toast.message}
        </div>
      )}
    </NotesContext.Provider>
  )
}
