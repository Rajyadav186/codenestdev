// src/components/Portfolio.jsx
import useReveal from '../hooks/useReveal'

const PROJECTS = [
  { tag: 'Coaching',   title: 'S.P Coaching Classes',  desc: 'Coaching site with service pages, team section, and contact forms.', img: './src/assets/Screenshot 2026-03-09 200825.png', link: 'https://spcoachingclass.vercel.app/' },
]

export default function Portfolio() {
  useReveal()
  return (
    <section className="section" id="portfolio">
      <div className="section-header">
        <div className="section-tag reveal">Our Work</div>
        <h2 className="section-title reveal">Recent <span className="grad-text">Projects</span></h2>
        <p className="section-sub reveal">A selection of websites we've crafted for happy clients.</p>
      </div>
      <div className="portfolio-grid">
        {PROJECTS.map((p, i) => (
          <div key={i} className="card port-card card-hover reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="port-img">
              <img src={p.img} alt={p.title} loading="lazy" />
              <div className="port-overlay">
                {p.link
                  ? <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: 'white', color: '#0F172A' }}>View Project →</a>
                  : <button className="btn btn-sm" style={{ background: 'white', color: '#0F172A' }}>View Project →</button>
                }
              </div>
            </div>
            <div className="port-body">
              <div className="port-tag">{p.tag}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
