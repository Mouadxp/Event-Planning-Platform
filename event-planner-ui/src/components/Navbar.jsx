import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🗓 Event Planner</Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/events">Events</Link>
            <Link to="/events/create" className="navbar-cta">+ Create event</Link>
            <Link to="/admin/venues">Venues</Link>
            {user.isAdmin && <Link to="/admin/categories">Categories</Link>}
            <span className="navbar-user">{user.email}</span>
            <button className="navbar-logout" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="navbar-cta">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
