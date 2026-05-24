"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login?message=가입 완료! 로그인해주세요.");
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">회원가입</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        특별한 날의 의상을 쉽게 빌리고 나눠요
      </p>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">비밀번호</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="6자 이상"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-500 text-white py-2.5 rounded-lg font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
        >
          {loading ? "처리 중..." : "가입하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-rose-500 font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
