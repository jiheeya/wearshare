import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ItemForm from "@/components/ItemForm";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: item }, { data: availabilities }] = await Promise.all([
    supabase.from("items").select("*").eq("id", id).single(),
    supabase.from("availabilities").select("*").eq("item_id", id),
  ]);

  if (!item || item.owner_id !== user.id) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">의상 수정</h1>
      <ItemForm userId={user.id} item={item} availabilities={availabilities ?? []} />
    </div>
  );
}
