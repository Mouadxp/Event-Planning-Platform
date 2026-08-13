const BASE_URL = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.message || `HTTP ${res.status}`), { status: res.status, body })
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Events
  getEvents: () => request('/events'),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),

  // Venues
  getVenues: () => request('/venues'),
  createVenue: (data) => request('/venues', { method: 'POST', body: JSON.stringify(data) }),

  // Attendees / RSVP
  getAttendees: () => request('/attendees'),
  createAttendee: (data) => request('/attendees', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendee: (id, data) => request(`/attendees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
