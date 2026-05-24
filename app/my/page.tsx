import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyDashboard from "@/components/MyDashboard";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: myItems }, { data: myRentals }] = await Promise.all([
    supabase
      .from("items")
      .select(`*, rentals(*, profiles:borrower_id(username))`)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("rentals")
      .select(`*, items(title, images, deposit_amount, category, size)`)
      .eq("borrower_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 페이지</h1>
      <MyDashboard myItems={myItems ?? []} myRentals={myRentals ?? []} />
    </div>
  );
}
