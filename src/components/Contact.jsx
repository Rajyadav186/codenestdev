// src/components/Contact.jsx
import { useState } from 'react'
import { submitInquiry } from '../firebase/services'
import { sendContactEmail } from '../firebase/emailService'
import toast from 'react-hot-toast'
import useReveal from '../hooks/useReveal'

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || 'rajy41008@gmail.com'
const CONTACT_EMAIL  = import.meta.env.VITE_CONTACT_EMAIL  || 'rajy41008@gmail.com'
const WHATSAPP_NUM   = import.meta.env.VITE_WHATSAPP_NUMBER || '917572873450'

export default function Contact() {
  useReveal()
  const [f, setF]         = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  const validate = () => {
    if (!f.name.trim())    { toast.error('Please enter your name');    return false }
    if (!f.email.trim())   { toast.error('Please enter your email');   return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { toast.error('Please enter a valid email'); return false }
    if (!f.message.trim()) { toast.error('Please enter a message');    return false }
    return true
  }

  const submit = async () => {
    if (!validate()) return
    setSending(true)
    try {
      // 1. Save to Firestore — always works
      await submitInquiry({ name: f.name, email: f.email, phone: f.phone, message: f.message })
      // 2. Send email via EmailJS (optional, needs config)
      const emailResult = await sendContactEmail({
        from_name:  f.name,
        from_email: f.email,
        phone:      f.phone,
        message:    f.message,
      })
      if (emailResult.reason === 'not_configured') {
        toast.success('Inquiry saved! We\'ll contact you soon. 📨', { duration: 6000 })
      } else if (emailResult.ok) {
        toast.success('Message sent! We\'ll reply within 2 hours. 🎉', { duration: 6000 })
      } else {
        toast.success('Inquiry saved! We\'ll reach out via dashboard. 📊', { duration: 6000 })
      }
      setF({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      toast.error('Something went wrong. Please try WhatsApp instead.')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="section" id="contact">
      <div className="section-header">
        <div className="section-tag reveal">Get In Touch</div>
        <h2 className="section-title reveal">Start Your <span className="grad-text">Project Today</span></h2>
        <p className="section-sub reveal">Fill the form and we'll get back within 2 hours!</p>
      </div>

      <div className="contact-layout">
        {/* Info */}
        <div className="reveal-l">
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 900, marginBottom: '1rem' }}>
            Let's Build Something Amazing 🚀
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: '1.75', marginBottom: '2rem' }}>
            Ready for a website that actually works for your business? Contact us for a free consultation.
          </p>
          {[
            { i: '📧', h: 'Email',         v: CONTACT_EMAIL },
            { i: '💬', h: 'WhatsApp',      v: '+917572873450 ' + WHATSAPP_NUM.replace('917572873450') },
            { i: '📍', h: 'Location',      v: 'India' },
            { i: '⏱️', h: 'Response Time', v: 'Within 2 hours' },
          ].map((d, i) => (
            <div key={i} className="contact-detail">
              <div className="contact-icon">{d.i}</div>
              <div className="contact-detail-text">
                <strong>{d.h}</strong>
                <span>{d.v}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card reveal-r" style={{ padding: '2.2rem' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="Rajesh Kumar" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-control" type="email" placeholder="you@email.com" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-control" placeholder="+91 98765 43210" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea className="form-control" rows={5} placeholder="Tell us about your project..." value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={sending}>
            {sending ? '⏳ Sending...' : '🚀 Send Message'}
          </button>
        </div>
      </div>
    </section>
  )
}
