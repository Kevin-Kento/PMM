export type Opportunity = {
  id: string
  title: string
  organization: string
  category: Category
  location: string
  date: string
  timeCommitment: string
  capacity: number
  description: string
  tags: string[]
  emoji: string
  gradient: [string, string]
}

export type Category =
  | '環境'
  | '福祉'
  | '子ども'
  | '災害支援'
  | '地域'
  | '動物'
  | 'スポーツ'
  | '国際協力'

export type SwipeDirection = 'like' | 'nope'

export type SwipeRecord = {
  opportunityId: string
  direction: SwipeDirection
  swipedAt: string
}
