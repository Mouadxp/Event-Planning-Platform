import { useState, useEffect } from 'react'
import { api } from '../api/client'
import './RsvpModal.css'

export default function RsvpModal({ event, existingRsvp, userEmail, onClose, onSuccess }) {
  const [name, setName] = useState(existingRsvp?.name ?? '')
  const [email, setEmail] = useState(existingRsvp?.email ?? userEmail)
  const [isAttending, setIsAttending] = useState(existingRsvp?.isAttending ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (existingRsvp) {
        await api.updateAttendee(existingRsvp.id, {
          id: existingRsvp.id,
          name,
          email,
          eventId: event.id,
          isAttending,
        })
      } else {
        await api.createAttendee({ name, email, eventId: event.id, isAttending })
      }
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to save RSVP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Close" onClick={onClose}>✕</button>

        <h2 id="modal-title" className="modal-title">
          {existingRsvp ? 'Update your RSVP' : 'RSVP to event'}
        </h2>
        <p className="modal-event-name">{event.title}</p>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <label htmlFor="rsvp-name">Your name</label>
          <input
            id="rsvp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />

          <label htmlFor="rsvp-email">Email</label>
          <input
            id="rsvp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <fieldset className="rsvp-choice-group">
            <legend>Will you attend?</legend>
            <label className={`rsvp-choice ${isAttending ? 'rsvp-choice--active' : ''}`}>
              <input
                type="radio"
                name="attending"
                checked={isAttending}
                onChange={() => setIsAttending(true)}
              />
              Yes, I&apos;ll be there 🎉
            </label>
            <label className={`rsvp-choice ${!isAttending ? 'rsvp-choice--active' : ''}`}>
              <input
                type="radio"
                name="attending"
                checked={!isAttending}
                onChange={() => setIsAttending(false)}
              />
              No, I can&apos;t make it
            </label>
          </fieldset>

          <div className="modal-actions">
            <button type="button" className="modal-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-primary" disabled={loading}>
              {loading ? 'Saving…' : existingRsvp ? 'Update RSVP' : 'Confirm RSVP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
