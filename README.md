# CodeNest Dev — React + Vite + Firebase Website

A complete, production-ready web agency website with Firebase-powered real-time sync between client dashboard and admin dashboard.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Fill in your Firebase & EmailJS credentials in .env

# 4. Start dev server
npm run dev
```

## 🔥 Firebase Setup (Required)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. **Firestore Database**: Build → Firestore Database → Create database → Test mode
4. **Authentication**: Build → Authentication → Get started → Email/Password → Enable
5. **Web App**: Project Settings → Your apps → `</>` → Register → copy `firebaseConfig`
6. Paste values into your `.env` file (see `.env.example`)

### Create Admin User
- Firebase Console → Authentication → Users → Add user
- Use email matching `VITE_ADMIN_EMAIL` in your `.env`

### Firestore Security Rules
Paste in Firebase Console → Firestore → Rules tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /comments/{id} {
      allow read, create: if true;
      allow delete: if request.auth != null;
    }
    match /projects/{id} {
      allow write: if request.auth != null && request.auth.token.email == "YOUR_ADMIN_EMAIL";
      allow read: if request.auth != null &&
        (request.auth.token.email == "YOUR_ADMIN_EMAIL" ||
         resource.data.clientEmail == request.auth.token.email);
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

## 📧 EmailJS Setup (Contact Form Emails)

1. Create free account at [emailjs.com](https://emailjs.com) (200 emails/month free)
2. Email Services → Add Service → Gmail or Outlook
3. Email Templates → Create Template
   - Template variables: `{{from_name}}`, `{{from_email}}`, `{{phone}}`, `{{message}}`
4. Account → General → copy Public Key
5. Add to `.env`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

## 📁 Project Structure

```
src/
├── assets/
│   └── logo.png              # Your CodeNest Dev logo
├── components/
│   ├── Navbar.jsx             # Sticky nav with mobile menu
│   ├── Hero.jsx               # Hero with floating particles & orb
│   ├── Services.jsx           # 4 service cards
│   ├── Pricing.jsx            # 3 pricing plans + extras
│   ├── Portfolio.jsx          # 6 project showcase cards
│   ├── WhyUs.jsx              # 8 reason cards
│   ├── Testimonials.jsx       # 6 client reviews
│   ├── LiveComments.jsx       # Firebase real-time comments
│   ├── Contact.jsx            # Form → Firebase + EmailJS
│   ├── Footer.jsx             # Footer with links
│   └── Floaters.jsx           # WhatsApp + Instagram buttons
├── pages/
│   ├── Home.jsx               # Full landing page
│   ├── Login.jsx              # Login + Signup with Firebase Auth
│   ├── Dashboard.jsx          # Client dashboard (real-time Firestore)
│   └── AdminDashboard.jsx     # Admin panel (real-time sync to clients)
├── firebase/
│   ├── config.js              # Firebase initialization
│   ├── services.js            # All Firestore CRUD operations
│   └── emailService.js        # EmailJS integration
├── hooks/
│   ├── useAuth.jsx            # Auth context + provider
│   └── useReveal.js           # Scroll reveal animations
├── styles/
│   └── global.css             # Full CSS with all animations
├── App.jsx                    # Routes + guards
└── main.jsx                   # Entry point
```

## ✨ Features

### Landing Page
- Animated hero with floating particles, orbit rings, and glow effects
- Scroll-reveal animations on all sections
- Services, Pricing (3 plans + extras), Portfolio, Why Us, Testimonials
- **Live comments** powered by Firebase Firestore (real-time)
- Contact form → saves to Firestore + sends email via EmailJS
- Floating WhatsApp + Instagram buttons

### Client Dashboard
- Login / Sign Up with Firebase Authentication
- **Real-time project progress** — updates instantly when admin changes it
- Project steps tracker (Requirements → Design → Dev → Testing → Launch)
- Team notes from admin visible immediately
- Inquiry history with status tracking
- Profile page

### Admin Dashboard
- **Live sync** — slider changes instantly reflect on client's dashboard
- Create projects and assign to clients by email
- Update project progress with drag slider
- Write notes & set deliverables (clients see immediately via Firestore)
- Manage all inquiries with status (New / Reviewing / Done)
- One-click WhatsApp reply to inquiries
- View all registered users
- Moderate live comments
- Setup guide

## 🌐 Deployment

```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

Deploy the `dist/` folder to:
- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: `vercel --prod`
- **Firebase Hosting**: `firebase deploy`

## 🔑 Default Admin

Set in `.env`:
```
VITE_ADMIN_EMAIL=admin@codenestdev.com
```
Create this user in Firebase Authentication console.

## 📱 Contact & Customisation

Update in `.env`:
```
VITE_CONTACT_EMAIL=your@email.com
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
VITE_INSTAGRAM_URL=https://instagram.com/yourhandle
```
