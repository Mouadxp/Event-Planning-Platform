import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import './AdminVenuesPage.css'

export default function AdminVenuesPage() {
  const navigate = useNavigate()

  // Existing venues list
  const [venues, setVenues] = useState([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [venuesError, setVenuesError] = useState('')

  // Add venue form
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [capacity, setCapacity] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadVenues = useCallback(async () => {
    setVenuesLoading(true)
    setVenuesError('')
    try {
      const data = await api.getVenues()
      setVenues(data)
    } catch {
      setVenuesError('Failed to load venues.')
    } finally {
      setVenuesLoading(false)
    }
  }, [])

  useEffect(() => { loadVenues() }, [loadVenues])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      await api.createVenue({
        name,
        address: address || null,
        capacity: capacity ? Number(capacity) : 0,
      })
      setFormSuccess(`Venue "${name}" created successfully.`)
      setName('')
      setAddress('')
      setCapacity('')
      loadVenues()
    } catch (err) {
      const messages = err.body?.errors
      setFormError(Array.isArray(messages) ? messages.join(' ') : err.message || 'Failed to create venue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-badge">Admin</p>
          <h1 className="admin-title">Manage Venues</h1>
          <p className="admin-subtitle">Add new venues that can be assigned to events.</p>
        </div>
        <button className="admin-back-btn" onClick={() => navigate('/events')}>
          ← Back to Events
        </button>
      </div>

      <div className="admin-layout">
        {/* Add venue form */}
        <section className="admin-card">
          <h2 className="admin-card-title">Add a venue</h2>

          {formError && <div className="admin-alert admin-alert--error">{formError}</div>}
          {formSuccess && <div className="admin-alert admin-alert--success">{formSuccess}</div>}

          <form onSubmit={handleSubmit} className="venue-form">
            <div className="form-group">
              <label htmlFor="name">Venue name <span className="required">*</span></label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grand Hall"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Montreal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                type="number"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 200"
              />
            </div>

            <button type="submit" className="venue-submit-btn" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add venue'}
            </button>
          </form>
        </section>

        {/* Existing venues list */}
        <section className="admin-card">
          <h2 className="admin-card-title">Existing venues</h2>

          {venuesLoading && <p className="admin-state">Loading venues…</p>}
          {venuesError && <p className="admin-state admin-state--error">{venuesError}</p>}

          {!venuesLoading && !venuesError && venues.length === 0 && (
            <p className="admin-state">No venues yet. Add one using the form.</p>
          )}

          {!venuesLoading && venues.length > 0 && (
            <ul className="venue-list">
              {venues.map((v) => (
                <li key={v.id} className="venue-item">
                  <div className="venue-item-name">{v.name}</div>
                  <div className="venue-item-meta">
                    {v.address && <span>📍 {v.address}</span>}
                    {v.capacity > 0 && <span>👥 Capacity: {v.capacity}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
