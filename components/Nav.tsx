import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-rose-500">
          wearshare
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/items" className="text-gray-600 hover:text-gray-900 transition-colors">
            의상 탐색
          </Link>
          {user ? (
            <>
              <Link
                href="/items/new"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                옷 등록
              </Link>
              <Link
                href="/my"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                내 페이지
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors"
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
