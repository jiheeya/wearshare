"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import type { ItemCategory, Item, Availability } from "@/types";

const CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: "유니폼", value: "uniform" },
  { label: "졸업사진 드레스", value: "graduation" },
  { label: "코스프레", value: "cosplay" },
  { label: "기타", value: "other" },
];

interface Props {
  userId: string;
  item?: Item;
  availabilities?: Availability[];
}

export default function ItemForm({ userId, item, availabilities = [] }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState<ItemCategory>(item?.category ?? "graduation");
  const [size, setSize] = useState(item?.size ?? "");
  const [deposit, setDeposit] = useState(String(item?.deposit_amount ?? 0));
  const [rentalFeePerDay, setRentalFeePerDay] = useState(String(item?.rental_fee_per_day ?? 0));
  const [handoverDays, setHandoverDays] = useState(String(item?.handover_days ?? 1));
  const [existingImages, setExistingImages] = useState<string[]>(item?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [ranges, setRanges] = useState<{ start: string; end: string }[]>(
    availabilities.map((a) => ({ start: a.start_date, end: a.end_date }))
  );
  const [pickerRange, setPickerRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function addRange() {
    if (!pickerRange?.from) return;
    const start = format(pickerRange.from, "yyyy-MM-dd");
    const end = format(pickerRange.to ?? pickerRange.from, "yyyy-MM-dd");
    setRanges((prev) => [...prev, { start, end }]);
    setPickerRange(undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("item-images")
          .upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("item-images").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      if (item) {
        // Update existing item
        const { error: itemErr } = await supabase
          .from("items")
          .update({
            title,
            description,
            category,
            size,
            deposit_amount: Number(deposit),
            rental_fee_per_day: Number(rentalFeePerDay),
            handover_days: Number(handoverDays),
            images: allImages,
          })
          .eq("id", item.id);
        if (itemErr) throw itemErr;

        // Replace availabilities
        await supabase.from("availabilities").delete().eq("item_id", item.id);
        if (ranges.length > 0) {
          await supabase.from("availabilities").insert(
            ranges.map((r) => ({ item_id: item.id, start_date: r.start, end_date: r.end }))
          );
        }
        router.push(`/items/${item.id}`);
      } else {
        // Create new item
        const { data: newItem, error: itemErr } = await supabase
          .from("items")
          .insert({
            owner_id: userId,
            title,
            description,
            category,
            size,
            deposit_amount: Number(deposit),
            rental_fee_per_day: Number(rentalFeePerDay),
            handover_days: Number(handoverDays),
            images: allImages,
          })
          .select()
          .single();
        if (itemErr) throw itemErr;

        // Create availabilities
        if (ranges.length > 0) {
          await supabase.from("availabilities").insert(
            ranges.map((r) => ({ item_id: newItem.id, start_date: r.start, end_date: r.end }))
          );
        }
        router.push(`/items/${newItem.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">기본 정보</h2>

        <div>
          <label className="block text-sm font-medium mb-1.5">의상 이름 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="예: 신데렐라 드레스 블루"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">카테고리 *</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  category === c.value
                    ? "bg-rose-500 text-white border-rose-500"
                    : "border-gray-300 text-gray-600 hover:border-rose-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">사이즈 *</label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
              placeholder="예: S, M, L, 55, 66..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">보증금 (원) *</label>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              required
              min={0}
              placeholder="50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">하루 대여비 (원) *</label>
          <input
            type="number"
            value={rentalFeePerDay}
            onChange={(e) => setRentalFeePerDay(e.target.value)}
            required
            min={0}
            placeholder="10000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <p className="text-xs text-gray-400 mt-1">대여 일수에 따라 자동으로 계산돼요</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">옷 전달에 필요한 여유일</label>
          <select
            value={handoverDays}
            onChange={(e) => setHandoverDays(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {[1, 2, 3].map((d) => (
              <option key={d} value={d}>
                앞뒤로 {d}일씩 — 택배/직거래 여유 {d}일
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">이 기간엔 다른 대여 신청을 받지 않아요</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">상세 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="의상 상태, 보관 방법, 거래 방식 등을 적어주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          />
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">사진</h2>
        <div className="flex gap-2 flex-wrap">
          {existingImages.map((url, i) => (
            <div key={url} className="relative w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setExistingImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-rose-300 transition-colors text-2xl"
          >
            +
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-400">첫 번째 사진이 대표 이미지로 사용돼요</p>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">대여 가능 기간</h2>
        <p className="text-sm text-gray-500">빌려줄 수 있는 날짜 범위를 선택하고 추가해주세요</p>

        <DayPicker
          mode="range"
          selected={pickerRange}
          onSelect={setPickerRange}
          locale={ko}
          disabled={{ before: new Date() }}
          className="!font-sans"
        />

        <button
          type="button"
          onClick={addRange}
          disabled={!pickerRange?.from}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-rose-600 transition-colors"
        >
          기간 추가
        </button>

        {ranges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">등록된 기간</p>
            {ranges.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-rose-50 rounded-lg px-3 py-2 text-sm"
              >
                <span>
                  {format(parseISO(r.start), "yyyy.MM.dd", { locale: ko })} ~{" "}
                  {format(parseISO(r.end), "yyyy.MM.dd", { locale: ko })}
                </span>
                <button
                  type="button"
                  onClick={() => setRanges((prev) => prev.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 ml-2"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
      >
        {loading ? "저장 중..." : item ? "수정 완료" : "등록하기"}
      </button>
    </form>
  );
}
