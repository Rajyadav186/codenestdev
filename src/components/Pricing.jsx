// src/components/Pricing.jsx
import useReveal from '../hooks/useReveal'

const PLANS = [
  {
    tier: 'Plan 01', name: 'Basic Website', range: '₹2,999 – ₹3,999',
    for: 'Small shops, tuition classes, local businesses',
    features: ['3 pages (Home, About, Contact)', 'Mobile responsive design', 'Contact form', 'WhatsApp button', 'Basic clean design', '3–5 day delivery'],
    featured: false,
  },
  {
    tier: 'Plan 02', name: 'Business Website', range: '₹5,999 – ₹7,999',
    for: 'Coaching institutes, startups, growing businesses',
    features: ['5–7 pages with modern UI', 'Animations & transitions', 'Inquiry form integration', 'WhatsApp integration', 'SEO basic setup', '5–7 day delivery'],
    featured: true,
  },
  {
    tier: 'Plan 03', name: 'Premium Website', range: '₹10,000 – ₹15,000',
    for: 'Companies, big coaching institutes',
    features: ['Custom design & branding', 'Admin dashboard included', 'Advanced animations', 'SEO fully optimised', 'High performance', 'Priority support'],
    featured: false,
  },
]

const EXTRAS = [
  { name: 'Domain Setup',         price: '₹500'     },
  { name: 'Hosting Setup',        price: '₹1,000'   },
  { name: 'Monthly Maintenance',  price: '₹1,000/mo'},
  { name: 'Website Redesign',     price: '₹3,000+'  },
]

export default function Pricing() {
  useReveal()
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="section section-alt" id="pricing">
      <div className="section-header">
        <div className="section-tag reveal">Pricing</div>
        <h2 className="section-title reveal">Transparent <span className="grad-text">Pricing Plans</span></h2>
        <p className="section-sub reveal">Affordable web development packages for every stage of your business.</p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((p, i) => (
          <div key={i} className={`card card-hover pricing-card reveal${p.featured ? ' featured' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
            {p.featured && <div className="popular-chip">⭐ Most Popular</div>}
            <div className="plan-tier">{p.tier}</div>
            <div className="plan-name">{p.name}</div>
            <div className="plan-range">{p.range}</div>
            <div className="plan-for">Best for: {p.for}</div>
            <ul className="plan-features">
              {p.features.map((f, j) => <li key={j}>{f}</li>)}
            </ul>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={scrollToContact}>
              Get Started →
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <p className="reveal" style={{ textAlign: 'center', color: '#60A5FA', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
          💡 Extra Services
        </p>
        <div className="extras-grid">
          {EXTRAS.map((e, i) => (
            <div key={i} className="extra-chip reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
              <span className="name">{e.name}</span>
              <span className="price">{e.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
