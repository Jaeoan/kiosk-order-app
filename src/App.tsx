import { useState, useEffect } from 'react'
import './index.css'
import { IntroScreen } from './IntroScreen'

const DESIGN_W = 768
const DESIGN_H = 1024

export type Category = '커피' | '음료/티' | '디저트'

export interface MenuItem {
  id: number
  name: string
  price: number
  image: string
  category: Category
}

interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  temperature: 'ICE' | 'HOT'
  size: 'Small' | 'Medium' | 'Large'
}

type OptionStep = 'quantity' | 'temperature' | 'size'
type Temperature = CartItem['temperature']
type DrinkSize = CartItem['size']

const ALL_MENUS: MenuItem[] = [
  { id: 1,  name: '에스프레소',      price: 3000, image: '/menu/espresso.svg', category: '커피'   },
  { id: 2,  name: '아메리카노',      price: 3500, image: '/menu/americano.svg', category: '커피'   },
  { id: 3,  name: '카페라떼',        price: 4000, image: '/menu/cafe-latte.svg', category: '커피'   },
  { id: 4,  name: '바닐라 라떼',     price: 4800, image: '/menu/vanilla-latte.svg', category: '커피'   },
  { id: 5,  name: '카라멜 마끼아또', price: 5200, image: '/menu/caramel-macchiato.svg', category: '커피'   },
  { id: 6,  name: '녹차',            price: 3000, image: '/menu/green-tea.svg', category: '음료/티' },
  { id: 7,  name: '레모네이드',      price: 3500, image: '/menu/lemonade.svg', category: '음료/티' },
  { id: 8,  name: '딸기 에이드',     price: 4000, image: '/menu/strawberry-ade.svg', category: '음료/티' },
  { id: 9,  name: '복숭아 티',       price: 3800, image: '/menu/peach-tea.svg', category: '음료/티' },
  { id: 10, name: '케이크',          price: 5000, image: '/menu/cake.svg', category: '디저트'  },
  { id: 11, name: '마카롱',          price: 2500, image: '/menu/macaron.svg', category: '디저트'  },
  { id: 12, name: '쿠키',            price: 2000, image: '/menu/cookie.svg', category: '디저트'  },
]

const CATEGORIES: { name: Category; image: string }[] = [
  { name: '커피',    image: '/menu/category-coffee.svg' },
  { name: '음료/티', image: '/menu/category-drink.svg' },
  { name: '디저트',  image: '/menu/category-dessert.svg' },
]

