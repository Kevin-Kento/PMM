import { useState } from 'react'
import type { Opportunity, SwipeDirection } from '../types'
import { SwipeCard } from './SwipeCard'

type Props = {
  opportunities: Opportunity[]
  onSwipe: (opportunity: Opportunity, direction: SwipeDirection) => void
  onUndo: (() => void) | null
}

const EXIT_ANIMATION_MS = 300

export function SwipeDeck({ opportunities, onSwipe, onUndo }: Props) {
  const [exiting, setExiting] = useState<{ id: string; direction: SwipeDirection } | null>(null)

  const top = opportunities[0]

  const handleSwipe = (direction: SwipeDirection) => {
    if (!top || exiting) return
    setExiting({ id: top.id, direction })
    window.setTimeout(() => {
      onSwipe(top, direction)
      setExiting(null)
    }, EXIT_ANIMATION_MS)
  }

  if (!top) {
    return (
      <div className="deck-empty">
        <div className="deck-empty-emoji">🎉</div>
        <h2>全部チェックしました!</h2>
        <p>
          新しい募集が届くのをお待ちください。
          <br />
          「投稿」タブからあなたの募集を追加することもできます。
        </p>
      </div>
    )
  }

  return (
    <div className="deck-wrapper">
      <div className="deck">
        {opportunities.slice(0, 3).map((opp, i) => (
          <SwipeCard
            key={opp.id}
            opportunity={opp}
            isTop={i === 0}
            stackIndex={i}
            exitDirection={exiting?.id === opp.id ? exiting.direction : null}
            onSwipe={handleSwipe}
          />
        ))}
      </div>
      <div className="deck-actions">
        <button
          className="action-btn nope-btn"
          aria-label="スキップ"
          onClick={() => handleSwipe('nope')}
        >
          ✕
        </button>
        <button
          className="action-btn undo-btn"
          aria-label="ひとつ戻る"
          disabled={!onUndo || !!exiting}
          onClick={() => onUndo?.()}
        >
          ↩
        </button>
        <button
          className="action-btn like-btn"
          aria-label="興味あり"
          onClick={() => handleSwipe('like')}
        >
          ♥
        </button>
      </div>
      <p className="deck-remaining">のこり {opportunities.length} 件</p>
    </div>
  )
}
