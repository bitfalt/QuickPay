"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/24/solid";

import MobileShell from "~~/components/quickpay/MobileShell";
import { useWdk } from "~~/contexts/WdkContext";

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useWdk();

  const amountParam = searchParams.get("amount") ?? "0";
  const recipientParam = searchParams.get("recipient");
  const formatAddress = (value: string | null | undefined) => {
    if (!value) return "Loading address…";
    if (value.length <= 10) return value;
    return `${value.slice(0, 6)}…${value.slice(-4)}`;
  };

  const recipient = recipientParam ? formatAddress(recipientParam) : "Recipient not provided";
  const fromAccount = formatAddress(address);

  const formattedAmount = useMemo(() => {
    const numericValue = Number(amountParam);
    if (Number.isNaN(numericValue)) return "0.00";
    return numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [amountParam]);

  const onDone = () => {
    router.replace("/home");
  };

  return (
    <MobileShell backHref="/home" title="Payment Success">
      <div className="flex flex-1 flex-col items-center justify-between pb-12 text-[#a7ebf2]">
        <div className="flex flex-col items-center gap-7 text-center">
          <div className="glow-ring flex h-44 w-44 items-center justify-center rounded-[2.8rem] bg-[#a7ebf2]/10 backdrop-blur-xl">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,_rgba(84,172,191,0.65),_rgba(38,101,140,0.45))] shadow-[0_30px_70px_rgba(2,53,89,0.55)]">
              <CheckCircleIcon className="h-20 w-20 text-[#a7ebf2]" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight drop-shadow-[0_14px_38px_rgba(2,53,89,0.45)]">Payment Success!</h1>
            <p className="mt-2 text-sm text-[#a7ebf2]/70">The transfer has cleared and your receipt is ready below.</p>
          </div>
        </div>

        <div className="glass-panel w-full rounded-[1.85rem] px-5 py-6 text-sm text-[#a7ebf2]/80">
          <h2 className="text-center text-lg font-semibold text-[#a7ebf2]">Receipt</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-[#a7ebf2]">
            <div className="flex items-center justify-between">
              <span className="text-[#a7ebf2]/60">Amount</span>
              <span className="text-[#a7ebf2] font-semibold">¢{formattedAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a7ebf2]/60">To</span>
              <span className="font-semibold text-[#a7ebf2]">{recipient}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a7ebf2]/60">From</span>
              <span className="font-semibold text-[#a7ebf2]">{fromAccount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a7ebf2]/60">Reference</span>
              <span className="font-semibold text-[#a7ebf2]">QP-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a7ebf2]/60">Fee</span>
              <span className="text-[#a7ebf2]">¢0.001</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a7ebf2]/60">Completed</span>
              <span className="text-[#a7ebf2]">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date())}
                ,
                {" "}
                {new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date())}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex w-full gap-4">
          <button
            type="button"
            onClick={onDone}
            className="flex-1 rounded-full bg-[#a7ebf2]/20 py-3 text-sm font-semibold text-[#a7ebf2] backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
          >
            Done
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(130deg,rgba(84,172,191,0.9),rgba(38,101,140,0.88))] py-3 text-sm font-semibold text-[#a7ebf2] shadow-[0_22px_55px_-30px_rgba(2,53,89,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
          >
            <ShareIcon className="h-5 w-5" /> Share
          </button>
        </div>
      </div>
    </MobileShell>
  );
};

export default SuccessPage;

