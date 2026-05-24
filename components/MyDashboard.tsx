"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { approveRental, rejectRental, completeAndRefund } from "@/app/my/actions";
import type { Item, Rental } from "@/types";

type RentalWithProfile = Rental & { profiles: { username: string } | null };
type ItemWithRentals = Item & { rentals: RentalWithProfile[] };
type RentalWithItem = Rental & {
  items: Pick<Item, "title" | "images" | "deposit_amount" | "category" | "size"> | null;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "결제 대기", color: "bg-yellow-100 text-yellow-700" },
  pending: { label: "승인 대기", color: "bg-blue-100 text-blue-700" },
  approved: { label: "승인됨", color: "bg-green-100 text-green-700" },
  rejected: { label: "거절됨", color: "bg-red-100 text-red-700" },
  returned: { label: "반납됨", color: "bg-purple-100 text-purple-700" },
  completed: { label: "완료", color: "bg-gray-100 text-gray-600" },
};

function StatusBadge({ status }: { status: string }) {
  const { label, color } = STATUS_LABEL[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

function dateRange(start: string, end: string) {
  const s = format(parseISO(start), "MM/dd", { locale: ko });
  const e = format(parseISO(end), "MM/dd", { locale: ko });
  return s === e ? s : `${s} ~ ${e}`;
}

// ── Owner's incoming rental row ──
function IncomingRentalRow({ rental }: { rental: RentalWithProfile }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 text-sm">
      <div>
        <p className="font-medium">{rental.profiles?.username ?? "알 수 없음"}</p>
        <p className="text-gray-500">{dateRange(rental.start_date, rental.end_date)}</p>
        <StatusBadge status={rental.status} />
      </div>
      <div className="flex gap-2">
        {rental.status === "pending" && (
          <>
            <button
              disabled={pending}
              onClick={() => startTransition(() => approveRental(rental.id))}
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50"
            >
              승인
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => rejectRental(rental.id))}
              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
            >
              거절
            </button>
          </>
        )}
        {rental.status === "approved" && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => completeAndRefund(rental.id))}
            className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600 disabled:opacity-50"
          >
            {pending ? "처리 중..." : "반납 확인 + 환불"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── My items tab ──
function MyItemsTab({ items }: { items: ItemWithRentals[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="mb-3">등록한 의상이 없어요</p>
        <Link
          href="/items/new"
          className="text-rose-500 font-medium hover:underline text-sm"
        >
          첫 의상 등록하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const activeRentals = item.rentals.filter((r) =>
          ["pending", "approved"].includes(r.status)
        );
        return (
          <div key={item.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                {item.images[0] ? (
                  <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">
                    👗
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                <p className="text-xs text-gray-500">보증금 {item.deposit_amount.toLocaleString()}원</p>
              </div>
              <Link
                href={`/items/${item.id}/edit`}
                className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
              >
                수정
              </Link>
            </div>
            {activeRentals.length > 0 ? (
              <div className="px-4">
                {activeRentals.map((r) => (
                  <IncomingRentalRow key={r.id} rental={r} />
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-xs text-gray-400">대여 신청이 없어요</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── My rentals tab ──
function MyRentalsTab({ rentals }: { rentals: RentalWithItem[] }) {
  if (rentals.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="mb-3">대여 신청 내역이 없어요</p>
        <Link
          href="/items"
          className="text-rose-500 font-medium hover:underline text-sm"
        >
          의상 탐색하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rentals.map((rental) => (
        <div key={rental.id} className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
            {rental.items?.images?.[0] ? (
              <Image src={rental.items.images[0]} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">
                👗
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{rental.items?.title ?? "의상"}</h3>
            <p className="text-xs text-gray-500">
              {dateRange(rental.start_date, rental.end_date)} · 보증금{" "}
              {rental.deposit_amount.toLocaleString()}원
            </p>
          </div>
          <StatusBadge status={rental.status} />
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ──
export default function MyDashboard({
  myItems,
  myRentals,
}: {
  myItems: ItemWithRentals[];
  myRentals: RentalWithItem[];
}) {
  const [tab, setTab] = useState<"items" | "rentals">("items");

  const pendingCount = myItems.reduce(
    (acc, item) => acc + item.rentals.filter((r) => r.status === "pending").length,
    0
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(["items", "rentals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-rose-500 text-rose-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "items" ? (
              <>
                내 옷{" "}
                {pendingCount > 0 && (
                  <span className="ml-1 bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                    {pendingCount}
                  </span>
                )}
              </>
            ) : (
              "내 신청"
            )}
          </button>
        ))}
      </div>

      {tab === "items" ? (
        <MyItemsTab items={myItems} />
      ) : (
        <MyRentalsTab rentals={myRentals} />
      )}
    </div>
  );
}
