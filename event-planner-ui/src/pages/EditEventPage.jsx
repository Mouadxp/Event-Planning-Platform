import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../components/AuthProvider'
import './CreateEventPage.css'

export default function EditEventPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [venueId, setVenueId] = useState('')

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [venues, setVenues] = useState([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [eventLoading, setEventLoading] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getVenues(), api.getEvent(id)])
      .then(([categoryData, venueData, eventData]) => {
        setCategories(categoryData)
        setVenues(venueData)
        setTitle(eventData.title)
        setCategory(eventData.category || '')
        setDescription(eventData.description || '')
        setStart(eventData.start ? eventData.start.split('T')[0] : '')
        setEnd(eventData.end ? eventData.end.split('T')[0] : '')
        setVenueId(eventData.venueId?.toString() || '')

        // Check if user can edit this event
        if (!user?.isAdmin && eventData.createdBy !== user?.email) {
          setError('You do not have permission to edit this event.')
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load event data.')
      })
      .finally(() => {
        setCategoriesLoading(false)
        setVenuesLoading(false)
        setEventLoading(false)
      })
  }, [id, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (end && start && end < start) {
      setError('End date/time must be after the start date/time.')
      return
    }

    setLoading(true)
    try {
      const toISO = (dateStr) => new Date(`${dateStr}T00:00:00`).toISOString()
      await api.updateEvent(id, {
        id: Number(id),
        title,
        category,
        description,
        start: toISO(start),
        end: end ? toISO(end) : toISO(start),
        venueId: Number(venueId),
      })
      navigate('/events')
    } catch (err) {
      const messages = err.body?.errors
      setError(Array.isArray(messages) ? messages.join(' ') : err.message || 'Failed to update event.')
    } finally {
      setLoading(false)
    }
  }

  if (eventLoading) {
    return (
      <div className="create-event-page">
        <div className="create-event-card">
          <div className="create-event-header">
            <h1 className="create-event-title">Loading event…</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="create-event-page">
        <div className="create-event-card">
          <div className="create-event-header">
            <h1 className="create-event-title">Error</h1>
          </div>
          <div className="create-event-error">{error}</div>
          <div className="create-event-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/events')}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-event-page">
      <div className="create-event-card">
        <div className="create-event-header">
          <h1 className="create-event-title">Edit event</h1>
          <p className="create-event-subtitle">Update the event details.</p>
        </div>

        {error && <div className="create-event-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="title">Event title <span className="required">*</span></label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Networking Mixer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category <span className="required">*</span></label>
            {categoriesLoading ? (
              <p className="venues-loading">Loading categories…</p>
            ) : (
              <select
                id="category"
              value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell attendees what to expect…"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start">Start <span className="required">*</span></label>
              <input
                id="start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end">End</label>
              <input
                id="end"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue <span className="required">*</span></label>
            {venuesLoading ? (
              <p className="venues-loading">Loading venues…</p>
            ) : (
              <select
                id="venue"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                required
              >
                <option value="" disabled>Select a venue</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}{v.address ? ` — ${v.address}` : ''}{v.capacity ? ` (cap. ${v.capacity})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="create-event-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/events')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || venuesLoading || categoriesLoading}
            >
              {loading ? 'Updating…' : 'Update event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
