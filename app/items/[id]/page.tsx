import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBlockedDates } from "@/lib/availability";
import RentalPanel from "@/components/RentalPanel";

const CATEGORY_LABEL: Record<string, string> = {
  uniform: "유니폼",
  graduation: "졸업사진 드레스",
  cosplay: "코스프레",
  other: "기타",
};

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: item }, { data: { user } }] = await Promise.all([
    supabase.from("items").select("*").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);

  if (!item) notFound();

  const [{ data: availabilities }, { data: rentals }] = await Promise.all([
    supabase.from("availabilities").select("*").eq("item_id", id),
    supabase
      .from("rentals")
      .select("*")
      .eq("item_id", id)
      .eq("status", "approved"),
  ]);

  const { availableDates } = getBlockedDates(
    availabilities ?? [],
    rentals ?? [],
    item.handover_days
  );

  const isOwner = user?.id === item.owner_id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {sp.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          결제가 취소되었거나 실패했어요
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-2">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {item.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                👗
              </div>
            )}
          </div>
          {item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {item.images.slice(1).map((url, i) => (
                <div key={i} className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <span className="text-sm text-rose-500 font-medium">
              {CATEGORY_LABEL[item.category] ?? item.category}
            </span>
            <h1 className="text-2xl font-bold mt-1">{item.title}</h1>
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>사이즈: <strong>{item.size}</strong></span>
            <span>수령/반납 버퍼: <strong>{item.handover_days}일</strong></span>
          </div>

          <div className="bg-rose-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">보증금</p>
            <p className="text-2xl font-bold text-rose-600">
              {item.deposit_amount.toLocaleString()}원
            </p>
            <p className="text-xs text-gray-400 mt-1">반납 확인 후 전액 환불</p>
          </div>

          {item.description && (
            <div>
              <h2 className="font-semibold text-sm text-gray-500 mb-1">상세 설명</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          {isOwner ? (
            <div className="space-y-2">
              <Link
                href={`/items/${id}/edit`}
                className="block w-full text-center border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                수정하기
              </Link>
              <Link
                href="/my"
                className="block w-full text-center bg-rose-500 text-white py-2.5 rounded-xl font-medium hover:bg-rose-600 transition-colors text-sm"
              >
                대여 신청 관리
              </Link>
            </div>
          ) : (
            <RentalPanel
              item={item}
              availableDates={availableDates}
              userId={user?.id ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
