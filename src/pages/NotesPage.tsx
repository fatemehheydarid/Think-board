import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Icon } from '../components/Icons'
import { NoteCard } from '../components/NoteCard'
import { NoteFormModal } from '../components/NoteFormModal'
import { useNotes } from '../context/useNotes'
import { getApiErrorMessage } from '../services/notesApi'
import type { Note } from '../types/note'

type SortOrder = 'updated' | 'created' | 'title'

export function NotesPage() {
  const { notes, loading, error, reload, remove, notify } = useNotes()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('updated')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return notes
      .filter(
        (note) =>
          note.title.toLocaleLowerCase().includes(query) ||
          note.content.toLocaleLowerCase().includes(query),
      )
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title)
        const dateField = sort === 'created' ? 'createdAt' : 'updatedAt'
        return new Date(b[dateField]).getTime() - new Date(a[dateField]).getTime()
      })
  }, [notes, search, sort])

  function openCreateForm() {
    setEditingNote(null)
    setFormOpen(true)
  }

  function openEditForm(note: Note) {
    setEditingNote(note)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingNote) return
    setDeleting(true)
    try {
      await remove(deletingNote.id)
      notify('Note deleted.')
      setDeletingNote(null)
    } catch (deleteError) {
      notify(getApiErrorMessage(deleteError), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <h1>Think board</h1>
        </div>
        <button className="button button-primary add-note-button" type="button" onClick={openCreateForm}>
          <Icon name="plus" />
          <span>New note</span>
        </button>
      </section>

      <section className="notes-section" aria-labelledby="notes-heading">
        <div className="section-heading">
          <h2 id="notes-heading">Your notes <span className="note-count">{notes.length}</span></h2>
          <div className="list-controls">
            <label className="search-control">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Search notes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search notes"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                  <Icon name="close" />
                </button>
              )}
            </label>
            <label className="sort-control">
              <select
                aria-label="Sort notes"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOrder)}
              >
                <option value="updated">Recently updated</option>
                <option value="created">Recently created</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="notes-grid" aria-label="Loading notes" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="note-skeleton" key={index}>
                <span /><span /><span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="state-card error-state" role="alert">
            <div className="state-icon">!</div>
            <h3>We couldn’t load your notes</h3>
            <p>{error}</p>
            <button className="button button-secondary" type="button" onClick={() => void reload().catch(() => undefined)}>
              Try again
            </button>
          </div>
        ) : visibleNotes.length ? (
          <div className="notes-grid">
            {visibleNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onEdit={openEditForm}
                onDelete={setDeletingNote}
              />
            ))}
          </div>
        ) : (
          <div className="state-card empty-state">
            <div className="empty-note-icon"><Icon name="note" /></div>
            <h3>{search ? 'No notes found' : 'Your board is a blank page'}</h3>
            {!search && (
              <>
                <p>Catch that thought before it floats away. Your first note is one click away.</p>
                <button className="button button-primary" type="button" onClick={openCreateForm}>
                  <Icon name="plus" /> Create your first note
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {formOpen && (
        <NoteFormModal
          note={editingNote}
          onClose={() => setFormOpen(false)}
        />
      )}
      {deletingNote && (
        <ConfirmDialog
          title="Delete this note?"
          description={`“${deletingNote.title}” will be permanently removed. This can’t be undone.`}
          busy={deleting}
          onCancel={() => setDeletingNote(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  )
}
