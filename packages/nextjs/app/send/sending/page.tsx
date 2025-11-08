"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MobileShell from "~~/components/quickpay/MobileShell";

const SendingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const timeout = setTimeout(() => {
      router.replace(`/send/success?${params.toString()}`);
    }, 1600);

    return () => clearTimeout(timeout);
  }, [router, searchParams]);

  return (
    <MobileShell backHref="/send/review" title="Review Send">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-12 text-[#a7ebf2]">
        <div className="glow-ring flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-[#a7ebf2]/10 backdrop-blur-lg">
          <div className="relative h-20 w-20 rounded-[2.2rem] border border-[#a7ebf2]/20">
            <div className="absolute inset-[6px] rounded-[1.8rem] border border-[#a7ebf2]/20" />
            <div className="absolute inset-[10px] animate-spin rounded-[1.6rem] border-2 border-[#a7ebf2]/30 border-t-transparent" />
          </div>
        </div>
        <div className="glass-panel is-compact rounded-[1.35rem] px-5 py-3">
          <p className="text-sm font-medium text-[#a7ebf2]">Processing transfer...</p>
          <p className="text-xs text-[#a7ebf2]/60">Securely finalizing your payment details.</p>
        </div>
      </div>
    </MobileShell>
  );
};

export default SendingPage;

