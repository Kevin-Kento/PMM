import type { Opportunity } from '../types'

type Props = {
  liked: Opportunity[]
  onRemove: (id: string) => void
}

export function LikedList({ liked, onRemove }: Props) {
  if (liked.length === 0) {
    return (
      <div className="deck-empty">
        <div className="deck-empty-emoji">💌</div>
        <h2>まだ「興味あり」がありません</h2>
        <p>気になる募集を右にスワイプすると、ここに保存されます。</p>
      </div>
    )
  }

  return (
    <div className="liked-list">
      <h2 className="section-title">興味ありリスト ({liked.length})</h2>
      {liked.map((opp) => (
        <div
          key={opp.id}
          className="liked-item"
          style={{
            borderImage: `linear-gradient(160deg, ${opp.gradient[0]}, ${opp.gradient[1]}) 1`,
          }}
        >
          <div className="liked-emoji" aria-hidden="true">
            {opp.emoji}
          </div>
          <div className="liked-info">
            <span className="card-category small">{opp.category}</span>
            <h3>{opp.title}</h3>
            <p className="liked-org">{opp.organization}</p>
            <p className="liked-meta">
              📍 {opp.location} / 🗓️ {opp.date}
            </p>
            <p className="liked-description">{opp.description}</p>
          </div>
          <button
            className="liked-remove"
            aria-label={`${opp.title} をリストから外す`}
            onClick={() => onRemove(opp.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
