// src/components/Hero.jsx
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import logo from '../assets/logo.png'

// Floating particle dots
function Particles() {
  const particles = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left:  Math.random() * 100,
    delay: Math.random() * 14,
    dur:   9 + Math.random() * 10,
    size:  2 + Math.random() * 4,
    color: Math.random() > 0.5 ? '#2563EB' : '#7C3AED',
    opacity: 0.3 + Math.random() * 0.4,
  })), [])

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left:               `${p.left}%`,
          bottom:             '-10px',
          width:              `${p.size}px`,
          height:             `${p.size}px`,
          background:         p.color,
          opacity:            p.opacity,
          animationDelay:     `${p.delay}s`,
          animationDuration:  `${p.dur}s`,
          boxShadow:          `0 0 ${p.size * 2}px ${p.color}`,
        }} />
      ))}
    </div>
  )
}

export default function Hero() {
  const navigate = useNavigate()

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const stats = [
    { n: '50+',   l: 'Projects Done'   },
    { n: '100%',  l: 'Client Happy'    },
    { n: '3 Days',l: 'Avg. Delivery'   },
    { n: '24/7',  l: 'Support'         },
  ]

  return (
    <section className="hero" id="home">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-scan" aria-hidden="true" />
      <Particles />

      {/* Main content */}
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot">🚀</span>
          Smart Web Development Agency· India
        </div>

        <h1 className="hero-h1">
          We Build <span className="grad-text">Modern Websites</span> for Businesses
        </h1>

        <p className="hero-sub">
          From local shops to growing enterprises — we craft blazing-fast, SEO-optimised,
          mobile-first websites that convert visitors into customers.
          Starting at <strong style={{ color: '#60A5FA' }}>₹2,999</strong>.
        </p>

        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
            🚀 Get Your Website
          </button>
          <button className="btn btn-secondary" onClick={() => scrollTo('portfolio')}>
            View Our Work →
          </button>
        </div>

        <div className="hero-stats">
          {stats.map((s, i) => (
            <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hero-stat-num">{s.n}</div>
              <div className="hero-stat-lab">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating orb visual */}
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-orb-wrap">
          {/* Orbit rings */}
          <div className="hero-orb-ring-outer" />
          <div className="hero-orb-ring-mid" />

          {/* Pulse rings */}
          <div className="hero-orb" style={{ position: 'relative' }}>
            <div className="pulse-ring" />
            <div className="pulse-ring" style={{ animationDelay: '1s' }} />
            <div className="pulse-ring" style={{ animationDelay: '2s' }} />
            <div className="hero-orb-glow" />
            <img src={logo} alt="CodeNest Dev Logo" />
          </div>

          {/* Floating tech labels */}
          <div className="tech-badge" style={{ top: '-20px', right: '30px' }}>⚡ React + Vite</div>
          <div className="tech-badge" style={{ bottom: '30px', left: '-20px' }}>🔥 Firebase</div>
          <div className="tech-badge" style={{ top: '50%', right: '-50px', transform: 'translateY(-50%)' }}>📱 Mobile First</div>
        </div>
      </div>
    </section>
  )
}
