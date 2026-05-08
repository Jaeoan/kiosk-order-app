import { useState, useEffect } from 'react'
import './App.css'
import { IntroScreen } from './IntroScreen'

const DESIGN_W = 768
const DESIGN_H = 1024

type Category = '커피' | '음료/티' | '디저트'

interface MenuItem {
  id: number
  name: string
  price: number
  emoji: string
  category: Category
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
}

const ALL_MENUS: MenuItem[] = [
  { id: 1, name: '에스프레소', price: 3000, emoji: '☕', category: '커피' },
  { id: 2, name: '아메리카노', price: 3500, emoji: '🍵', category: '커피' },
  { id: 3, name: '카페라떼', price: 4000, emoji: '🥛', category: '커피' },
  { id: 4, name: '바닐라 라떼', price: 4800, emoji: '🍦', category: '커피' },
  { id: 5, name: '카라멜 마끼아또', price: 5200, emoji: '🧋', category: '커피' },
  { id: 6, name: '녹차', price: 3000, emoji: '🍵', category: '음료/티' },
  { id: 7, name: '레모네이드', price: 3500, emoji: '🍋', category: '음료/티' },
  { id: 8, name: '딸기 에이드', price: 4000, emoji: '🍓', category: '음료/티' },
  { id: 9, name: '복숭아 티', price: 3800, emoji: '🍑', category: '음료/티' },
  { id: 10, name: '케이크', price: 5000, emoji: '🎂', category: '디저트' },
  { id: 11, name: '마카롱', price: 2500, emoji: '🍪', category: '디저트' },
  { id: 12, name: '쿠키', price: 2000, emoji: '🍩', category: '디저트' },
]

const CATEGORIES: { name: Category; icon: string; introEmoji: string }[] = [
  { name: '커피', icon: '☕', introEmoji: '☕' },
  { name: '음료/티', icon: '🥤', introEmoji: '🧋' },
  { name: '디저트', icon: '🎂', introEmoji: '🍰' },
]

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [category, setCategory] = useState<Category>('커피')
  const [cart, setCart] = useState<CartItem[]>([])
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const currentMenus = ALL_MENUS.filter(m => m.category === category)
  const total = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0)

  useEffect(() => {
    const update = () => {
      const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
      setScale(s)
      setOffset({
        x: (window.innerWidth - DESIGN_W * s) / 2,
        y: (window.innerHeight - DESIGN_H * s) / 2,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const addItem = (item: MenuItem) => {
    setCart(prev => {
      const found = prev.find(c => c.menuItem.id === item.id)
      if (found) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menuItem: item, quantity: 1 }]
    })
  }

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== id))
  }

  const handleOrder = () => {
    if (!cart.length) return
    alert(`주문 완료!\n총 금액: ${total.toLocaleString()}원`)
    setCart([])
  }

  const handleCancel = () => setCart([])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key)
      if (n >= 1 && n <= currentMenus.length) addItem(currentMenus[n - 1])
      if (e.key === '6') handleOrder()
      if (e.key === '8') handleCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMenus, cart])

  return (
    <div className="viewport">
      <div
        className="kiosk"
        style={{ transform: `scale(${scale})`, left: offset.x, top: offset.y }}
      >
        {/* Header */}
        <header className="k-header">
          <button className="back-btn" onClick={() => setShowIntro(true)}>← 0. 뒤로가기</button>
          <h1 className="k-title">주문하실 음료 종류를 선택해주세요</h1>
        </header>

        {/* Category Tabs */}
        <nav className="cat-tabs">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              className={`cat-tab${category === cat.name ? ' active' : ''}`}
              onClick={() => setCategory(cat.name)}
            >
              <span className="cat-icon-emoji">{cat.icon}</span>
              <span>{i + 1}. {cat.name}</span>
            </button>
          ))}
        </nav>

        {/* Main */}
        <main className="k-main">
          {/* Menu Grid */}
          <section className="menu-section">
            <div className="menu-grid">
              {currentMenus.map((item, idx) => (
                <button key={item.id} className="menu-card" onClick={() => addItem(item)}>
                  <span className="m-num">{idx + 1}</span>
                  <span className="m-emoji">{item.emoji}</span>
                  <span className="m-name">{item.name}</span>
                  <span className="m-price">{item.price.toLocaleString()}원</span>
                </button>
              ))}
            </div>
          </section>

          {/* Order Panel */}
          <aside className="order-panel">
            <div className="op-header">
              <span className="op-header-icon">🛍</span>
              <span>주문 내역</span>
            </div>
            <div className="op-items">
              {cart.length === 0 ? (
                <div className="op-empty">
                  <span className="op-empty-icon">🥤</span>
                  <p>선택한 메뉴가 없습니다.</p>
                </div>
              ) : (
                cart.map(c => (
                  <div key={c.menuItem.id} className="op-item">
                    <span className="oi-name">{c.menuItem.name}</span>
                    <span className="oi-qty">×{c.quantity}</span>
                    <span className="oi-price">{(c.menuItem.price * c.quantity).toLocaleString()}원</span>
                    <button className="oi-del" onClick={() => removeItem(c.menuItem.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
            <div className="op-footer">
              <div className="op-total-divider" />
              <div className="op-total">
                <span>합계</span>
                <span className="op-total-val">{total.toLocaleString()}원</span>
              </div>
              <button
                className={`op-order-btn${!cart.length ? ' disabled' : ''}`}
                onClick={handleOrder}
                disabled={!cart.length}
              >
                주문하기
              </button>
            </div>
          </aside>
        </main>

        {/* Bottom Bar */}
        <div className="k-bottom">
          <div className="k-hint">
            <div className="k-hint-top">
              <span className="spark">✦</span>
              <span>메뉴 번호</span>
              <span className="spark">✦</span>
            </div>
            <div className="k-hint-bot">
              <span className="k-range">1~{currentMenus.length}</span>
              <span className="k-select"> 선택</span>
            </div>
          </div>
          <div className="k-actions">
            <div className="k-act-wrap">
              <span className="k-act-badge badge-orange">6</span>
              <button className="k-act-btn btn-order" onClick={handleOrder}>
                <span className="k-act-icon">🛒</span>
                <span>주문하기</span>
              </button>
            </div>
            <div className="k-act-wrap">
              <span className="k-act-badge badge-yellow">7</span>
              <button className="k-act-btn btn-back" onClick={() => setShowIntro(true)}>
                <span className="k-act-icon">←</span>
                <span>뒤로가기</span>
              </button>
            </div>
            <div className="k-act-wrap">
              <span className="k-act-badge badge-pink">8</span>
              <button className="k-act-btn btn-cancel" onClick={handleCancel}>
                <span className="k-act-icon">✕</span>
                <span>취소하기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="k-footer">
          🪙 맛있는 음료와 함께 행복한 시간 되세요! 🧡 ✦
        </footer>

        {/* Intro Overlay */}
        {showIntro && (
          <IntroScreen onSelect={(cat) => { setCategory(cat); setShowIntro(false) }} />
        )}
      </div>
    </div>
  )
}

export default App
