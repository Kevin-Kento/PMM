import { useMemo, useState } from 'react'
import { LikedList } from './components/LikedList'
import { PostForm } from './components/PostForm'
import { SwipeDeck } from './components/SwipeDeck'
import { seedOpportunities } from './data/opportunities'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Opportunity, SwipeDirection, SwipeRecord } from './types'

type Tab = 'swipe' | 'liked' | 'post'

export default function App() {
  const [tab, setTab] = useState<Tab>('swipe')
  const [userPosts, setUserPosts] = useLocalStorage<Opportunity[]>('voluntinder:posts', [])
  const [swipes, setSwipes] = useLocalStorage<SwipeRecord[]>('voluntinder:swipes', [])

  const allOpportunities = useMemo(
    () => [...userPosts, ...seedOpportunities],
    [userPosts],
  )

  const swipedIds = useMemo(() => new Set(swipes.map((s) => s.opportunityId)), [swipes])

  const remaining = useMemo(
    () => allOpportunities.filter((o) => !swipedIds.has(o.id)),
    [allOpportunities, swipedIds],
  )

  const liked = useMemo(() => {
    const likedIds = new Set(swipes.filter((s) => s.direction === 'like').map((s) => s.opportunityId))
    return allOpportunities.filter((o) => likedIds.has(o.id))
  }, [allOpportunities, swipes])

  const handleSwipe = (opportunity: Opportunity, direction: SwipeDirection) => {
    setSwipes((prev) => [
      ...prev,
      { opportunityId: opportunity.id, direction, swipedAt: new Date().toISOString() },
    ])
  }

  const handleUndo = swipes.length > 0 ? () => setSwipes((prev) => prev.slice(0, -1)) : null

  const handleRemoveLiked = (id: string) => {
    setSwipes((prev) => prev.filter((s) => !(s.opportunityId === id && s.direction === 'like')))
  }

  const handlePost = (opportunity: Opportunity) => {
    setUserPosts((prev) => [opportunity, ...prev])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">
          <span className="logo-mark">🤝</span> Voluntinder
        </h1>
        <p className="logo-sub">ボランティンダー — スワイプで見つける、あなたのボランティア</p>
      </header>

      <main className="app-main">
        {tab === 'swipe' && (
          <SwipeDeck opportunities={remaining} onSwipe={handleSwipe} onUndo={handleUndo} />
        )}
        {tab === 'liked' && <LikedList liked={liked} onRemove={handleRemoveLiked} />}
        {tab === 'post' && <PostForm onSubmit={handlePost} />}
      </main>

      <nav className="tab-bar">
        <button className={tab === 'swipe' ? 'active' : ''} onClick={() => setTab('swipe')}>
          <span className="tab-icon">🃏</span>
          さがす
        </button>
        <button className={tab === 'liked' ? 'active' : ''} onClick={() => setTab('liked')}>
          <span className="tab-icon">💖</span>
          興味あり
          {liked.length > 0 && <span className="tab-count">{liked.length}</span>}
        </button>
        <button className={tab === 'post' ? 'active' : ''} onClick={() => setTab('post')}>
          <span className="tab-icon">📝</span>
          投稿
        </button>
      </nav>
    </div>
  )
}
