import './IntroScreen.css'

type Category = '커피' | '음료/티' | '디저트'

interface Props {
  onSelect: (category: Category) => void
}

const INTRO_CATS: { name: Category; emoji: string; num: number }[] = [
  { num: 1, name: '커피',   emoji: '☕' },
  { num: 2, name: '음료/티', emoji: '🧋' },
  { num: 3, name: '디저트', emoji: '🍰' },
]

export function IntroScreen({ onSelect }: Props) {
  return (
    <div className="intro-overlay">
      <h1 className="intro-title">
        주문하실<br />음료 종류를 선택해주세요
      </h1>

      <div className="intro-cards">
        {INTRO_CATS.map((cat, i) => (
          <button
            key={cat.name}
            className="intro-card"
            style={{ animationDelay: `${0.55 + i * 0.18}s` }}
            onClick={() => onSelect(cat.name)}
          >
            <span className="intro-card-label">{cat.num}. {cat.name}</span>
            <span className="intro-card-emoji">{cat.emoji}</span>
          </button>
        ))}
      </div>

      <div className="intro-hint">
        <span className="intro-hint-icon">🥤</span>
        <span>원하시는 메뉴를 선택해 주세요</span>
      </div>
    </div>
  )
}
