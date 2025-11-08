"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCardIcon, QrCodeIcon, SparklesIcon } from "@heroicons/react/24/outline";

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/home");
    }, 1800);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center justify-center overflow-hidden bg-deep-900 text-[#a7ebf2]">
      <div className="absolute inset-0 quickpay-gradient" aria-hidden />
      <div className="absolute -left-1/3 top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(84,172,191,0.4),_transparent_70%)] blur-[80px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(2,56,89,0.32),_transparent_70%)] blur-[70px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,_rgba(167,235,242,0.08),_transparent_72%)]" />

      <div className="relative flex flex-col items-center gap-12 px-10 pb-12 pt-20 text-center">
        <div className="glow-ring flex h-44 w-44 items-center justify-center rounded-[2.5rem] bg-[#a7ebf2]/10 backdrop-blur-xl">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-[#a7ebf2]/90 to-[#a0bacc]/75 shadow-[0_30px_70px_rgba(1,28,64,0.45)]">
            <CreditCardIcon className="h-12 w-12 text-[#023859]" aria-hidden />
            <div className="absolute -bottom-5 -right-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#023859] to-[#011c40] text-[#a7ebf2] shadow-[0_12px_40px_rgba(1,28,64,0.65)]">
              <QrCodeIcon className="h-7 w-7" aria-hidden />
            </div>
            <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#a7ebf2] to-[#54acbf] text-[#022534]">
              <SparklesIcon className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.6em] text-[#a7ebf2]/70">Welcome to</p>
          <h1 className="text-4xl font-semibold tracking-wide text-[#a7ebf2] drop-shadow-[0_14px_35px_rgba(1,28,64,0.55)]">QuickPay</h1>
          <p className="text-sm text-[#a7ebf2]/70">
            An elegant way to send and receive payments instantly with a clear, glass inspired experience.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/home")}
          className="btn-primary-dark rounded-full px-10 py-3 text-sm font-medium tracking-wide text-[#a7ebf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
        >
          Enter QuickPay
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
