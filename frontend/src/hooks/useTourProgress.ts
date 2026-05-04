import { useState, useCallback } from 'react'

export type TourStep = 'dashboard' | 'reviews' | 'followups'

const KEY = 'reputrack_tour'

function load(): Set<TourStep> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function save(steps: Set<TourStep>) {
  localStorage.setItem(KEY, JSON.stringify([...steps]))
}

export function useTourProgress() {
  const [completed, setCompleted] = useState<Set<TourStep>>(load)

  const complete = useCallback((step: TourStep) => {
    setCompleted(prev => {
      if (prev.has(step)) return prev
      const next = new Set(prev)
      next.add(step)
      save(next)
      return next
    })
  }, [])

  return { completed, complete }
}
