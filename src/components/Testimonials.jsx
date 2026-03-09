// src/components/Testimonials.jsx
import useReveal from '../hooks/useReveal'

const REVIEWS = [
  { n: 'Rajesh Patel',   r: 'Restaurant Owner',       t: 'CodeNest Dev built our restaurant website in just 4 days. Online orders jumped 60% in the first month. Excellent work!', av: 'RP', s: 5 },
  { n: 'Priya Sharma',   r: 'Coaching Director',       t: 'They built our coaching website beautifully. Students easily find schedules and contact us. Highly recommended!',          av: 'PS', s: 5 },
  { n: 'Arjun Mehta',    r: 'Startup Founder',         t: 'The premium package was worth every rupee. Custom design, fast loading, and the client dashboard is brilliant.',            av: 'AM', s: 5 },
  { n: 'Kavita Joshi',   r: 'Freelance Designer',      t: 'My portfolio gets so many compliments and consistent client enquiries since it launched. Thank you CodeNest!',              av: 'KJ', s: 5 },
  { n: 'Suresh Kumar',   r: 'Shop Owner',              t: 'Very affordable and professional. My shop now gets customers from the internet too. Best investment for my business!',      av: 'SK', s: 5 },
  { n: 'Deepa Nair',     r: 'School Principal',        t: 'Our school website was done perfectly. Parents love how easy it is to find information. Great team!',                       av: 'DN', s: 5 },
]

export default function Testimonials() {
  useReveal()
  return (
    <section className="section" id="testimonials">
      <div className="section-header">
        <div className="section-tag reveal">Testimonials</div>
        <h2 className="section-title reveal">What Our <span className="grad-text">Clients Say</span></h2>
        <p className="section-sub reveal">Real feedback from real clients who trusted us with their web presence.</p>
      </div>
      <div className="testi-grid">
        {REVIEWS.map((t, i) => (
          <div key={i} className="card card-hover testi-card reveal" style={{ transitionDelay: `${i * 0.09}s` }}>
            <div className="testi-quote">"</div>
            <div className="testi-stars">{'★'.repeat(t.s)}</div>
            <p className="testi-text">"{t.t}"</p>
            <div className="testi-author">
              <div className="testi-av">{t.av}</div>
              <div>
                <div className="testi-name">{t.n}</div>
                <div className="testi-role">{t.r}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
