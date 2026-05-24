import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ItemForm from "@/components/ItemForm";

export default async function NewItemPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">의상 등록</h1>
      <ItemForm userId={user.id} />
    </div>
  );
}
