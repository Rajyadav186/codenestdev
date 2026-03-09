// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    if (!isHome) {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 200)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const links = [
    { label: 'Services',    id: 'services'    },
    { label: 'Pricing',     id: 'pricing'     },
    { label: 'Portfolio',   id: 'portfolio'   },
    // { label: 'Reviews',     id: 'testimonials'},
    { label: 'Contact',     id: 'contact'     },
  ]

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-brand" onClick={() => navigate('/')}>
          <img src={logo} alt="CodeNest Dev" />
          <span className="nav-brand-name">CodeNest Dev</span>
        </div>

        <div className="nav-links">
          {links.map(l => (
            <a key={l.id} className="nav-link" href={`#${l.id}`}
              onClick={e => { e.preventDefault(); scrollTo(l.id) }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          {user ? (
            <button className="btn btn-primary btn-sm"
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
              {isAdmin ? '⚙️ Admin' : '📊 Dashboard'}
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              Client Login
            </button>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
        </button>
      </nav>

      <nav className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} onClick={e => { e.preventDefault(); scrollTo(l.id) }}>
            {l.label}
          </a>
        ))}
        {user ? (
          <a href="#" onClick={e => { e.preventDefault(); navigate(isAdmin ? '/admin' : '/dashboard'); setMenuOpen(false) }}>
            {isAdmin ? '⚙️ Admin Panel' : '📊 My Dashboard'}
          </a>
        ) : (
          <a href="#" onClick={e => { e.preventDefault(); navigate('/login'); setMenuOpen(false) }}>
            🔐 Client Login
          </a>
        )}
      </nav>
    </>
  )
}
