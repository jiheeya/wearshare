"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">로그인</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        wearshare에 오신 것을 환영해요
      </p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">이메일</label>
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-[#E8DDD0] bg-[#FFFCF9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B2335]/30 focus:border-[#9B2335] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">비밀번호</label>
          <input
            name="password"
            type="password"
            required
            placeholder="비밀번호"
            className="w-full px-3 py-2 border border-[#E8DDD0] bg-[#FFFCF9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B2335]/30 focus:border-[#9B2335] text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9B2335] text-white py-2.5 rounded-lg font-medium hover:bg-[#7A1A29] transition-colors disabled:opacity-50"
        >
          {loading ? "처리 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-[#9B2335] font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
