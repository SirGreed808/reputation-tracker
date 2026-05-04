import { useEffect, useState } from 'react'

interface Props {
  text: string
  done: boolean
}

export default function TourNudge({ text, done }: Props) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (done) return
    const show = setTimeout(() => setVisible(true), 1500)
    const hide = setTimeout(() => { setFading(true); setTimeout(() => setVisible(false), 600) }, 1500 + 6000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [done])

  if (!visible || done) return null

  return (
    <p className={`tour-nudge${fading ? ' tour-nudge-fade' : ''}`} role="status">
      {text}
    </p>
  )
}
