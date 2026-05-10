import type { Category } from './App'

interface Props {
  onSelect: (category: Category) => void
  pendingCount?: number
}

const INTRO_CATS: { num: number; name: Category; image: string }[] = [
  { num: 1, name: '커피',    image: '/menu/category-coffee.svg' },
  { num: 2, name: '음료/티', image: '/menu/category-drink.svg' },
  { num: 3, name: '디저트',  image: '/menu/category-dessert.svg' },
]

export function IntroScreen({ onSelect, pendingCount = 0 }: Props) {
  const hoverSelectProps = (action: () => void) => {
    let timer: number | undefined
    const clear = () => {
      if (timer) window.clearTimeout(timer)
      timer = undefined
    }

    return {
      onClick: () => {
        clear()
        action()
      },
      onMouseEnter: () => {
        clear()
        timer = window.setTimeout(() => {
          timer = undefined
          action()
        }, 2000)
      },
      onMouseLeave: clear,
      onFocus: () => {
        clear()
        timer = window.setTimeout(() => {
          timer = undefined
          action()
        }, 2000)
      },
      onBlur: clear,
    }
  }

  return (
    <div className="absolute inset-0 bg-[#16100A] flex flex-col items-center justify-center gap-[56px] z-[100] animate-fade-in">

      <h1 className="text-[38px] font-black text-[#F5EDE0] text-center leading-[1.4] tracking-[-0.5px] animate-slide-up">
        주문하실<br />음료 종류를 선택해주세요
      </h1>

      <div className="flex gap-5">
        {INTRO_CATS.map((cat, i) => (
          <button
            key={cat.name}
            className="draw-hover-border relative w-[178px] h-[224px] bg-[#F5EDE0] border-none rounded-[24px] flex flex-col items-center justify-start pt-[18px] pb-4 px-3 gap-[10px] cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.55)] animate-card hover:-translate-y-[7px] hover:scale-[1.03] hover:shadow-[0_20px_56px_rgba(0,0,0,0.65)] active:scale-[0.96] transition-[transform,box-shadow] duration-[180ms]"
            style={{ animationDelay: `${0.55 + i * 0.18}s` }}
            {...hoverSelectProps(() => onSelect(cat.name))}
          >
            <span className="text-[16px] font-extrabold text-[#2E1B0E]">{cat.num}. {cat.name}</span>
            <span className="w-full flex-1 rounded-[18px] overflow-hidden bg-white mt-[4px] border border-[#E8D7C3]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain"
              />
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[14px] text-[#6A5A50] font-medium animate-hint">
        <span className="text-[18px]">🥤</span>
        <span>원하시는 메뉴를 선택해 주세요</span>
      </div>

      {pendingCount > 0 && (
        <div className="animate-hint bg-[#FFF6EE] border-2 border-[#E07B39] text-[#2E1B0E] rounded-[18px] px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)] text-[16px] font-extrabold">
          {pendingCount}개 주문내역이 있습니다
        </div>
      )}
    </div>
  )
}
