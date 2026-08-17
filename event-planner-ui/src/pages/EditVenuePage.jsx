import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../components/AuthProvider'
import './AdminVenuesPage.css'

export default function EditVenuePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [capacity, setCapacity] = useState('')

  const [venueLoading, setVenueLoading] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getVenue(id)
      .then((venueData) => {
        setName(venueData.name)
        setAddress(venueData.address || '')
        setCapacity(venueData.capacity?.toString() || '')

        // Check if user can edit this venue
        if (!user?.isAdmin && venueData.createdBy !== user?.email) {
          setError('You do not have permission to edit this venue.')
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load venue data.')
      })
      .finally(() => {
        setVenueLoading(false)
      })
  }, [id, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.updateVenue(id, {
        id: Number(id),
        name,
        address: address || null,
        capacity: capacity ? Number(capacity) : 0,
      })
      navigate('/admin/venues')
    } catch (err) {
      const messages = err.body?.errors
      setError(Array.isArray(messages) ? messages.join(' ') : err.message || 'Failed to update venue.')
    } finally {
      setLoading(false)
    }
  }

  if (venueLoading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="admin-header">
            <h1 className="admin-title">Loading venue…</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="admin-header">
            <h1 className="admin-title">Error</h1>
          </div>
          <div className="admin-alert admin-alert--error">{error}</div>
          <button
            type="button"
            className="venue-submit-btn"
            onClick={() => navigate('/admin/venues')}
          >
            Back to Venues
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Edit Venue</h1>
          <p className="admin-subtitle">Update venue details.</p>
        </div>
      </div>

      <div className="admin-layout">
        <section className="admin-card">
          <h2 className="admin-card-title">Edit venue</h2>

          {error && <div className="admin-alert admin-alert--error">{error}</div>}

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

            <div className="create-event-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/admin/venues')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="venue-submit-btn"
                disabled={loading}
              >
                {loading ? 'Updating…' : 'Update venue'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
