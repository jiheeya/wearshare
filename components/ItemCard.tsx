import Link from "next/link";
import Image from "next/image";
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
    <Link href={`/items/${item.id}`} className="group bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {thumb ? (
          <Image
            src={thumb}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            👗
          </div>
        )}
      </div>
      <div className="p-3">
        <span className="text-xs text-rose-500 font-medium">
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
        <h3 className="font-semibold text-sm mt-0.5 line-clamp-1">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">사이즈 {item.size}</p>
        <p className="text-sm font-bold text-gray-800 mt-1">
          보증금 {item.deposit_amount.toLocaleString()}원
        </p>
      </div>
    </Link>
  );
}
