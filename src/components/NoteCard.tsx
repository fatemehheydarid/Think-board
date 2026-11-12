import { Link } from 'react-router'
import type { Note } from '../types/note'
import { Icon } from './Icons'

interface NoteCardProps {
  note: Note
  index: number
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

const colors = ['lavender', 'mint', 'peach', 'blue', 'rose']

export function NoteCard({ note, index, onEdit, onDelete }: NoteCardProps) {
  const color = colors[index % colors.length]

  return (
    <article className={`note-card note-${color}`}>
      <Link to={`/notes/${note.id}`} className="note-card-link" aria-label={`Open ${note.title}`}>
        <h2>{note.title}</h2>
        <p>{note.content}</p>
      </Link>
      <div className="note-card-actions">
        <button
          className="card-action"
          type="button"
          onClick={() => onEdit(note)}
          aria-label={`Edit ${note.title}`}
          title="Edit note"
        >
          <Icon name="edit" />
        </button>
        <button
          className="card-action card-action-delete"
          type="button"
          onClick={() => onDelete(note)}
          aria-label={`Delete ${note.title}`}
          title="Delete note"
        >
          <Icon name="trash" />
        </button>
      </div>
    </article>
  )
}
