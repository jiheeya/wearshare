import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 bg-[#FFFCF9] border-b border-[#E8DDD0] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#9B2335]">
          wearshare
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/items" className="text-stone-500 hover:text-[#9B2335] transition-colors">
            의상 탐색
          </Link>
          {user ? (
            <>
              <Link
                href="/items/new"
                className="text-stone-500 hover:text-[#9B2335] transition-colors"
              >
                옷 등록
              </Link>
              <Link
                href="/my"
                className="text-stone-500 hover:text-[#9B2335] transition-colors"
              >
                내 페이지
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-stone-500 hover:text-[#9B2335] transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-[#9B2335] text-white px-3 py-1.5 rounded-lg hover:bg-[#7A1A29] transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
