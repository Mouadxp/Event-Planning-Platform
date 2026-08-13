import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { useState } from 'react'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import AdminVenuesPage from './pages/AdminVenuesPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import './App.css'

function LandingPage() {
  const [user, setUser] = useState(() => localStorage.getItem('token') ? true : false)
  return (
    <section className="landing-page">
      <p className="badge">Event Planning Platform</p>
      <h1>Create, discover, and manage events in your local area</h1>
      <p className="lead">
        Built around your backend resources: <strong>Events</strong>, <strong>Venues</strong>, and <strong>Attendees</strong>.
      </p>

      <div className="cta-group" >
        {user && <Link to="/events" className="btn btn-primary">View Events</Link>}
        {!user && 
        <>
        <Link to="/register" className="btn btn-primary">Get Started</Link>
        <Link to="/login" className="btn btn-secondary">Login</Link>
        </>
        }
        
      </div>

    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/admin/venues" element={<AdminVenuesPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
