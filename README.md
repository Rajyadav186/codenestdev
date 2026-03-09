
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


