// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  listenToAllProjects, listenToInquiries, listenToAllUsers,
  createProject, updateProject, deleteProject,
  updateInquiryStatus, deleteComment, listenToComments
} from '../firebase/services'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

function formatTs(ts) {
  if (!ts) return '—'
  try { return (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return '—' }
}

function getStepStatus(proj, idx) {
  const done = Math.floor((proj.progress / 100) * (proj.steps?.length || 5))
  if (idx < done) return 'done'
  if (idx === done && proj.progress < 100) return 'active'
  return 'pend'
}

// New Project Modal
function NewProjectModal({ onClose, onCreate }) {
  const [f, setF] = useState({
    name: '', clientEmail: '', clientName: '',
    steps: 'Requirements,Design,Development,Testing,Launch',
    note: '', deliverables: '',
  })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!f.name.trim() || !f.clientEmail.trim()) return toast.error('Project name and client email are required')
    const normalizedEmail = f.clientEmail.trim().toLowerCase()
    const steps = f.steps.split(',').map(s => s.trim()).filter(Boolean)
    const deliverables = f.deliverables ? f.deliverables.split(',').map(s => s.trim()).filter(Boolean) : []
    setBusy(true)
    try {
      await onCreate({
        name: f.name.trim(),
        clientEmail: normalizedEmail,         // ← always lowercase
        clientName: f.clientName.trim() || normalizedEmail.split('@')[0],
        steps, deliverables,
        adminNote: f.note.trim(),
        assignedDate: new Date().toLocaleDateString('en-IN'),
      })
      toast.success(`Project "${f.name}" created & synced to client! ✅`)
      onClose()
    } catch (e) {
      toast.error('Failed to create project: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">📂 New Project</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input className="form-control" placeholder="Business Website for Rajesh Patel" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Client Name</label>
            <input className="form-control" placeholder="Rajesh Kumar" value={f.clientName} onChange={e => setF({ ...f, clientName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Client Email *</label>
            <input className="form-control" type="email" placeholder="client@email.com" value={f.clientEmail} onChange={e => setF({ ...f, clientEmail: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Steps (comma-separated)</label>
          <input className="form-control" value={f.steps} onChange={e => setF({ ...f, steps: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Deliverables (comma-separated)</label>
          <input className="form-control" placeholder="Homepage, About Page, Contact Page" value={f.deliverables} onChange={e => setF({ ...f, deliverables: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Initial Note to Client</label>
          <textarea className="form-control" rows={3} placeholder="We've received your requirements and started working..." value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>
            {busy ? '⏳ Creating...' : 'Create & Assign →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab,       setTab]       = useState('overview')
  const [projects,  setProjects]  = useState([])
  const [inquiries, setInquiries] = useState([])
  const [users,     setUsers]     = useState([])
  const [comments,  setComments]  = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [editNote,  setEditNote]  = useState('')
  const [editDels,  setEditDels]  = useState('')

  const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '917572873450'

  // Real-time listeners for all collections
  useEffect(() => {
    const u1 = listenToAllProjects(setProjects)
    const u2 = listenToInquiries(setInquiries)
    const u3 = listenToAllUsers(setUsers)
    const u4 = listenToComments(setComments)
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  const doLogout = async () => { await logout(); toast.success('Logged out'); navigate('/') }

  // Update project progress (instantly syncs to client via Firestore)
  const changeProgress = async (id, pct) => {
    const proj = projects.find(p => p.id === id)
    if (!proj) return
    const progress = Number(pct)
    const status   = progress === 100 ? 'Completed' : progress === 0 ? 'Not Started' : 'In Progress'
    try {
      await updateProject(id, { progress, status })
    } catch (e) {
      toast.error('Failed to update: ' + e.message)
    }
  }

  const saveNote = async (id) => {
    try {
      await updateProject(id, { adminNote: editNote })
      toast.success('Note saved — client can see this now ✅')
      setEditId(null)
    } catch (e) { toast.error(e.message) }
  }

  const saveDels = async (id) => {
    const dels = editDels.split(',').map(s => s.trim()).filter(Boolean)
    try {
      await updateProject(id, { deliverables: dels })
      toast.success('Deliverables updated ✅')
    } catch (e) { toast.error(e.message) }
  }

  const delProject = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return
    try { await deleteProject(id); toast.success('Project deleted') } catch (e) { toast.error(e.message) }
  }

  const updateInqSt = async (id, status) => {
    try { await updateInquiryStatus(id, status); toast.success('Status updated') } catch (e) { toast.error(e.message) }
  }

  const delComment = async (id) => {
    try { await deleteComment(id); toast.success('Comment deleted') } catch (e) { toast.error(e.message) }
  }

  const sideItems = [
    { icon: '🏠', label: 'Overview',   id: 'overview'  },
    { icon: '📊', label: 'Projects',   id: 'projects'  },
    { icon: '📋', label: 'Inquiries',  id: 'inquiries', badge: inquiries.filter(i => !i.status || i.status === 'new').length },
    { icon: '👥', label: 'Users',      id: 'users'     },
    { icon: '💬', label: 'Comments',   id: 'comments'  },
    { icon: '⚙️', label: 'Setup Guide',id: 'config'    },
  ]

  return (
    <div className="dash-shell">
      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreate={createProject} />
      )}

      {/* Top bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-brand">
          <img src={logo} alt="CodeNest Dev" />
          <span>Admin Panel</span>
        </div>
        <div className="dash-topbar-right">
          <span className="badge badge-red">⚙️ Admin</span>
          <div className="user-chip"><div className="user-chip-dot" /><span>{user?.email}</span></div>
          <button className="btn btn-danger btn-sm" onClick={doLogout}>Logout</button>
        </div>
      </div>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="sidebar-label">Admin Controls</div>
          <ul className="sidebar-menu">
            {sideItems.map(s => (
              <li key={s.id} className="sidebar-item">
                <a href="#" className={tab === s.id ? 'active' : ''} onClick={e => { e.preventDefault(); setTab(s.id) }}>
                  <span className="s-icon">{s.icon}</span>
                  {s.label}
                  {s.badge > 0 && <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 7px' }}>{s.badge}</span>}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto' }}>
            <ul className="sidebar-menu">
              <li className="sidebar-item"><a href="#" onClick={e => { e.preventDefault(); navigate('/') }}><span className="s-icon">🌐</span>View Site</a></li>
              <li className="sidebar-item"><a href="#" onClick={e => { e.preventDefault(); doLogout() }}><span className="s-icon">🚪</span>Logout</a></li>
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="dash-main">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>🏠</span>Admin Overview</div>
              <div className="dash-welcome">
                <h2>CodeNest Dev Admin ⚙️</h2>
                <p>All changes sync instantly to client dashboards via Firebase Firestore.</p>
              </div>
              <div className="stats-row">
                {[
                  { icon: '📂', num: projects.length,                                    lab: 'Total Projects'   },
                  { icon: '✅', num: projects.filter(p => p.progress === 100).length,    lab: 'Completed'        },
                  { icon: '⏳', num: projects.filter(p => p.progress > 0 && p.progress < 100).length, lab: 'In Progress' },
                  { icon: '📋', num: inquiries.length,                                   lab: 'Total Inquiries'  },
                  { icon: '🆕', num: inquiries.filter(i => !i.status || i.status === 'new').length, lab: 'New Inquiries'},
                  { icon: '👥', num: users.length,                                       lab: 'Registered Users' },
                  { icon: '💬', num: comments.length,                                    lab: 'Comments'         },
                  { icon: '🔥', num: 'Live',                                             lab: 'Firebase Sync'    },
                ].map((s, i) => (
                  <div key={i} className="card stat-card">
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-lab">{s.lab}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: '1.4rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>🆕 Recent Inquiries</h3>
                {inquiries.slice(0, 5).map((inq, i) => (
                  <div key={i} className="card inq-card" style={{ marginBottom: '0.7rem' }}>
                    <div className="inq-av">{inq.name?.charAt(0) || '?'}</div>
                    <div className="inq-body">
                      <div className="inq-name">{inq.name}</div>
                      <div className="inq-meta">{inq.email} · {formatTs(inq.createdAt)}</div>
                      <div className="inq-msg">{inq.message?.slice(0, 120)}{inq.message?.length > 120 ? '…' : ''}</div>
                    </div>
                    <span className={`badge ${inq.status === 'done' ? 'badge-green' : inq.status === 'review' ? 'badge-yellow' : 'badge-red'}`}>{inq.status || 'new'}</span>
                  </div>
                ))}
                {inquiries.length === 0 && <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>No inquiries yet.</p>}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {tab === 'projects' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div className="dash-page-title" style={{ marginBottom: 0 }}><span>📊</span>Manage Projects</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New Project</button>
              </div>
              {projects.length === 0 ? (
                <div className="card empty-state"><div className="e-icon">📂</div><p>No projects yet. Create one to get started.</p></div>
              ) : projects.map(p => (
                <div key={p.id} className="card proj-card">
                  <div className="proj-header">
                    <div>
                      <div className="proj-name">{p.name}</div>
                      <div className="proj-client">
                        👤 {p.clientName} · 📧 <span style={{ color: '#60A5FA', fontFamily: 'monospace', fontSize: '0.82rem' }}>{p.clientEmail}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${p.progress === 100 ? 'badge-green' : p.progress > 0 ? 'badge-yellow' : 'badge-blue'}`}>{p.status}</span>
                      <button className="btn btn-sm btn-ghost" onClick={() => { setEditId(editId === p.id ? null : p.id); setEditNote(p.adminNote || ''); setEditDels((p.deliverables || []).join(', ')) }}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => delProject(p.id, p.name)}>🗑</button>
                    </div>
                  </div>

                  {/* Progress slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text3)', minWidth: 70 }}>Progress:</span>
                    <input type="range" min="0" max="100" step="5" value={p.progress}
                      style={{ '--pct': `${p.progress}%`, flex: 1, minWidth: 120 }}
                      onChange={e => changeProgress(p.id, e.target.value)} />
                    <span className="proj-pct">{p.progress}%</span>
                  </div>

                  <div className="prog-bg"><div className="prog-fill" style={{ width: `${p.progress}%` }} /></div>
                  <div className="steps-row" style={{ marginTop: '0.8rem' }}>
                    {(p.steps || []).map((s, j) => {
                      const st = getStepStatus(p, j)
                      return <span key={j} className={`step-pill step-${st}`}><span className={`step-dot d-${st}`} />{s}</span>
                    })}
                  </div>

                  {/* Edit panel */}
                  {editId === p.id && (
                    <div style={{ marginTop: '1rem', padding: '1.2rem', background: 'rgba(10,15,30,0.5)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Edit Project Details</p>
                      <div className="form-group">
                        <label className="form-label">Note to Client (syncs immediately)</label>
                        <textarea className="form-control" rows={3} value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="e.g. Design phase is complete. Moving to development now." />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Deliverables (comma-separated)</label>
                        <input className="form-control" value={editDels} onChange={e => setEditDels(e.target.value)} placeholder="Homepage, About, Contact" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => saveNote(p.id)}>💾 Save Note</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => saveDels(p.id)}>📦 Save Deliverables</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* INQUIRIES */}
          {tab === 'inquiries' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>📋</span>All Inquiries ({inquiries.length})</div>
              {inquiries.length === 0 ? (
                <div className="card empty-state"><div className="e-icon">📭</div><p>No inquiries yet.</p></div>
              ) : inquiries.map((inq, i) => (
                <div key={i} className="card inq-card" style={{ marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div className="inq-av">{inq.name?.charAt(0) || '?'}</div>
                  <div className="inq-body">
                    <div className="inq-name">{inq.name}</div>
                    <div className="inq-meta">{inq.email} {inq.phone && `· 📞 ${inq.phone}`} · {formatTs(inq.createdAt)}</div>
                    <div className="inq-msg">{inq.message}</div>
                  </div>
                  <div className="inq-right" style={{ minWidth: 140 }}>
                    <span className={`badge ${inq.status === 'done' ? 'badge-green' : inq.status === 'review' ? 'badge-yellow' : 'badge-red'}`}>{inq.status || 'new'}</span>
                    <select className="form-control" value={inq.status || 'new'} style={{ fontSize: '0.82rem', padding: '5px 8px', marginTop: '5px' }}
                      onChange={e => updateInqSt(inq.id, e.target.value)}>
                      <option value="new">🆕 New</option>
                      <option value="review">👁 Reviewing</option>
                      <option value="done">✅ Done</option>
                    </select>
                    <a href={`https://wa.me/${inq.phone?.replace(/\D/g, '') || WHATSAPP}?text=Hi%20${encodeURIComponent(inq.name||'')}%2C%20this%20is%20CodeNest%20Dev...`}
                      target="_blank" rel="noreferrer" className="btn btn-success btn-sm" style={{ marginTop: 5, textDecoration: 'none', textAlign: 'center' }}>
                      💬 Reply on WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>👥</span>Registered Users ({users.length})</div>
              {users.length === 0 ? (
                <div className="card empty-state"><div className="e-icon">👥</div><p>No registered users yet.</p></div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>User</th><th>Email</th><th>Joined</th><th>Projects</th></tr></thead>
                    <tbody>
                      {users.map((u, i) => {
                        const up = projects.filter(p => p.clientEmail?.toLowerCase() === u.email?.toLowerCase())
                        return (
                          <tr key={i}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                {u.name}
                              </div>
                            </td>
                            <td><a href={`mailto:${u.email}`} style={{ color: '#60A5FA' }}>{u.email}</a></td>
                            <td style={{ color: 'var(--text3)' }}>{formatTs(u.createdAt)}</td>
                            <td><span className="badge badge-blue">{up.length} projects</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* COMMENTS */}
          {tab === 'comments' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div className="dash-page-title" style={{ marginBottom: 0 }}><span>💬</span>Site Comments ({comments.length})</div>
              </div>
              {comments.length === 0 ? (
                <div className="card empty-state"><div className="e-icon">💬</div><p>No comments yet.</p></div>
              ) : comments.map((c, i) => (
                <div key={i} className="card" style={{ padding: '1rem 1.2rem', marginBottom: '0.7rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.87rem', color: '#60A5FA' }}>👤 {c.name}</span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>{formatTs(c.createdAt)}</span>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: '1.55' }}>{c.text}</p>
                  </div>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => delComment(c.id)} title="Delete">🗑</button>
                </div>
              ))}
            </div>
          )}

          {/* CONFIG GUIDE */}
          {tab === 'config' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="dash-page-title"><span>⚙️</span>Setup Guide</div>

              <div className="card" style={{ padding: '1.8rem', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.25)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem', color: '#FCA5A5' }}>🚨 Common Fix: Project Not Showing on Client</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { n: '1', t: 'Email must match exactly', d: 'The email you type when creating a project must be the exact same email the client used to register. Both are stored lowercase — check by looking at the 📧 shown on each project card.' },
                    { n: '2', t: 'Fix Firestore Security Rules', d: 'Go to Firebase Console → Firestore Database → Rules tab. If still in "test mode" with expiry, update the rules to allow authenticated reads (see README for full rules).' },
                    { n: '3', t: 'Check browser console', d: 'Open DevTools → Console. Any [listenToClientProjects] errors will appear there with the exact reason.' },
                    { n: '4', t: 'Client must be logged in', d: 'Projects only show when the client is authenticated. Ask them to log out and log back in to refresh the session.' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.9rem', background: 'rgba(239,68,68,0.06)', borderRadius: 9, border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, color: '#FCA5A5' }}>{s.n}</div>
                      <div><div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2, color: '#FCA5A5' }}>{s.t}</div><div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{s.d}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '1.8rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem', color: '#FCD34D' }}>🔥 Firebase Setup</h3>
                {[
                  { n: '1', t: 'Create Firebase Project', d: 'Go to console.firebase.google.com → New project → name it → continue' },
                  { n: '2', t: 'Enable Firestore',        d: 'Build → Firestore Database → Create database → Start in test mode' },
                  { n: '3', t: 'Enable Authentication',   d: 'Build → Authentication → Get started → Email/Password → Enable' },
                  { n: '4', t: 'Add Web App',             d: 'Project Settings → Your apps → </> → Register app → copy firebaseConfig' },
                  { n: '5', t: 'Update Config',           d: 'Paste values in src/firebase/config.js OR create .env file with VITE_FIREBASE_* vars' },
                  { n: '6', t: 'Create Admin User',       d: 'Firebase Console → Authentication → Add user with your admin email, then set VITE_ADMIN_EMAIL in .env' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.9rem', background: 'rgba(15,23,42,0.5)', borderRadius: 9, border: '1px solid var(--card-border)', marginBottom: '0.6rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{s.t}</div>
                      <div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: '1.8rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem', color: '#67E8F9' }}>📧 EmailJS Setup</h3>
                {[
                  { n: '1', t: 'Create account',  d: 'emailjs.com → free account (200 emails/month free)' },
                  { n: '2', t: 'Add service',      d: 'Email Services → Add Service → Gmail/Outlook' },
                  { n: '3', t: 'Create template',  d: 'Email Templates → Create → Use {{from_name}}, {{from_email}}, {{phone}}, {{message}}' },
                  { n: '4', t: 'Get Public Key',   d: 'Account → General → copy Public Key' },
                  { n: '5', t: 'Update .env',      d: 'Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.9rem', background: 'rgba(15,23,42,0.5)', borderRadius: 9, border: '1px solid var(--card-border)', marginBottom: '0.6rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{s.t}</div>
                      <div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: '1.8rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem', color: '#6EE7B7' }}>🚀 Go Live Checklist</h3>
                {[
                  'Copy .env.example → .env and fill all values',
                  'Set VITE_ADMIN_EMAIL to your actual admin email',
                  'Create that admin user in Firebase Auth',
                  'Update VITE_WHATSAPP_NUMBER and VITE_INSTAGRAM_URL',
                  'Set up EmailJS for contact form emails',
                  'Replace sample portfolio images with real screenshots',
                  'Build: npm run build → deploy dist/ folder',
                  'Deploy free on Netlify or Vercel (drag & drop dist/)',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(99,102,241,0.08)', fontSize: '0.87rem', color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--green)' }}>□</span>{item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
