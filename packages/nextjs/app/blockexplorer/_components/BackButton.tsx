"use client";

import { useRouter } from "next/navigation";

export const BackButton = () => {
  const router = useRouter();
  return (
    <button
      className="rounded-full border border-[#023859]/60 bg-[#023859]/55 px-4 py-2 text-sm font-semibold text-[#a7ebf2] shadow-[0_18px_40px_-28px_rgba(1,28,64,0.9)] transition hover:border-[#54acbf]/70 hover:bg-[#023859]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54acbf]"
      onClick={() => router.back()}
      type="button"
    >
      Back
    </button>
  );
};
