import { useEffect } from 'react'
import { Icon } from './Icons'

interface ConfirmDialogProps {
  title: string
  description: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  description,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [busy, onCancel])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="confirm-icon"><Icon name="trash" /></div>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onCancel} disabled={busy}>
            Keep note
          </button>
          <button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : 'Delete note'}
          </button>
        </div>
      </section>
    </div>
  )
}
