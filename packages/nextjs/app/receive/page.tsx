"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { QRCodeCanvas } from "qrcode.react";

import MobileShell from "~~/components/quickpay/MobileShell";
import { useWdk } from "~~/contexts/WdkContext";

const ReceivePage = () => {
  const { address } = useWdk();
  const qrValue = address ?? "";

  return (
    <MobileShell
      backHref="/home"
      title="My QR"
      actionSlot={
        <button
          type="button"
          className="icon-button h-10 w-10 disabled:opacity-40"
          aria-label="Share QR code"
          disabled={!address}
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
        </button>
      }
    >
      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-6 pb-16 text-center text-[#a7ebf2]">
        <div className="glow-ring rounded-[1.8rem] bg-[#a7ebf2]/10 p-5">
          {qrValue ? (
            <QRCodeCanvas value={qrValue} size={220} bgColor="#a7ebf2" fgColor="#011c40" includeMargin />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center text-sm text-[#a7ebf2]/60">Generating QR…</div>
          )}
        </div>
        <p className="max-w-sm text-sm text-[#a7ebf2]/70">
          Present this code for incoming payments or share it using the action above.
        </p>
      </div>
    </MobileShell>
  );
};

export default ReceivePage;

