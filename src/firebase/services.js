// src/firebase/services.js
// All Firestore CRUD operations — single source of truth for data
//
// KEY FIX: Queries that combine where() + orderBy() require a Firestore
// composite index. To avoid that setup requirement, we fetch with ONLY
// where() (no orderBy), then sort the results client-side. This works
// instantly with zero index configuration in Firebase Console.
//
// All emails are normalized to lowercase before storing and querying
// so "Admin@Email.com" === "admin@email.com" always matches.

import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  getDocs, getDoc, onSnapshot, query, orderBy, where,
  serverTimestamp, limit, increment
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { db, auth } from './config'

// Helper: sort array of Firestore docs by createdAt descending (client-side)
const sortByCreatedAt = (docs) =>
  [...docs].sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds * 1000 ?? 0
    const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds * 1000 ?? 0
    return tb - ta
  })

// ============================================================
// AUTH SERVICES
// ============================================================

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase()
  const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
  await updateProfile(cred.user, { displayName: name })
  // Save user profile to Firestore — email stored lowercase always
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid:       cred.user.uid,
    name:      name.trim(),
    email:     normalizedEmail,   // ← always lowercase
    isAdmin:   false,
    createdAt: serverTimestamp(),
  })
  return cred.user
}

export const loginUser = async ({ email, password }) => {
  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
  return cred.user
}

export const logoutUser  = () => signOut(auth)
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ============================================================
// PROJECTS SERVICES
// ============================================================

// Admin: create project
// clientEmail is ALWAYS stored lowercase so where() matches reliably
export const createProject = async (projectData) => {
  const ref = await addDoc(collection(db, 'projects'), {
    ...projectData,
    clientEmail: projectData.clientEmail?.trim().toLowerCase(), // ← force lowercase
    progress:    0,
    status:      'Not Started',
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    adminNote:   '',
    deliverables: [],
  })
  return ref.id
}

// Admin: update project (progress, notes, etc.)
export const updateProject = async (projectId, data) => {
  await updateDoc(doc(db, 'projects', projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// Admin: delete project
export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, 'projects', projectId))
}

// Client: listen to own projects in real-time
// FIX: NO orderBy() here — avoids composite index requirement.
//      We sort the results client-side after receiving them.
export const listenToClientProjects = (clientEmail, callback) => {
  if (!clientEmail) return () => {}
  const normalizedEmail = clientEmail.trim().toLowerCase()

  // Query with ONLY where — no orderBy — so no index is needed
  const q = query(
    collection(db, 'projects'),
    where('clientEmail', '==', normalizedEmail)
  )

  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(sortByCreatedAt(docs)) // sort newest first client-side
    },
    (error) => {
      console.error('[listenToClientProjects] Firestore error:', error.code, error.message)
      // If it's an index error, log a clear message
      if (error.code === 'failed-precondition') {
        console.error('→ Firestore composite index missing. This version uses no orderBy so this should not happen. Check Firestore rules instead.')
      }
      callback([]) // return empty so UI doesn't hang
    }
  )
}

// Admin: listen to ALL projects in real-time
export const listenToAllProjects = (callback) => {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (error) => { console.error('[listenToAllProjects]', error); callback([]) }
  )
}

// ============================================================
// INQUIRIES SERVICES
// ============================================================

export const submitInquiry = async (data) => {
  await addDoc(collection(db, 'inquiries'), {
    ...data,
    email:     data.email?.trim().toLowerCase(), // ← normalize
    status:    'new',
    createdAt: serverTimestamp(),
  })
}

export const updateInquiryStatus = async (inquiryId, status) => {
  await updateDoc(doc(db, 'inquiries', inquiryId), { status, updatedAt: serverTimestamp() })
}

export const listenToInquiries = (callback) => {
  const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (error) => { console.error('[listenToInquiries]', error); callback([]) }
  )
}

// FIX: NO orderBy() — avoids composite index requirement
export const listenToClientInquiries = (email, callback) => {
  if (!email) return () => {}
  const normalizedEmail = email.trim().toLowerCase()
  const q = query(
    collection(db, 'inquiries'),
    where('email', '==', normalizedEmail)
  )
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(sortByCreatedAt(docs))
    },
    (error) => { console.error('[listenToClientInquiries]', error); callback([]) }
  )
}

// ============================================================
// COMMENTS SERVICES
// ============================================================

export const addComment = async ({ name, service, avatar, stars, text }) => {
  await addDoc(collection(db, 'comments'), {
    name:      name.trim(),
    service:   service?.trim() || 'CodeNest Dev Client',
    avatar,
    stars:     stars || 5,
    text:      text.trim(),
    likes:     0,
    createdAt: serverTimestamp(),
    date:      new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  })
}

export const likeComment = async (commentId, direction) => {
  await updateDoc(doc(db, 'comments', commentId), {
    likes: increment(direction), // direction = +1 or -1
  })
}

export const deleteComment = async (commentId) => {
  await deleteDoc(doc(db, 'comments', commentId))
}

export const listenToComments = (callback) => {
  const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(100))
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (error) => { console.error('[listenToComments]', error); callback([]) }
  )
}

// ============================================================
// USERS SERVICES (Admin)
// ============================================================

export const listenToAllUsers = (callback) => {
  // FIX: no orderBy to avoid index requirement, sort client-side
  const q = query(collection(db, 'users'))
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(sortByCreatedAt(docs))
    },
    (error) => { console.error('[listenToAllUsers]', error); callback([]) }
  )
}
