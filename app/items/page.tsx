import { createClient } from "@/lib/supabase/server";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";

const CATEGORIES = [
  { label: "전체", value: "" },
  { label: "유니폼", value: "uniform" },
  { label: "졸업사진 드레스", value: "graduation" },
  { label: "코스프레", value: "cosplay" },
  { label: "기타", value: "other" },
];

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("items")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const VALID_CATEGORIES = ["uniform", "graduation", "cosplay", "other"] as const;
  type ValidCategory = (typeof VALID_CATEGORIES)[number];
  function isValidCategory(c: string): c is ValidCategory {
    return (VALID_CATEGORIES as readonly string[]).includes(c);
  }

  if (params.category && isValidCategory(params.category)) {
    query = query.eq("category", params.category);
  }
  if (params.q) query = query.ilike("title", `%${params.q}%`);

  const { data: items } = await query;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">의상 탐색</h1>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="의상 이름으로 검색..."
          className="w-full max-w-sm px-4 py-2 border border-[#E8DDD0] bg-[#FFFCF9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2335]/30 focus:border-[#9B2335]"
        />
        {params.category && <input type="hidden" name="category" value={params.category} />}
      </form>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => {
          const active = (params.category ?? "") === cat.value;
          return (
            <Link
              key={cat.value}
              href={cat.value ? `/items?category=${cat.value}` : "/items"}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? "bg-[#9B2335] text-white"
                  : "bg-[#FFFCF9] border border-[#E8DDD0] text-stone-600 hover:border-[#9B2335] hover:text-[#9B2335]"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Grid */}
      {items && items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">👗</div>
          <p>등록된 의상이 없어요</p>
        </div>
      )}
    </div>
  );
}
