// src/firebase/emailService.js
// Web3Forms — https://web3forms.com (free, no account needed)
//
// SETUP:
//  1. Go to https://web3forms.com
//  2. Enter YOUR email → click "Create Access Key"
//  3. Copy the key from the page (or your email)
//  4. Paste it directly below OR add to .env as VITE_WEB3FORMS_KEY

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || '0b4a8ab1-73bb-413f-aad3-a8b085e7e66f'

export const sendContactEmail = async ({ from_name, from_email, phone = '', message }) => {
  // Check if key is configured
  if (!ACCESS_KEY || ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
    console.warn('[Web3Forms] Access key not set. Paste your key in emailService.js or .env')
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const payload = {
      access_key:   ACCESS_KEY,
      subject:      `New Inquiry from ${from_name} — CodeNest Dev`,
      from_name:    'CodeNest Dev Website',
      name:         from_name,
      email:        from_email,
      phone:        phone || 'Not provided',
      message:      message,
      botcheck:     false,
    }

    console.log('[Web3Forms] Sending with key:', ACCESS_KEY.slice(0, 8) + '...')

    const res = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const data = await res.json()
    console.log('[Web3Forms] Response:', data)

    if (data.success) {
      return { ok: true }
    } else {
      console.error('[Web3Forms] Failed:', data.message)
      return { ok: false, reason: data.message }
    }
  } catch (e) {
    console.error('[Web3Forms] Fetch error:', e)
    return { ok: false, reason: e.message }
  }
}
