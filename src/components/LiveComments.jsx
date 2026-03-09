// src/components/LiveComments.jsx
import { useState, useEffect, useRef } from 'react'
import { listenToComments, addComment as fbAddComment, likeComment } from '../firebase/services'
import useReveal from '../hooks/useReveal'

const AVATARS    = ['🧑','👩','👨','🧑‍💼','👩‍💼','👨‍💼','🧑‍💻','👩‍💻','👨‍💻','🧑‍🎨','👩‍🎨','🧑‍🚀']
const STAR_LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']
const BLANK_FORM = { name: '', service: '', stars: 5, text: '' }
const LIKES_KEY  = 'cn-dev-likes-v1'

export default function LiveComments() {
  const [comments, setComments] = useState([])
  const [form,     setForm]     = useState(BLANK_FORM)
  const [status,   setStatus]   = useState('idle')
  const [loading,  setLoading]  = useState(true)
  const [errMsg,   setErrMsg]   = useState('')
  const [likes,    setLikes]    = useState({})
  const [newId,    setNewId]    = useState(null)
  const listRef = useRef(null)
  useReveal()

  // Load liked IDs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIKES_KEY)
      if (saved) setLikes(JSON.parse(saved))
    } catch {}
  }, [])

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = listenToComments((data) => {
      setComments(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // Mark newest comment after posting
  useEffect(() => {
    if (status === 'success' && comments.length > 0) setNewId(comments[0]?.id)
  }, [comments, status])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setStars     = n => setForm(f => ({ ...f, stars: n }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) {
      setErrMsg('Please fill in your name and comment.')
      return
    }
    setErrMsg('')
    setStatus('submitting')
    try {
      await fbAddComment({
        name:    form.name.trim(),
        service: form.service.trim() || 'CodeNest Dev Client',
        avatar:  AVATARS[Math.floor(Math.random() * AVATARS.length)],
        stars:   form.stars,
        text:    form.text.trim().slice(0, 500),
      })
      setForm(BLANK_FORM)
      setStatus('success')
      setTimeout(() => { setStatus('idle'); setNewId(null) }, 4000)
      setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 150)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrMsg('Could not post comment. Please try again.')
    }
  }

  const handleLike = async (id) => {
    const alreadyLiked = likes[id]
    const updated = { ...likes, [id]: !alreadyLiked }
    setLikes(updated)
    try { localStorage.setItem(LIKES_KEY, JSON.stringify(updated)) } catch {}
    try { await likeComment(id, alreadyLiked ? -1 : 1) } catch (e) { console.error(e) }
  }

  const avgRating = comments.length
    ? (comments.reduce((s, c) => s + (c.stars || 5), 0) / comments.length).toFixed(1)
    : '5.0'

  return (
    <section id="comments" className="section section-alt">
      <div className="section-header">
        <div className="section-tag reveal">CLIENT VOICES</div>
        <h2 className="section-title reveal">Comments &amp; <span className="grad-text">Reviews</span></h2>
        <p className="section-sub reveal">
          Real experiences from our clients — visible to everyone, saved permanently.
        </p>
      </div>

      {/* Rating summary bar */}
      {!loading && comments.length > 0 && (
        <div className="cn-rating-bar reveal">
          <div className="cn-rating-big">
            <span className="cn-rating-num">{avgRating}</span>
            <div className="cn-rating-stars">
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ color: n <= Math.round(+avgRating) ? '#FBBF24' : 'rgba(100,116,139,0.3)', fontSize: 22 }}>
                  &#9733;
                </span>
              ))}
            </div>
            <span className="cn-rating-label">Overall Rating</span>
          </div>
          <div className="cn-rating-bars">
            {[5,4,3,2,1].map(star => {
              const cnt = comments.filter(c => (c.stars || 5) === star).length
              const pct = comments.length ? (cnt / comments.length) * 100 : 0
              return (
                <div key={star} className="cn-rating-row">
                  <span>{star}&#9733;</span>
                  <div className="cn-rating-track">
                    <div className="cn-rating-fill" style={{ width: pct + '%' }} />
                  </div>
                  <span>{cnt}</span>
                </div>
              )
            })}
          </div>
          <div className="cn-rating-count">
            <span className="cn-total-count">{comments.length}</span>
            <span>Total Reviews</span>
          </div>
        </div>
      )}

      <div className="cn-layout">

        {/* POST FORM */}
        <div className="card cn-form-card reveal-l">
          <h3 className="cn-form-title">Write a Review</h3>

          {status === 'success' && (
            <div className="alert alert-success">Your review is live! Everyone can see it now.</div>
          )}
          {errMsg && <div className="alert alert-error">{errMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="cn-row">
              <div className="form-group">
                <label className="form-label">YOUR NAME *</label>
                <input
                  className="form-control"
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar"
                  disabled={status === 'submitting'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SERVICE / PROJECT</label>
                <input
                  className="form-control"
                  name="service" value={form.service} onChange={handleChange}
                  placeholder="e.g. Business Website"
                  disabled={status === 'submitting'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">YOUR RATING *</label>
              <div className="cn-star-picker">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n} type="button"
                    className={'cn-star-btn' + (n <= form.stars ? ' cn-star-active' : '')}
                    onClick={() => setStars(n)}
                    title={STAR_LABEL[n]}
                  >&#9733;</button>
                ))}
                <span className="cn-star-label">{STAR_LABEL[form.stars]}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">YOUR EXPERIENCE *</label>
              <textarea
                className="form-control"
                name="text" value={form.text} onChange={handleChange}
                rows={5} maxLength={500}
                disabled={status === 'submitting'}
                placeholder="Tell us about your experience, results achieved, what you loved about CodeNest Dev..."
              />
              <span className="cn-char-count">{form.text.length} / 500</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Posting...' : 'Post Your Review'}
            </button>
          </form>
        </div>

        {/* LIVE FEED */}
        <div className="cn-feed reveal-r">
          <div className="cn-feed-header">
            <span className="cn-feed-count">
              {loading ? 'Loading...' : comments.length + ' Review' + (comments.length !== 1 ? 's' : '')}
            </span>
            <span className="cn-feed-sort">Most Recent First</span>
          </div>

          {loading && (
            <div className="cn-loading">
              <div className="cn-skeleton" />
              <div className="cn-skeleton" />
              <div className="cn-skeleton" />
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="cn-empty">
              <span style={{ fontSize: '2.5rem' }}>&#9733;</span>
              <p>Be the first to share your experience!</p>
            </div>
          )}

          <div className="cn-comment-list" ref={listRef}>
            {comments.map(c => (
              <div
                key={c.id}
                className={'card cn-comment-card' + (c.id === newId ? ' cn-new' : '')}
              >
                {c.id === newId && <span className="cn-new-badge">NEW</span>}

                <div className="cn-comment-top">
                  <div className="cn-avatar">{c.avatar || '🧑'}</div>
                  <div className="cn-comment-meta">
                    <strong>{c.name}</strong>
                    <span className="cn-service-badge">{c.service || 'CodeNest Dev Client'}</span>
                    <div className="cn-comment-stars">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ color: n <= (c.stars || 5) ? '#FBBF24' : 'rgba(100,116,139,0.25)' }}>
                          &#9733;
                        </span>
                      ))}
                      <span className="cn-star-label-sm">{STAR_LABEL[c.stars || 5]}</span>
                    </div>
                  </div>
                  <span className="cn-comment-date">{c.date || ''}</span>
                </div>

                <p className="cn-comment-text">{c.text}</p>

                <div className="cn-comment-footer">
                  <button
                    className={'cn-like-btn' + (likes[c.id] ? ' cn-liked' : '')}
                    onClick={() => handleLike(c.id)}
                  >
                    {likes[c.id] ? '❤️' : '🤍'} Helpful
                    {(c.likes || 0) > 0 && (
                      <span className="cn-like-count">{c.likes}</span>
                    )}
                  </button>
                  <span className="cn-verified">✓ Verified Client</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
