import { useEffect, useRef, useState } from 'react'
import type { Opportunity, SwipeDirection } from '../types'

type Props = {
  opportunity: Opportunity
  isTop: boolean
  stackIndex: number
  exitDirection: SwipeDirection | null
  onSwipe: (direction: SwipeDirection) => void
}

const SWIPE_THRESHOLD = 110

export function SwipeCard({ opportunity, isTop, stackIndex, exitDirection, onSwipe }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false })
  const [expanded, setExpanded] = useState(false)
  const start = useRef({ x: 0, y: 0 })
  const moved = useRef(false)

  useEffect(() => {
    if (!isTop) setExpanded(false)
  }, [isTop])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop || exitDirection) return
    cardRef.current?.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY }
    moved.current = false
    setDrag({ x: 0, y: 0, dragging: true })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag.dragging) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true
    setDrag({ x: dx, y: dy, dragging: true })
  }

  const handlePointerUp = () => {
    if (!drag.dragging) return
    if (drag.x > SWIPE_THRESHOLD) {
      onSwipe('like')
    } else if (drag.x < -SWIPE_THRESHOLD) {
      onSwipe('nope')
    } else {
      if (!moved.current) setExpanded((v) => !v)
    }
    setDrag({ x: 0, y: 0, dragging: false })
  }

  const exitX = exitDirection === 'like' ? 600 : exitDirection === 'nope' ? -600 : 0
  const x = exitDirection ? exitX : drag.x
  const y = exitDirection ? -40 : drag.y * 0.4
  const rotation = x / 18
  const likeOpacity = Math.max(0, Math.min(1, x / SWIPE_THRESHOLD))
  const nopeOpacity = Math.max(0, Math.min(1, -x / SWIPE_THRESHOLD))

  const stackScale = 1 - stackIndex * 0.04
  const stackY = stackIndex * 12

  return (
    <div
      ref={cardRef}
      className={`swipe-card ${drag.dragging ? 'dragging' : ''} ${exitDirection ? 'exiting' : ''}`}
      style={{
        transform: isTop
          ? `translate(${x}px, ${y}px) rotate(${rotation}deg)`
          : `translateY(${stackY}px) scale(${stackScale})`,
        zIndex: 100 - stackIndex,
        opacity: exitDirection ? 0 : 1,
        background: `linear-gradient(160deg, ${opportunity.gradient[0]}, ${opportunity.gradient[1]})`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="card-badge like-badge" style={{ opacity: likeOpacity }}>
        興味あり!
      </div>
      <div className="card-badge nope-badge" style={{ opacity: nopeOpacity }}>
        スキップ
      </div>

      <div className="card-emoji" aria-hidden="true">
        {opportunity.emoji}
      </div>

      <div className={`card-body ${expanded ? 'expanded' : ''}`}>
        <span className="card-category">{opportunity.category}</span>
        <h2 className="card-title">{opportunity.title}</h2>
        <p className="card-org">{opportunity.organization}</p>
        <div className="card-meta">
          <span>📍 {opportunity.location}</span>
          <span>🗓️ {opportunity.date}</span>
          <span>⏰ {opportunity.timeCommitment}</span>
          <span>👥 定員 {opportunity.capacity}名</span>
        </div>
        {expanded && <p className="card-description">{opportunity.description}</p>}
        <div className="card-tags">
          {opportunity.tags.map((tag) => (
            <span key={tag} className="card-tag">
              #{tag}
            </span>
          ))}
        </div>
        <p className="card-hint">{expanded ? 'タップで閉じる' : 'タップで詳細を見る'}</p>
      </div>
    </div>
  )
}
