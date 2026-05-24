"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function approveRental(rentalId: string) {
  const supabase = await createClient();
  await supabase.from("rentals").update({ status: "approved" }).eq("id", rentalId);
  revalidatePath("/my");
}

export async function rejectRental(rentalId: string) {
  const supabase = await createClient();
  await supabase.from("rentals").update({ status: "rejected" }).eq("id", rentalId);
  revalidatePath("/my");
}

export async function completeAndRefund(rentalId: string) {
  const supabase = createServiceClient();

  const { data: rental } = await supabase
    .from("rentals")
    .select("payment_key, deposit_amount")
    .eq("id", rentalId)
    .single();

  if (!rental) return;

  // Toss refund — only if payment was made
  if (rental.payment_key) {
    const encoded = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");
    await fetch(`https://api.tosspayments.com/v1/payments/${rental.payment_key}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancelReason: "반납 확인 완료" }),
    });
  }

  await supabase
    .from("rentals")
    .update({ status: "completed", payment_status: "refunded" })
    .eq("id", rentalId);

  revalidatePath("/my");
}
