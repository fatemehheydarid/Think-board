import { useEffect, useState, type FormEvent } from "react";
import { useNotes } from "../context/useNotes";
import { getApiErrorMessage } from "../services/notesApi";
import type { Note, NoteInput } from "../types/note";
import { Icon } from "./Icons";

interface NoteFormModalProps {
  note: Note | null;
  onClose: () => void;
  onSaved?: (note: Note) => void;
}

export function NoteFormModal({ note, onClose, onSaved }: NoteFormModalProps) {
  const { create, update, notify } = useNotes();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(note);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: NoteInput = { title: title.trim(), content: content.trim() };
    if (!input.title || !input.content) {
      setError("Title and description cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const saved = note ? await update(note.id, input) : await create(input);
      notify(
        note ? "Your note has been updated." : "Your note has been created.",
      );
      onSaved?.(saved);
      onClose();
    } catch (saveError) {
      const message = getApiErrorMessage(saveError);
      setError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        className="note-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-form-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="note-form-title">
              {editing ? "Edit note" : "Create a note"}
            </h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="note-title">
            Title
          </label>
          <input
            id="note-title"
            className="text-field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your note a title"
            maxLength={120}
            required
            autoFocus
          />
          <div className="field-meta">
            <label className="field-label" htmlFor="note-content">
              Description
            </label>
            <span>{content.length}/10,000</span>
          </div>
          <textarea
            id="note-content"
            className="text-field note-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write down the details..."
            maxLength={10000}
            required
            rows={7}
          />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              className="button button-quiet"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              type="submit"
              disabled={saving}
            >
              {saving && (
                <span className="spinner spinner-small" aria-hidden="true" />
              )}
              {saving ? "Saving..." : editing ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
