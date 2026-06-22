import Link from "next/link";

const CATEGORIES = [
  { label: "유니폼", emoji: "👔", value: "uniform" },
  { label: "졸업사진 드레스", emoji: "👗", value: "graduation" },
  { label: "코스프레", emoji: "🎭", value: "cosplay" },
  { label: "기타", emoji: "✨", value: "other" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#F0E8DF] border-b border-[#E8DDD0]">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            특별한 날의 의상,<br />
            <span className="text-[#9B2335]">이웃과 나눠요</span>
          </h1>
          <p className="text-stone-500 text-lg mb-8">
            유니폼, 졸업사진 드레스, 코스프레 의상을 저렴하게 빌리고 빌려주세요
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/items"
              className="bg-[#9B2335] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#7A1A29] transition-colors shadow-sm"
            >
              의상 둘러보기
            </Link>
            <Link
              href="/items/new"
              className="border border-[#E8DDD0] text-stone-700 bg-[#FFFCF9] px-6 py-3 rounded-xl font-medium hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
            >
              내 옷 등록하기
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-6">카테고리</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/items?category=${cat.value}`}
              className="bg-[#FFFCF9] rounded-xl border border-[#E8DDD0] p-6 text-center hover:border-[#9B2335] hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="font-medium text-sm">{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F0E8DF] border-t border-b border-[#E8DDD0] py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-8 text-center">이용 방법</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { step: "1", title: "의상 찾기", desc: "원하는 의상을 검색하고 캘린더에서 가능한 날짜를 확인해요" },
              { step: "2", title: "보증금 결제", desc: "대여 신청 시 보증금을 결제하고 대여자의 승인을 기다려요" },
              { step: "3", title: "반납 후 환불", desc: "의상을 반납하면 보증금이 자동으로 환불돼요" },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div className="w-10 h-10 bg-[#9B2335]/10 text-[#9B2335] rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-stone-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
