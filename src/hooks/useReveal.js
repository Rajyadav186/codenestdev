// src/hooks/useReveal.js
import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-s').forEach(el => io.observe(el))
    return () => io.disconnect()
  })
}
