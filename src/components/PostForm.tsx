import { useState } from 'react'
import type { Category, Opportunity } from '../types'

type Props = {
  onSubmit: (opportunity: Opportunity) => void
}

const CATEGORIES: Category[] = [
  '環境',
  '福祉',
  '子ども',
  '災害支援',
  '地域',
  '動物',
  'スポーツ',
  '国際協力',
]

const CATEGORY_STYLE: Record<Category, { emoji: string; gradient: [string, string] }> = {
  環境: { emoji: '🌱', gradient: ['#11998e', '#38ef7d'] },
  福祉: { emoji: '🤝', gradient: ['#654ea3', '#eaafc8'] },
  子ども: { emoji: '🧒', gradient: ['#f7971e', '#ffd200'] },
  災害支援: { emoji: '🚨', gradient: ['#ff9966', '#ff5e62'] },
  地域: { emoji: '🏘️', gradient: ['#ee0979', '#ff6a00'] },
  動物: { emoji: '🐾', gradient: ['#c471f5', '#fa71cd'] },
  スポーツ: { emoji: '⚽', gradient: ['#f953c6', '#b91d73'] },
  国際協力: { emoji: '🌏', gradient: ['#00c6ff', '#0072ff'] },
}

export function PostForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [category, setCategory] = useState<Category>('地域')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [timeCommitment, setTimeCommitment] = useState('')
  const [capacity, setCapacity] = useState('10')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const style = CATEGORY_STYLE[category]
    onSubmit({
      id: `user-${Date.now()}`,
      title: title.trim(),
      organization: organization.trim() || '個人主催',
      category,
      location: location.trim(),
      date: date.trim(),
      timeCommitment: timeCommitment.trim() || '未定',
      capacity: Math.max(1, Number(capacity) || 1),
      description: description.trim(),
      tags: tags
        .split(/[、,\s]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5),
      emoji: style.emoji,
      gradient: style.gradient,
    })
    setTitle('')
    setOrganization('')
    setLocation('')
    setDate('')
    setTimeCommitment('')
    setCapacity('10')
    setDescription('')
    setTags('')
    setSubmitted(true)
    window.setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2 className="section-title">募集を投稿する</h2>
      <p className="form-lead">あなたのボランティア募集をカードにして、みんなのデッキに届けよう。</p>

      {submitted && <div className="form-success">✅ 投稿しました!スワイプ画面に追加されています。</div>}

      <label>
        タイトル <span className="required">必須</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 公園の花壇づくりを手伝ってください"
          required
          maxLength={40}
        />
      </label>

      <label>
        主催者・団体名
        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="例: 〇〇町内会(空欄なら「個人主催」)"
          maxLength={30}
        />
      </label>

      <label>
        カテゴリー
        <div className="category-picker">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              className={`category-chip ${category === c ? 'selected' : ''}`}
              onClick={() => setCategory(c)}
            >
              {CATEGORY_STYLE[c].emoji} {c}
            </button>
          ))}
        </div>
      </label>

      <label>
        場所 <span className="required">必須</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例: 東京都 渋谷区 / オンライン"
          required
          maxLength={40}
        />
      </label>

      <div className="form-row">
        <label>
          日時 <span className="required">必須</span>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="例: 2026-10-01 (木) 10:00"
            required
            maxLength={30}
          />
        </label>
        <label>
          所要時間
          <input
            value={timeCommitment}
            onChange={(e) => setTimeCommitment(e.target.value)}
            placeholder="例: 約2時間"
            maxLength={20}
          />
        </label>
      </div>

      <label>
        募集人数
        <input
          type="number"
          min={1}
          max={999}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </label>

      <label>
        募集内容 <span className="required">必須</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="活動内容、持ち物、注意事項などを書いてください"
          required
          rows={4}
          maxLength={400}
        />
      </label>

      <label>
        タグ(スペース・読点区切り、最大5つ)
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="例: 初心者歓迎 屋外 学生歓迎"
        />
      </label>

      <button type="submit" className="submit-btn">
        🚀 デッキに追加する
      </button>
    </form>
  )
}
