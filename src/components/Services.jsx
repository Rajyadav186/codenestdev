// src/components/Services.jsx
import useReveal from '../hooks/useReveal'

const SERVICES = [
  { icon: '🏪', title: 'Business Website Development', desc: 'Professional websites for shops, restaurants, and local businesses. Custom design, fast loading, mobile-friendly.' },
  { icon: '🎓', title: 'Coaching / School Websites',   desc: 'Feature-rich sites for coaching institutes and schools with admission forms, galleries, and timetables.' },
  { icon: '💼', title: 'Portfolio Websites',           desc: 'Stunning portfolios for freelancers and creatives that showcase work and attract high-quality clients.' },
  { icon: '🔧', title: 'Website Maintenance',          desc: 'Regular updates, security patches, bug fixes, and performance tuning — so your site always runs at its best.' },
]

export default function Services() {
  useReveal()
  return (
    <section className="section" id="services">
      <div className="section-header">
        <div className="section-tag reveal">Our Services</div>
        <h2 className="section-title reveal">What We <span className="grad-text">Build For You</span></h2>
        <p className="section-sub reveal">End-to-end web development tailored to your business needs and budget.</p>
      </div>
      <div className="services-grid">
        {SERVICES.map((s, i) => (
          <div key={i} className="card card-hover service-card reveal" style={{ transitionDelay: `${i * 0.09}s` }}>
            <div className="service-icon-wrap">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
