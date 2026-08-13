import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../components/AuthProvider'
import RsvpModal from '../components/RsvpModal'
import './EventsPage.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [evts, atts] = await Promise.all([api.getEvents(), api.getAttendees()])
      setEvents(evts)
      setAttendees(atts)
    } catch (err) {
      setError(err.message || 'Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Find the current user's RSVP for a given event (matched by email)
  function myRsvp(eventId) {
    return attendees.find(
      (a) => a.eventId === eventId && a.email?.toLowerCase() === user?.email?.toLowerCase()
    )
  }

  function rsvpLabel(eventId) {
    const rsvp = myRsvp(eventId)
    if (!rsvp) return null
    return rsvp.isAttending ? 'Attending ✓' : 'Not attending'
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h1 className="events-title">Upcoming Events</h1>
          <p className="events-subtitle">Browse events and let us know if you&apos;ll be there.</p>
        </div>
        <Link to="/events/create" className="events-create-btn">+ Create event</Link>
      </div>

      {loading && <div className="events-state">Loading events…</div>}
      {error && <div className="events-state events-error">{error}</div>}

      {!loading && !error && events.length === 0 && (
        <div className="events-state">No events scheduled yet.</div>
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="events-grid">
          {events.map((event) => {
            const label = rsvpLabel(event.id)
            return (
              <li key={event.id} className="event-card">
                <div className="event-card-body">
                  <h2 className="event-name">{event.title}</h2>
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                  <div className="event-meta">
                    <div className="event-meta-row">
                      <span className="event-meta-icon">📅</span>
                      <span>{formatDate(event.start)}{event.end ? ` – ${formatDate(event.end)}` : ''}</span>
                    </div>
                    {event.venue && (
                      <div className="event-meta-row">
                        <span className="event-meta-icon">📍</span>
                        <span>{event.venue.name}{event.venue.address ? `, ${event.venue.address}` : ''}</span>
                      </div>
                    )}
                    {event.venue?.capacity && (
                      <div className="event-meta-row">
                        <span className="event-meta-icon">👥</span>
                        <span>Capacity: {event.venue.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="event-card-footer">
                  {label && (
                    <span className={`rsvp-badge ${myRsvp(event.id)?.isAttending ? 'rsvp-badge--yes' : 'rsvp-badge--no'}`}>
                      {label}
                    </span>
                  )}
                  <button
                    className="rsvp-btn"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {myRsvp(event.id) ? 'Update RSVP' : 'RSVP'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {selectedEvent && (
        <RsvpModal
          event={selectedEvent}
          existingRsvp={myRsvp(selectedEvent.id)}
          userEmail={user?.email ?? ''}
          onClose={() => setSelectedEvent(null)}
          onSuccess={() => { setSelectedEvent(null); load() }}
        />
      )}
    </div>
  )
}
