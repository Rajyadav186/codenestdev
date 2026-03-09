// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { listenToClientProjects, listenToClientInquiries } from '../firebase/services'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

function formatTs(ts) {
  if (!ts) return '—'
  try { return (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

function getStepStatus(proj, idx) {
  const done = Math.floor((proj.progress / 100) * (proj.steps?.length || 5))
  if (idx < done) return 'done'
  if (idx === done && proj.progress < 100) return 'active'
  return 'pend'
}

function ProjectCard({ proj }) {
  return (
    <div className="card proj-card">
      <div className="proj-header">
        <div>
          <div className="proj-name">{proj.name}</div>
          <div className="proj-client">Started {formatTs(proj.createdAt)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="proj-pct">{proj.progress}%</div>
          <span className={`badge ${proj.progress === 100 ? 'badge-green' : proj.progress > 0 ? 'badge-yellow' : 'badge-blue'}`}>
            {proj.status}
          </span>
        </div>
      </div>
      <div className="prog-bg">
        <div className="prog-fill" style={{ width: `${proj.progress}%` }} />
      </div>
      <div className="steps-row">
        {(proj.steps || ['Requirements', 'Design', 'Development', 'Testing', 'Launch']).map((s, j) => {
          const st = getStepStatus(proj, j)
          return (
            <span key={j} className={`step-pill step-${st}`}>
              <span className={`step-dot d-${st}`} />
              {s}
            </span>
          )
        })}
      </div>
      {proj.adminNote && (
        <div className="proj-note">
          <p><strong>📝 Team Note:</strong> {proj.adminNote}</p>
        </div>
      )}
      {proj.deliverables?.length > 0 && (
        <div style={{ marginTop: '0.8rem' }}>
          <p style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deliverables</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {proj.deliverables.map((d, j) => <span key={j} className="badge badge-cyan">{d}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [tab,       setTab]      = useState('overview')
  const [projects,  setProjects]  = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loadingP,  setLoadingP]  = useState(true)
  const [firestoreError, setFirestoreError] = useState('')

  const WHATSAPP  = import.meta.env.VITE_WHATSAPP_NUMBER || '917572873450'
  const EMAIL     = import.meta.env.VITE_CONTACT_EMAIL   || 'rajy41008@gmail.com'

  // Real-time Firestore listeners
  useEffect(() => {
    if (!user?.email) return
    const emailToQuery = user.email.trim().toLowerCase()
    setFirestoreError('')

    const unsubP = listenToClientProjects(emailToQuery, (data) => {
      setProjects(data)
      setLoadingP(false)
    })

    const unsubI = listenToClientInquiries(emailToQuery, setInquiries)

    return () => { unsubP(); unsubI() }
  }, [user?.email])

  const doLogout = async () => {
    await logout()
    toast.success('Logged out. See you soon! 👋')
    navigate('/')
  }

  const name = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Client'

  const sideItems = [
    { icon: '🏠', label: 'Overview',      id: 'overview'  },
    { icon: '📊', label: 'My Projects',   id: 'projects'  },
    { icon: '📋', label: 'My Inquiries',  id: 'inquiries' },
    { icon: '💬', label: 'Messages',      id: 'messages'  },
    { icon: '👤', label: 'Profile',       id: 'profile'   },
  ]

  return (
    <div className="dash-shell">
      {/* Top bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-brand">
          <img src={logo} alt="CodeNest Dev" />
          <span>CodeNest Dev</span>
        </div>
        <div className="dash-topbar-right">
          <div className="user-chip">
            <div className="user-chip-dot" />
            <span>{name}</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={doLogout}>Logout</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>🌐 Site</button>
        </div>
      </div>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="sidebar-label">Client Portal</div>
          <ul className="sidebar-menu">
            {sideItems.map(s => (
              <li key={s.id} className="sidebar-item">
                <a href="#" className={tab === s.id ? 'active' : ''} onClick={e => { e.preventDefault(); setTab(s.id) }}>
                  <span className="s-icon">{s.icon}</span>{s.label}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto' }}>
            <ul className="sidebar-menu">
              <li className="sidebar-item"><a href="#" onClick={e => { e.preventDefault(); navigate('/') }}><span className="s-icon">🌐</span>Back to Site</a></li>
              <li className="sidebar-item"><a href="#" onClick={e => { e.preventDefault(); doLogout() }}><span className="s-icon">🚪</span>Logout</a></li>
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <main className="dash-main">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>🏠</span>Overview</div>
              <div className="dash-welcome">
                <h2>Welcome back, {name} 👋</h2>
                <p>Track your project progress, view inquiries, and communicate with the team.</p>
              </div>
              <div className="stats-row">
                {[
                  { icon: '📂', num: projects.length,                             lab: 'My Projects'    },
                  { icon: '✅', num: projects.filter(p => p.progress === 100).length, lab: 'Completed'  },
                  { icon: '📋', num: inquiries.length,                            lab: 'Inquiries'      },
                  { icon: '⭐', num: '24/7',                                      lab: 'Support'        },
                ].map((s, i) => (
                  <div key={i} className="card stat-card">
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-lab">{s.lab}</div>
                  </div>
                ))}
              </div>
              {loadingP ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : projects.length > 0 ? (
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text2)' }}>📊 Active Projects</h3>
                  {projects.slice(0, 2).map(p => <ProjectCard key={p.id} proj={p} />)}
                  {projects.length > 2 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('projects')} style={{ marginTop: '0.5rem' }}>
                      View all {projects.length} projects →
                    </button>
                  )}
                </div>
              ) : (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🚀</div>
                  <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>No projects yet. Get started with your website today!</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/#contact')}>Get a Website →</button>
                </div>
              )}
            </div>
          )}

          {/* MY PROJECTS */}
          {tab === 'projects' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>📊</span>My Projects</div>

              {/* Email hint — helps debug assignment mismatches */}
              <div style={{ padding: '0.7rem 1rem', background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 9, marginBottom: '1.2rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
                🔍 Projects assigned to: <strong style={{ color: '#60A5FA' }}>{user?.email?.toLowerCase()}</strong>
                &nbsp;— Admin must use this exact email when assigning.
              </div>

              {loadingP ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : projects.length === 0 ? (
                <div className="card empty-state">
                  <div className="e-icon">📂</div>
                  <p>No projects assigned yet.</p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>Ask admin to assign a project using your email: <strong style={{ color: '#60A5FA' }}>{user?.email?.toLowerCase()}</strong></p>
                </div>
              ) : (
                projects.map(p => <ProjectCard key={p.id} proj={p} />)
              )}
            </div>
          )}

          {/* MY INQUIRIES */}
          {tab === 'inquiries' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>📋</span>My Inquiries</div>
              {inquiries.length === 0 ? (
                <div className="card empty-state">
                  <div className="e-icon">📭</div>
                  <p>No inquiries yet. <a href="#" onClick={e => { e.preventDefault(); navigate('/#contact') }} style={{ color: '#60A5FA' }}>Send one now!</a></p>
                </div>
              ) : inquiries.map((inq, i) => (
                <div key={i} className="card inq-card">
                  <div className="inq-av">{inq.name?.charAt(0) || '?'}</div>
                  <div className="inq-body">
                    <div className="inq-name">{inq.name}</div>
                    <div className="inq-meta">{formatTs(inq.createdAt)} {inq.phone && `· 📞 ${inq.phone}`}</div>
                    <div className="inq-msg">{inq.message}</div>
                  </div>
                  <div className="inq-right">
                    <span className={`badge ${inq.status === 'done' ? 'badge-green' : inq.status === 'review' ? 'badge-yellow' : 'badge-blue'}`}>
                      {inq.status === 'done' ? '✓ Done' : inq.status === 'review' ? '👁 Reviewing' : '🆕 New'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>💬</span>Messages from Team</div>
              {projects.filter(p => p.adminNote).length === 0 ? (
                <div className="card empty-state">
                  <div className="e-icon">📭</div>
                  <p>No messages from the team yet. Check back once your project starts!</p>
                </div>
              ) : projects.filter(p => p.adminNote).map((p, i) => (
                <div key={i} className="card" style={{ padding: '1.2rem', marginBottom: '0.9rem', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text3)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📂 {p.name}</div>
                  <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: '1.55' }}>{p.adminNote}</p>
                </div>
              ))}
              <div className="card" style={{ padding: '1.2rem', marginTop: '1.5rem', background: 'rgba(37,99,235,0.05)' }}>
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                  💬 Direct contact: <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ color: '#25D366' }}>WhatsApp</a> or <a href={`mailto:${EMAIL}`} style={{ color: '#60A5FA' }}>{EMAIL}</a>
                </p>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {tab === 'profile' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>👤</span>My Profile</div>
              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900, flexShrink: 0 }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 900 }}>{name}</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.88rem', margin: '3px 0' }}>{user?.email}</div>
                    <span className="badge badge-green">✓ Verified Client</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '1rem' }}>
                  {[
                    { l: 'Total Projects', v: projects.length },
                    { l: 'Completed',      v: projects.filter(p => p.progress === 100).length },
                    { l: 'Inquiries',      v: inquiries.length },
                    { l: 'Member Since',   v: formatTs(profile?.createdAt) },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 900, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.v}</div>
                      <div style={{ color: 'var(--text3)', fontSize: '0.75rem', marginTop: '3px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>📞 Need Help?</h3>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#25D366', color: 'white', textDecoration: 'none' }}>💬 WhatsApp</a>
                  <a href={`mailto:${EMAIL}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>📧 Email Us</a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
