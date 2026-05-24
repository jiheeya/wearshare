"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import AvailabilityCalendar from "./AvailabilityCalendar";
import type { Item } from "@/types";

interface Props {
  item: Item;
  availableDates: Date[];
  userId: string | null;
}

type Step = "calendar" | "summary" | "payment";

export default function RentalPanel({ item, availableDates, userId }: Props) {
  const router = useRouter();
  const paymentWidgetRef = useRef<unknown>(null);
  const [step, setStep] = useState<Step>("calendar");
  const [range, setRange] = useState<DateRange | undefined>();
  const [rentalId, setRentalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canProceed = range?.from != null;

  async function createRentalAndPay() {
    if (!userId || !range?.from) return;
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: rental, error: rentalErr } = await supabase
        .from("rentals")
        .insert({
          item_id: item.id,
          borrower_id: userId,
          start_date: format(range.from, "yyyy-MM-dd"),
          end_date: format(range.to ?? range.from, "yyyy-MM-dd"),
          deposit_amount: item.deposit_amount,
          status: "pending_payment",
          payment_status: "unpaid",
        })
        .select()
        .single();

      if (rentalErr) throw rentalErr;
      setRentalId(rental.id);
      setStep("payment");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step !== "payment" || !rentalId) return;

    async function initToss() {
      const { loadPaymentWidget } = await import("@tosspayments/payment-widget-sdk");
      const widget = await loadPaymentWidget(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
        userId!
      );
      widget.renderPaymentMethods("#payment-widget", { value: item.deposit_amount });
      paymentWidgetRef.current = widget;
    }

    initToss().catch(console.error);
  }, [step, rentalId, userId, item.deposit_amount]);

  async function requestPayment() {
    if (!paymentWidgetRef.current || !rentalId) return;
    try {
      const widget = paymentWidgetRef.current as {
        requestPayment: (opts: Record<string, unknown>) => Promise<void>;
      };
      await widget.requestPayment({
        orderId: rentalId,
        orderName: `wearshare - ${item.title}`,
        successUrl: `${window.location.origin}/items/${item.id}/payment/success`,
        failUrl: `${window.location.origin}/items/${item.id}?error=payment_failed`,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "결제 중 오류가 발생했어요");
    }
  }

  if (!userId) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center">
        <p className="text-gray-500 mb-3">로그인 후 대여 신청이 가능해요</p>
        <button
          onClick={() => router.push("/login")}
          className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-gray-800">대여 신청</h2>
      <p className="text-sm text-rose-600 font-medium">
        보증금 {item.deposit_amount.toLocaleString()}원
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {step === "calendar" && (
        <>
          <AvailabilityCalendar
            availableDates={availableDates}
            selected={range}
            onSelect={setRange}
          />
          {canProceed && (
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm text-gray-700">
                <span className="font-medium">선택 기간: </span>
                {format(range!.from!, "yyyy.MM.dd", { locale: ko })}
                {range?.to && range.to !== range.from
                  ? ` ~ ${format(range.to, "yyyy.MM.dd", { locale: ko })} (${differenceInDays(range.to, range.from!) + 1}일)`
                  : " (1일)"}
              </div>
              <button
                onClick={() => setStep("summary")}
                className="w-full bg-rose-500 text-white py-2.5 rounded-lg font-medium hover:bg-rose-600 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {step === "summary" && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">대여 기간</span>
              <span className="font-medium">
                {format(range!.from!, "MM/dd", { locale: ko })}
                {range?.to && ` ~ ${format(range.to, "MM/dd", { locale: ko })}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">보증금</span>
              <span className="font-bold text-rose-500">
                {item.deposit_amount.toLocaleString()}원
              </span>
            </div>
            <p className="text-xs text-gray-400 pt-1">
              * 반납 확인 후 보증금이 전액 환불돼요
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("calendar")}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
            <button
              onClick={createRentalAndPay}
              disabled={loading}
              className="flex-1 bg-rose-500 text-white py-2.5 rounded-lg font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {loading ? "처리 중..." : "보증금 결제하기"}
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-4">
          <div id="payment-widget" className="min-h-[200px]" />
          <button
            onClick={requestPayment}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors"
          >
            결제하기
          </button>
          <p className="text-xs text-gray-400 text-center">
            토스페이먼츠를 통해 안전하게 결제돼요
          </p>
        </div>
      )}
    </div>
  );
}
