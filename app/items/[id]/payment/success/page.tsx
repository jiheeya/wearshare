import { redirect } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { paymentKey, orderId, amount } = sp;

  if (!paymentKey || !orderId || !amount) {
    redirect(`/items/${id}?error=payment_failed`);
  }

  // Confirm payment with Toss API
  const encoded = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");
  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  });

  if (!tossRes.ok) {
    redirect(`/items/${id}?error=payment_failed`);
  }

  // Update rental status with service role (bypasses RLS)
  const supabase = createServiceClient();
  await supabase
    .from("rentals")
    .update({
      payment_key: paymentKey,
      payment_status: "paid",
      status: "pending",
    })
    .eq("id", orderId);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold mb-2">대여 신청 완료!</h1>
      <p className="text-gray-500 mb-6">
        보증금 결제가 완료됐어요.<br />
        대여자의 승인을 기다려주세요.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/my"
          className="bg-rose-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-rose-600 transition-colors"
        >
          내 신청 확인
        </Link>
        <Link
          href="/items"
          className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          계속 탐색
        </Link>
      </div>
    </div>
  );
}
