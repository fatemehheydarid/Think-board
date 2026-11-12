import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Icon } from '../components/Icons'
import { NoteFormModal } from '../components/NoteFormModal'
import { useNotes } from '../context/useNotes'
import { fetchNote, getApiErrorMessage } from '../services/notesApi'
import type { Note } from '../types/note'

export function NoteDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { remove, notify } = useNotes()
  const [loadedNote, setLoadedNote] = useState<{
    id: string
    note: Note | null
    error: string | null
  }>({ id: '', note: null, error: null })
  const [formOpen, setFormOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    fetchNote(id)
      .then((result) => {
        if (active) setLoadedNote({ id, note: result, error: null })
      })
      .catch((loadError: unknown) => {
        if (active) {
          setLoadedNote({ id, note: null, error: getApiErrorMessage(loadError) })
        }
      })
    return () => {
      active = false
    }
  }, [id])

  const isLoaded = loadedNote.id === id
  const loading = !isLoaded
  const note = isLoaded ? loadedNote.note : null
  const error = isLoaded ? loadedNote.error : null

  async function handleDelete() {
    setDeleting(true)
    try {
      await remove(id)
      notify('Note deleted.')
      navigate('/')
    } catch (deleteError) {
      notify(getApiErrorMessage(deleteError), 'error')
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="detail-loading" aria-label="Loading note" aria-busy="true">
        <div className="note-skeleton detail-skeleton"><span /><span /><span /></div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="state-card error-state detail-error" role="alert">
        <div className="state-icon">!</div>
        <h2>We couldn’t find this note</h2>
        <p>{error ?? 'This note may have been deleted.'}</p>
        <Link className="button button-secondary" to="/">Back to all notes</Link>
      </div>
    )
  }

  return (
    <article className="note-detail">
      <Link className="back-link" to="/">
        <Icon name="arrow" /> All notes
      </Link>
      <div className="detail-actions">
        <button className="button button-secondary" type="button" onClick={() => setFormOpen(true)}>
          <Icon name="edit" /> Edit note
        </button>
        <button className="button button-danger-outline" type="button" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" /> Delete
        </button>
      </div>
      <h1>{note.title}</h1>
      {note.updatedAt !== note.createdAt && (
        <div className="detail-meta">
          <span>Updated {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(note.updatedAt))}</span>
        </div>
      )}
      <div className="detail-divider" />
      <p className="detail-content">{note.content}</p>

      {formOpen && (
        <NoteFormModal
          note={note}
          onClose={() => setFormOpen(false)}
          onSaved={(saved) => setLoadedNote({ id, note: saved, error: null })}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete this note?"
          description={`“${note.title}” will be permanently removed. This can’t be undone.`}
          busy={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </article>
  )
}