export function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [category, setCategory] = useState<Category>('커피')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [optionStep, setOptionStep] = useState<OptionStep>('quantity')
  const [optionQuantity, setOptionQuantity] = useState(1)
  const [optionTemperature, setOptionTemperature] = useState<Temperature | null>(null)
  const [optionSize, setOptionSize] = useState<DrinkSize | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [cancelMode, setCancelMode] = useState(false)
  const [cancelingCartId, setCancelingCartId] = useState<string | null>(null)

  const currentMenus = ALL_MENUS.filter(m => m.category === category)
  const total = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0)

  const hoverSelectProps = (action: () => void, enabled = true) => {
    let timer: number | undefined
    const clear = () => {
      if (timer) window.clearTimeout(timer)
      timer = undefined
    }

    return {
      onClick: () => {
        clear()
        if (enabled) action()
      },
      onMouseEnter: () => {
        if (!enabled) return
        clear()
        timer = window.setTimeout(() => {
          timer = undefined
          action()
        }, 2000)
      },
      onMouseLeave: clear,
      onFocus: () => {
        if (!enabled) return
        clear()
        timer = window.setTimeout(() => {
          timer = undefined
          action()
        }, 2000)
      },
      onBlur: clear,
    }
  }

  useEffect(() => {
    const update = () => {
      const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
      setScale(s)
      setOffset({ x: (window.innerWidth - DESIGN_W * s) / 2, y: (window.innerHeight - DESIGN_H * s) / 2 })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const openOptionModal = (item: MenuItem) => {
    setSelectedItem(item)
    setOptionStep('quantity')
    setOptionQuantity(1)
    setOptionTemperature(null)
    setOptionSize(null)
  }

  const closeOptionModal = () => setSelectedItem(null)

  const addItem = (item: MenuItem, quantity = 1, temperature: Temperature = 'ICE', size: DrinkSize = 'Medium') => {
    const id = `${item.id}-${temperature}-${size}`
    setCart(prev => {
      const found = prev.find(c => c.id === id)
      if (found) return prev.map(c => c.id === id ? { ...c, quantity: c.quantity + quantity } : c)
      return [...prev, { id, menuItem: item, quantity, temperature, size }]
    })
  }

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id))

  const handleAddOptionItem = () => {
    if (!selectedItem || !optionTemperature || !optionSize) return
    addItem(selectedItem, optionQuantity, optionTemperature, optionSize)
    closeOptionModal()
  }

  const handleOrder = () => {
    if (!cart.length) return
    alert(`주문 완료!\n총 금액: ${total.toLocaleString()}원`)
    setCart([])
  }

  const handleCancel = () => {
    if (cart.length === 0) return
    setCancelMode(!cancelMode)
  }

  const handleCartItemCancel = (id: string) => {
    setCancelingCartId(id)
    setTimeout(() => {
      removeItem(id)
      setCancelingCartId(null)
    }, 400)
  }

  const goIntro = () => setShowIntro(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key)
      if (cancelMode) {
        if (n >= 1 && n <= cart.length) {
          const targetId = cart[n - 1].id
          setCancelingCartId(targetId)
          setTimeout(() => {
            removeItem(targetId)
            setCancelingCartId(null)
          }, 400)
        }
        if (e.key === '8') setCancelMode(false)
        return
      }
      if (selectedItem) {
        if (e.key === '8') closeOptionModal()
        if (optionStep === 'quantity') {
          if (n === 1) setOptionQuantity(q => Math.max(1, q - 1))
          if (n === 2) setOptionQuantity(q => Math.min(9, q + 1))
          if (n === 3) setOptionStep('temperature')
        }
        if (optionStep === 'temperature') {
          if (n === 1) setOptionTemperature('ICE')
          if (n === 2) setOptionTemperature('HOT')
          if (n === 3 && optionTemperature) setOptionStep('size')
        }
        if (optionStep === 'size') {
          if (n === 1 && optionSize) closeOptionModal()
          if (n === 2 && optionTemperature && optionSize) handleAddOptionItem()
          if (n === 3) setOptionSize('Small')
          if (n === 4) setOptionSize('Medium')
          if (n === 5) setOptionSize('Large')
        }
        return
      }
      if (n >= 1 && n <= currentMenus.length) openOptionModal(currentMenus[n - 1])
      if (e.key === '5') handleOrder()
      if (e.key === '8') handleCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMenus, cart, selectedItem, optionStep, optionTemperature, cancelMode])

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#C9A882] relative">
      <div
        className="kiosk absolute w-[768px] h-[1024px] bg-[#F7EEE3] flex flex-col overflow-hidden"
        style={{ transformOrigin: 'top left', transform: `scale(${scale})`, left: offset.x, top: offset.y }}
      >
        {/* ── Header ── */}
        <header className="px-6 pt-[24px] pb-[8px] flex flex-col gap-2">
          <h1 className="text-[21px] font-extrabold text-[#2E1B0E] text-center tracking-[-0.3px]">
            주문하실 음료 종류를 선택해주세요
          </h1>
        </header>

        {/* ── Category Tabs ── */}
        <nav className="flex gap-[10px] px-6 pt-2 pb-4">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={[
                'flex-1 flex items-center justify-center gap-[6px] relative cursor-pointer',
                'py-[11px] px-[6px] rounded-[14px] border-2',
                'text-[14px] font-bold transition-[background,color,border-color] duration-200',
                category === cat.name
                  ? 'bg-[#E07B39] border-[#E07B39] text-white cat-tab-active'
                  : 'bg-white border-[#DDD0C0] text-[#7A6A5A]',
              ].join(' ')}
            >
              <img
                src={cat.image}
                alt=""
                className="w-[28px] h-[28px] rounded-[9px] object-contain bg-white shadow-[0_2px_6px_rgba(60,35,18,0.16)]"
              />
              <span>{i + 1}. {cat.name}</span>
            </button>
          ))}
        </nav>

        {/* ── Main ── */}
        <main className="flex-1 flex gap-[14px] px-6 pt-[10px] pb-2 min-h-0 overflow-hidden">

          {/* Menu Grid */}
          <section className="flex-none w-[424px] overflow-y-auto scrollbar-kiosk pt-[6px]">
            <div className="grid grid-cols-2 gap-3 pb-2">
              {currentMenus.map((item, idx) => (
                <button
                  key={item.id}
                  {...hoverSelectProps(() => openOptionModal(item))}
                  className="group menu-card-draw-border bg-white border-2 border-[#EDE0D0] rounded-[18px] pt-[14px] px-[10px] pb-4 flex flex-col items-center gap-[7px] cursor-pointer relative shadow-[0_2px_8px_rgba(100,70,40,0.08)] transition-[transform,box-shadow,border-color] duration-[120ms] hover:-translate-y-[3px] hover:shadow-[0_6px_18px_rgba(100,70,40,0.15)] active:scale-[0.96]"
                >
                  <span className="absolute top-[10px] left-[10px] z-40 bg-[#E07B39] text-white w-7 h-7 rounded-[7px] text-[13px] font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="relative z-0 block w-full h-[112px] rounded-[14px] overflow-hidden bg-white mt-2 border border-[#F3E6D8]">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="text-[14px] font-bold text-[#2E1B0E] text-center leading-[1.3]">{item.name}</span>
                  <span className="text-[13px] font-bold text-[#E07B39]">{item.price.toLocaleString()}원</span>
                </button>
              ))}
            </div>
          </section>

          {/* Order Panel */}
          <aside className={`flex-1 rounded-[20px] flex flex-col overflow-hidden shadow-[0_2px_12px_rgba(100,70,40,0.08)] transition-all duration-300 ${
            cancelMode ? 'bg-[#FFF5F0] border-4 border-[#E07B39]' : 'bg-white border-2 border-[#EDE0D0]'
          }`}>

            <div className={`px-4 py-[14px] flex items-center gap-2 text-[15px] font-bold border-b-[1.5px] ${
              cancelMode ? 'text-[#E07B39] border-[#F0D8C0]' : 'text-[#2E1B0E] border-[#F0E4D4]'
            }`}>
              <span className="text-[18px]">{cancelMode ? '✕' : '🛍'}</span>
              <span>{cancelMode ? '메뉴 선택 취소' : '주문 내역'}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-[14px] py-[10px] min-h-0 scrollbar-kiosk">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-[#C0A898]">
                  <span className="text-[54px] opacity-30">🥤</span>
                  <p className="text-[12px] font-medium">선택한 메뉴가 없습니다.</p>
                </div>
              ) : (
                cart.map((c, idx) => {
                  const cartItemProps = cancelMode 
                    ? hoverSelectProps(() => handleCartItemCancel(c.id), true)
                    : {}

                  return (
                    <div key={c.id} {...cartItemProps} className={`flex items-center gap-[5px] py-2 rounded-[8px] px-2 mb-1 transition-all duration-300 ${
                      cancelingCartId === c.id
                        ? 'draw-hover-border border-2 border-[#E07B39] bg-[#FFE8DC] scale-95 opacity-0' 
                        : cancelMode 
                          ? 'border-2 border-[#F0D8C0] bg-[#FFF8F5] hover:bg-[#FFE8DC]' 
                          : 'border-0 bg-transparent'
                    }`}>
                      {cancelMode && (
                        <span className="shrink-0 w-6 h-6 rounded-full bg-[#E07B39] text-white text-[11px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                      )}
                      <span className="flex-1 text-[12px] font-semibold text-[#2E1B0E]">
                        {c.menuItem.name}
                        <span className="block text-[10px] font-medium text-[#9A8878]">{c.temperature} · {c.size}</span>
                      </span>
                      <span className="text-[11px] text-[#9A8878]">×{c.quantity}</span>
                      <span className="text-[12px] font-bold text-[#E07B39]">{(c.menuItem.price * c.quantity).toLocaleString()}원</span>
                      {!cancelMode && (
                        <button
                          onClick={() => removeItem(c.id)}
                          className="bg-transparent border-none text-[10px] text-[#C0A898] px-[5px] py-[3px] rounded cursor-pointer hover:bg-[#FFF0E8] hover:text-[#E07B39]"
                        >✕</button>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="px-[14px] py-3">
              <div className="border-t-[1.5px] border-dashed border-[#EDE0D0] mb-3" />
              <div className="flex justify-between items-center text-[14px] font-semibold text-[#2E1B0E] mb-[10px]">
                <span>합계</span>
                <span className="text-[18px] font-extrabold text-[#E07B39]">{total.toLocaleString()}원</span>
              </div>
              <button
                disabled={!cart.length || cancelMode}
                {...hoverSelectProps(handleOrder, Boolean(cart.length && !cancelMode))}
                className={[
                  'draw-hover-border draw-hover-border-white relative w-full py-[14px] rounded-xl text-[15px] font-bold text-white border-none cursor-pointer',
                  'flex items-center justify-center gap-[8px]',
                  'transition-[opacity,transform] duration-200',
                  cart.length && !cancelMode
                    ? 'bg-[#E07B39] hover:opacity-90 active:scale-[0.98]'
                    : 'bg-[#E07B39] opacity-60 cursor-not-allowed',
                ].join(' ')}
              >
                <span className="w-[24px] h-[24px] rounded-full bg-white text-[#E07B39] text-[13px] font-black flex items-center justify-center shadow-[0_2px_6px_rgba(80,40,20,0.18)]">
                  5
                </span>
                <span>주문하기</span>
              </button>
            </div>
          </aside>
        </main>

        {/* ── Bottom Bar ── */}
        <div className="bg-[#FFF6EE] border-t-2 border-[#EDE0D0] px-6 pt-[10px] pb-[14px] flex items-center gap-[14px]">

          <div className="shrink-0 text-center bg-[#FFF0E5] border-[1.5px] border-[#F0D8C0] rounded-[14px] px-[14px] py-2">
            <div className="flex items-center gap-1 text-[11px] text-[#7A6A5A] font-semibold justify-center mb-[2px]">
              <span className="text-[#E07B39] text-[8px]">✦</span>
              <span>메뉴 번호</span>
              <span className="text-[#E07B39] text-[8px]">✦</span>
            </div>
            <div className="flex items-baseline justify-center gap-[2px]">
              <span className="text-[24px] font-black text-[#E07B39] leading-none">1~{currentMenus.length}</span>
              <span className="text-[12px] font-semibold text-[#5C4535]"> 선택</span>
            </div>
          </div>

          <div className="flex gap-2 flex-1">
            {[
              { num: '7', label: '뒤로가기', icon: '←',  badge: 'bg-[#F5C842] text-[#3D2B1F]', btn: 'bg-[#FFFBEE] border-[#F5C842] text-[#9A8020] hover:bg-[#FFF5CC]', onClick: goIntro },
              { num: '8', label: cancelMode ? '취소 완료' : '메뉴 취소하기', icon: cancelMode ? '✓' : '✕',  badge: 'bg-[#D85858] text-white',   btn: 'bg-[#FFF2F2] border-[#F0B0B0] text-[#C04040] hover:bg-[#FFE4E4]', onClick: handleCancel },
            ].map(b => (
              <div key={b.num} className="flex-1 relative pt-3">
                <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-[26px] h-[26px] rounded-full ${b.badge} text-[13px] font-extrabold flex items-center justify-center z-10 shadow-[0_2px_6px_rgba(0,0,0,0.15)]`}>
                  {b.num}
                </span>
                <button
                  {...hoverSelectProps(b.onClick, b.num === '7' || cart.length > 0)}
                  className={[
                    'draw-hover-border relative w-full flex flex-col items-center justify-center gap-[3px] py-[10px] px-[6px] rounded-[14px] border-2',
                    (b.num === '7' || cart.length > 0) ? b.btn : 'bg-[#FFF2F2] border-[#F0B0B0] text-[#C04040] opacity-50 cursor-not-allowed',
                    'text-[13px] font-bold cursor-pointer active:scale-95 transition-[transform,opacity] duration-100'
                  ].join(' ')}
                >
                  <span className="text-[20px] leading-none">{b.icon}</span>
                  <span>{b.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="py-2 text-center text-[11px] text-[#9A8878] bg-[#FFF6EE] border-t border-[#EDE0D0]">
          🪙 맛있는 음료와 함께 행복한 시간 되세요! 🧡 ✦
        </footer>

        {selectedItem && (
          <div className="absolute inset-0 z-[90] bg-[rgba(22,16,10,0.46)] flex items-center justify-center px-6">
            <div className="w-[392px] h-[610px] bg-[#FFFDF9] rounded-[20px] shadow-[0_18px_55px_rgba(0,0,0,0.35)] border border-[#F4D8BC] px-[20px] pt-[18px] pb-[16px] text-[#3B2415] flex flex-col">
              <div className="relative flex items-center justify-center mb-4 shrink-0">
                <h2 className="text-[24px] font-black tracking-[-0.4px]">{selectedItem.name} 선택</h2>
                <button
                  onClick={closeOptionModal}
                  className="draw-hover-border absolute right-0 top-[-4px] w-9 h-9 rounded-[9px] flex items-center justify-center text-[30px] leading-none text-[#6B3B1F] bg-transparent border-none cursor-pointer"
                  aria-label="옵션 선택 닫기"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <section className="h-[138px] pb-[14px] border-b border-dashed border-[#EED8C3] option-stage-enter">
                  <div className="flex items-center gap-2 text-[14px] font-extrabold mb-[12px]">
                    <span className="text-[#FF6A1A]">✦</span>
                    <span>수량</span>
                  </div>
                  <div className="grid grid-cols-[78px_1fr_78px] gap-2 items-center">
                    <button
                      {...hoverSelectProps(() => setOptionQuantity(q => Math.max(1, q - 1)))}
                      className="draw-hover-border relative h-[44px] rounded-[10px] bg-[#FFF8F0] border border-[#F0D8C2] text-[20px] font-black text-[#6B3B1F] cursor-pointer"
                    >
                      <span className="mr-2 text-[12px] text-[#9A8878]">1</span>−
                    </button>
                    <div className="h-[44px] rounded-[10px] border border-[#F0D8C2] bg-white flex items-center justify-center text-[24px] font-black">
                      {optionQuantity}
                    </div>
                    <button
                      {...hoverSelectProps(() => setOptionQuantity(q => Math.min(9, q + 1)))}
                      className="draw-hover-border relative h-[44px] rounded-[10px] bg-[#FFF1E6] border border-[#F0D8C2] text-[22px] font-black text-[#FF6A1A] cursor-pointer"
                    >
                      <span className="mr-2 text-[12px] text-[#9A8878]">2</span>+
                    </button>
                  </div>
                  <button
                    {...hoverSelectProps(() => setOptionStep('temperature'))}
                    className="draw-hover-border draw-hover-border-wide relative mt-[10px] w-full h-[40px] rounded-[10px] border border-[#FFB077] bg-[#FFF5EB] text-[#E85C12] text-[14px] font-extrabold cursor-pointer"
                  >
                    3. 선택완료
                  </button>
                </section>

                <section className="h-[142px] py-[14px] border-b border-dashed border-[#EED8C3]">
                  {(optionStep === 'temperature' || optionStep === 'size') && (
                    <div className="option-stage-enter">
                      <div className="flex items-center gap-2 text-[14px] font-extrabold mb-[12px]">
                        <span className="text-[#FF6A1A]">✦</span>
                        <span>온도</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { num: 1, value: 'ICE' as Temperature, icon: '❄', color: 'text-[#3488FF]', active: 'border-[#5A96FF] bg-[#F1F7FF]' },
                          { num: 2, value: 'HOT' as Temperature, icon: '♨', color: 'text-[#FF5C15]', active: 'border-[#FF8A45] bg-[#FFF6EE]' },
                        ].map(t => (
                          <button
                            key={t.value}
                            {...hoverSelectProps(() => setOptionTemperature(t.value))}
                            className={[
                              'draw-hover-border relative h-[48px] rounded-[10px] border text-[16px] font-black cursor-pointer bg-white',
                              optionTemperature === t.value ? t.active : 'border-[#EED8C3]',
                            ].join(' ')}
                          >
                            <span className="mr-2 text-[12px] text-[#9A8878]">{t.num}</span>
                            <span className={t.color}>{t.icon} {t.value}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        {...hoverSelectProps(() => optionTemperature && setOptionStep('size'), Boolean(optionTemperature))}
                        disabled={!optionTemperature}
                        className={[
                          'draw-hover-border draw-hover-border-wide relative mt-[10px] w-full h-[38px] rounded-[10px] border text-[14px] font-extrabold cursor-pointer',
                          optionTemperature ? 'border-[#FFB077] bg-[#FFF5EB] text-[#E85C12]' : 'border-[#E1D6CC] bg-[#F4EEE8] text-[#B6A79B] cursor-not-allowed',
                        ].join(' ')}
                      >
                        3. 선택완료
                      </button>
                    </div>
                  )}
                </section>

                <section className="h-[126px] py-[14px]">
                  {optionStep === 'size' && (
                    <div className="option-stage-enter">
                      <div className="flex items-center gap-2 text-[14px] font-extrabold mb-[12px]">
                        <span className="text-[#FF6A1A]">✦</span>
                        <span>사이즈</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Small', 'Medium', 'Large'] as DrinkSize[]).map((size, idx) => (
                          <button
                            key={size}
                            {...hoverSelectProps(() => setOptionSize(size))}
                            className={[
                              'draw-hover-border relative h-[56px] rounded-[10px] border bg-white text-[12px] font-bold cursor-pointer',
                              optionSize === size ? 'border-[#FF6A1A] text-[#FF5C15] bg-[#FFF7EF]' : 'border-[#EED8C3]',
                            ].join(' ')}
                          >
                            <span className="block text-[11px] text-[#9A8878] mb-[4px]">{idx + 3}</span>
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <div className="h-[44px] rounded-[10px] bg-[#FFF8F0] border border-[#F2DFC9] flex items-center justify-between px-3 mb-[12px] shrink-0">
                <span className="text-[14px] font-extrabold">가격</span>
                <span className="text-[24px] font-black text-[#FF5C15]">{(selectedItem.price * optionQuantity).toLocaleString()}원</span>
              </div>

              <div className="grid grid-cols-2 gap-[10px] shrink-0">
                <button
                  {...hoverSelectProps(closeOptionModal)}
                  className="draw-hover-border relative h-[48px] rounded-[10px] border border-[#E7C39D] bg-[#FFF6E9] text-[17px] font-black text-[#5B3924] cursor-pointer"
                >
                  <span className="mr-2 text-[12px] text-[#9A8878]">1</span>
                  취소
                </button>
                <button
                  disabled={!optionTemperature || !optionSize}
                  {...hoverSelectProps(handleAddOptionItem, Boolean(optionTemperature && optionSize))}
                  className={[
                    'draw-hover-border relative h-[48px] rounded-[10px] border-none text-[17px] font-black text-white cursor-pointer',
                    optionTemperature && optionSize ? 'bg-[#FF6417]' : 'bg-[#CFC5BD] cursor-not-allowed',
                  ].join(' ')}
                >
                  <span className="mr-2 text-[12px] text-white/80">2</span>
                  담기
                </button>
              </div>
            </div>
          </div>
        )}

        {showIntro && (
          <IntroScreen
            pendingCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onSelect={(cat) => { setCategory(cat); setShowIntro(false) }}
          />
        )}
      </div>
    </div>
  )
}

export default App
