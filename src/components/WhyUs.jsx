// src/components/WhyUs.jsx
import useReveal from '../hooks/useReveal'

const ITEMS = [
  { i: '⚡', h: 'Fast Delivery',      p: 'Your website live in 3–7 days. We work efficiently without cutting corners on quality.' },
  { i: '📱', h: 'Mobile Responsive',  p: 'Perfect on all devices — phones, tablets, and desktops. Tested on every screen size.' },
  { i: '💰', h: 'Affordable Pricing', p: 'Professional results starting at ₹2,999. Quality doesn\'t have to cost a fortune.' },
  { i: '🔍', h: 'SEO Friendly',       p: 'Built with SEO best practices so your site ranks well on Google searches.' },
  { i: '🎨', h: 'Custom Design',      p: 'Zero templates. Every website is uniquely designed to match your brand identity.' },
  { i: '🛡️', h: 'Reliable Support',   p: 'Quick support via WhatsApp. We\'re always here when you need us.' },
  { i: '🚀', h: 'High Performance',   p: 'Optimised for speed — 90+ PageSpeed scores for better user experience.' },
  { i: '🔄', h: 'Real-time Progress', p: 'Client dashboard shows live project progress with instant admin sync.' },
]

export default function WhyUs() {
  useReveal()
  return (
    <section className="section section-alt" id="why-us">
      <div className="section-header">
        <div className="section-tag reveal">Why Us</div>
        <h2 className="section-title reveal">Why Clients <span className="grad-text">Choose CodeNest</span></h2>
        <p className="section-sub reveal">We blend technical excellence with creative design to deliver exceptional results.</p>
      </div>
      <div className="why-grid">
        {ITEMS.map((w, i) => (
          <div key={i} className="card card-hover why-card reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
            <span className="why-icon" style={{ animationDelay: `${i * 0.35}s` }}>{w.i}</span>
            <h3>{w.h}</h3>
            <p>{w.p}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
