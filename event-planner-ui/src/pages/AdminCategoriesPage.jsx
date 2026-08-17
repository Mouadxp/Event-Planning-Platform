import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import './AdminVenuesPage.css'

export default function AdminCategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try
    {
      const data = await api.getCategories()
      setCategories(data)
    }
    catch (err)
    {
      setError(err.message || 'Failed to load categories.')
    }
    finally
    {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.createCategory({ name })
      setSuccess(`Category "${name}" created successfully.`)
      setName('')
      await loadCategories()
    } catch (err) {
      const messages = err.body?.errors
      setError(Array.isArray(messages) ? messages.join(' ') : err.message || 'Failed to create category.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRename(category) {
    setError('')
    setSuccess('')
    try {
      await api.updateCategory(category.id, { id: category.id, name: editingName })
      setSuccess(`Category "${category.name}" updated successfully.`)
      setEditingId(null)
      setEditingName('')
      await loadCategories()
    } catch (err) {
      const messages = err.body?.errors
      setError(Array.isArray(messages) ? messages.join(' ') : err.message || 'Failed to update category.')
    }
  }

  async function handleDelete(category) {
    setError('')
    setSuccess('')
    try {
      await api.deleteCategory(category.id)
      setSuccess(`Category "${category.name}" deleted successfully.`)
      await loadCategories()
    } catch (err) {
      setError(err.message || 'Failed to delete category.')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">

        <div>
          <p className="admin-badge">Admin</p>
          <h1 className="admin-title">Manage Categories</h1>
          <p className="admin-subtitle">Control the category list available when creating events.</p>
        </div>
        
      </div>

      <div className="admin-layout">
        <section className="admin-card">
          <h2 className="admin-card-title">Add a category</h2>

          {error && <div className="admin-alert admin-alert--error">{error}</div>}
          {success && <div className="admin-alert admin-alert--success">{success}</div>}

          <form onSubmit={handleSubmit} className="venue-form">
            <div className="form-group">
              <label htmlFor="category-name">Category name <span className="required">*</span></label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Networking"
                required
              />
            </div>

            <button type="submit" className="venue-submit-btn" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add category'}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h2 className="admin-card-title">Existing categories</h2>

          {loading && <p className="admin-state">Loading categories…</p>}
          {!loading && categories.length === 0 && <p className="admin-state">No categories yet. Add one using the form.</p>}

          {!loading && categories.length > 0 && (
            <ul className="venue-list">
              {categories.map((category) => (
                <li key={category.id} className="venue-item">
                  {editingId === category.id ? (
                    <div className="venue-form">
                      <div className="form-group">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      </div>
                      <div className="category-actions">
                        <button type="button" className="venue-submit-btn" onClick={() => handleRename(category)}>
                          Save
                        </button>
                        <button type="button" className="admin-back-btn" onClick={() => { setEditingId(null); setEditingName('') }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="venue-item-name">{category.name}</div>
                      <div className="venue-actions">
                        <button
                          type="button"
                          className="venue-edit-btn"
                          onClick={() => { setEditingId(category.id); setEditingName(category.name) }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="venue-delete-btn"
                          onClick={() => handleDelete(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
