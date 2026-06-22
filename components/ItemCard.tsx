import Link from "next/link";
import type { Item } from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  uniform: "유니폼",
  graduation: "졸업사진 드레스",
  cosplay: "코스프레",
  other: "기타",
};

export default function ItemCard({ item }: { item: Item }) {
  const thumb = item.images[0];

  return (
    <Link href={`/items/${item.id}`} className="group bg-[#FFFCF9] rounded-xl border border-[#E8DDD0] overflow-hidden hover:border-[#9B2335] hover:shadow-md transition-all">
      <div className="aspect-square bg-[#F0E8DF] relative overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
            👗
          </div>
        )}
      </div>
      <div className="p-3">
        <span className="text-xs text-[#9B2335] font-medium">
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
        <h3 className="font-semibold text-sm mt-0.5 line-clamp-1">{item.title}</h3>
        <p className="text-xs text-stone-400 mt-0.5">사이즈 {item.size}</p>
        <p className="text-sm font-bold text-stone-800 mt-1">
          {item.rental_fee_per_day > 0
            ? `${item.rental_fee_per_day.toLocaleString()}원/일`
            : "대여비 무료"}
        </p>
        <p className="text-xs text-stone-400">보증금 {item.deposit_amount.toLocaleString()}원</p>
      </div>
    </Link>
  );
}
