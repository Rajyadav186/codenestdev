// src/components/Footer.jsx
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '917572873450'
const INSTAGRAM = import.meta.env.VITE_INSTAGRAM_URL  || 'https://www.instagram.com/0o_raj/'
const EMAIL     = import.meta.env.VITE_CONTACT_EMAIL  || 'rajy41008@gmail.com'

export default function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            <img src={logo} alt="CodeNest Dev" />
            <span>CodeNest Dev</span>
          </div>
          <p className="footer-desc">
            Smart Web Development agency crafting modern, fast, and affordable
            websites for businesses of all sizes across India.
          </p>
          <div className="footer-socials">
            <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="social-btn" title="Instagram">📸</a>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="social-btn" title="WhatsApp">💬</a>
            <a href="https://www.linkedin.com/in/raj-yadav-8849462a3/" target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn">💼</a>
            <a href={`mailto:${EMAIL}`} className="social-btn" title="Email">📧</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul className="footer-links">
            {['Business Websites','Coaching Websites','Portfolio Sites','Website Maintenance'].map(l => (
              <li key={l}><a href="#services" onClick={e => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) }}>{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul className="footer-links">
            <li><a href="#home">About Us</a></li>
            <li><a href="#portfolio">Our Work</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Client</h4>
          <ul className="footer-links">
            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/login') }}>Login / Sign Up</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/dashboard') }}>Dashboard</a></li>
            <li><a href="#testimonials">Reviews</a></li>
            <li><a href="#contact">Get Quote</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} CodeNest Dev · All rights reserved.</p>
        <p>Made with ❤️ in India 🇮🇳</p>
      </div>
    </footer>
  )
}
