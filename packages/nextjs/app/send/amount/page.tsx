"use client";

import { useMemo, useState } from "react";
import { BackspaceIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

import MobileShell from "~~/components/quickpay/MobileShell";

const keypadLayout: Array<Array<string>> = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "back"],
];

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (value: number) => amountFormatter.format(Number.isFinite(value) ? value : 0);

const MAX_KEYPAD_LENGTH = 10;
const MAX_SPLIT_PARTICIPANTS = 12;

const SendAmountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const recipientParam = searchParams.get("recipient") ?? "";
  const modeParam = searchParams.get("mode");
  const splitRoleParam = searchParams.get("splitRole") === "participant" ? "participant" : "initiator";
  const amountParam = searchParams.get("amount") ?? "";
  const splitTotalParam = searchParams.get("splitTotal") ?? "";
  const splitPeopleParam = searchParams.get("splitPeople");
  const splitShareParam = searchParams.get("splitShare") ?? "";

  const initialMode: "pay-all" | "split" = modeParam === "split" ? "split" : "pay-all";
  const lockToParticipantSplit = initialMode === "split" && splitRoleParam === "participant";

  const [mode, setMode] = useState<"pay-all" | "split">(initialMode);
  const [splitRole, setSplitRole] = useState<"initiator" | "participant">(
    initialMode === "split" ? splitRoleParam : "initiator",
  );
  const [payAllAmountInput, setPayAllAmountInput] = useState<string>(() => {
    if (initialMode !== "split" && amountParam) {
      return amountParam;
    }
    if (initialMode === "split" && splitRoleParam === "participant" && amountParam) {
      return amountParam;
    }
    return "";
  });
  const [splitTotalInput, setSplitTotalInput] = useState<string>(() => {
    if (initialMode === "split") {
      if (splitTotalParam) return splitTotalParam;
      if (splitShareParam && splitPeopleParam) {
        const computed = Number(splitShareParam) * Number(splitPeopleParam);
        if (!Number.isNaN(computed) && computed > 0) {
          return computed.toFixed(2);
        }
      }
    }
    return "";
  });
  const [splitPeople, setSplitPeople] = useState<number>(() => {
    const parsed = Number(splitPeopleParam);
    if (!Number.isNaN(parsed) && parsed >= 2) {
      return Math.min(parsed, MAX_SPLIT_PARTICIPANTS);
    }
    return 2;
  });

  const isSplitMode = mode === "split";
  const isParticipant = isSplitMode && splitRole === "participant";
  const canEditSplitSettings = isSplitMode && !isParticipant;

  const payAllAmountValue = Number(payAllAmountInput || "0");
  const splitTotalValue = Number(splitTotalInput || "0");
  const shareFromParams = Number(splitShareParam || amountParam || "0");

  const perPersonAmount = useMemo(() => {
    if (!isSplitMode) {
      return 0;
    }
    if (isParticipant) {
      if (!Number.isNaN(shareFromParams) && shareFromParams > 0) {
        return shareFromParams;
      }
      if (splitTotalValue > 0 && splitPeople > 0) {
        return splitTotalValue / splitPeople;
      }
      return 0;
    }
    if (splitTotalValue <= 0 || splitPeople <= 0) {
      return 0;
    }
    return splitTotalValue / splitPeople;
  }, [isSplitMode, isParticipant, shareFromParams, splitTotalValue, splitPeople]);

  const perPersonAmountClamped = Number.isFinite(perPersonAmount) && perPersonAmount > 0 ? perPersonAmount : 0;
  const formattedPerPersonAmount = formatAmount(perPersonAmountClamped);
  const formattedPayAllAmount = formatAmount(Number.isFinite(payAllAmountValue) ? payAllAmountValue : 0);
  const derivedSplitTotal =
    splitTotalValue > 0
      ? splitTotalValue
      : perPersonAmountClamped > 0 && splitPeople > 0
        ? perPersonAmountClamped * splitPeople
        : 0;
  const formattedSplitTotal = formatAmount(derivedSplitTotal);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const splitReviewLink = useMemo(() => {
    if (!isSplitMode || !recipientParam || perPersonAmountClamped <= 0 || splitPeople <= 1 || !origin) {
      return "";
    }
    const params = new URLSearchParams({
      amount: perPersonAmountClamped.toFixed(2),
      mode: "split",
      splitShare: perPersonAmountClamped.toFixed(2),
      splitPeople: splitPeople.toString(),
      splitRole: "initiator",
      splitTotal: derivedSplitTotal.toFixed(2),
      recipient: recipientParam,
    });
    return `${origin}/send/review?${params.toString()}`;
  }, [origin, isSplitMode, recipientParam, perPersonAmountClamped, splitPeople, derivedSplitTotal]);

  const canContinue = isSplitMode
    ? perPersonAmountClamped > 0 && splitPeople >= 2
    : Number.isFinite(payAllAmountValue) && payAllAmountValue > 0;

  const handleKeyPress = (key: string) => {
    if (!key) return;

    if (key === "back") {
      if (isSplitMode) {
        if (!canEditSplitSettings) return;
        setSplitTotalInput(previous => previous.slice(0, -1));
      } else {
        setPayAllAmountInput(previous => previous.slice(0, -1));
      }
      return;
    }

    if (isSplitMode) {
      if (!canEditSplitSettings) return;
      setSplitTotalInput(previous => {
        if (previous.length >= MAX_KEYPAD_LENGTH) {
          return previous;
        }
        return `${previous}${key}`;
      });
    } else {
      setPayAllAmountInput(previous => {
        if (previous.length >= MAX_KEYPAD_LENGTH) {
          return previous;
        }
        return `${previous}${key}`;
      });
    }
  };

  const handleModeSelect = (nextMode: "pay-all" | "split") => {
    if (mode === nextMode) return;
    if (lockToParticipantSplit) return;
    setMode(nextMode);
    if (nextMode === "split") {
      setSplitRole("initiator");
    }
  };

  const handleDecreasePeople = () => {
    if (!canEditSplitSettings) return;
    setSplitPeople(previous => Math.max(2, previous - 1));
  };

  const handleIncreasePeople = () => {
    if (!canEditSplitSettings) return;
    setSplitPeople(previous => Math.min(MAX_SPLIT_PARTICIPANTS, previous + 1));
  };

  const onContinue = () => {
    if (isSplitMode) {
      if (perPersonAmountClamped <= 0 || splitPeople < 2) {
        return;
      }

      const share = perPersonAmountClamped.toFixed(2);
      const total = derivedSplitTotal > 0 ? derivedSplitTotal.toFixed(2) : perPersonAmountClamped.toFixed(2);
      const params = new URLSearchParams({
        amount: share,
        mode: "split",
        splitShare: share,
        splitPeople: splitPeople.toString(),
        splitRole,
      });

      if (derivedSplitTotal > 0) {
        params.set("splitTotal", total);
      }

      if (recipientParam) {
        params.set("recipient", recipientParam);
      }

      router.push(`/send/review?${params.toString()}`);
      return;
    }

    if (!Number.isFinite(payAllAmountValue) || payAllAmountValue <= 0) {
      return;
    }

    const params = new URLSearchParams({ amount: payAllAmountValue.toString() });
    if (recipientParam) {
      params.set("recipient", recipientParam);
    }

    router.push(`/send/review?${params.toString()}`);
  };

  return (
    <MobileShell backHref="/home" title="Enter amount">
      <div className="flex flex-1 flex-col gap-6 pb-12">
        <div className="glass-panel flex items-center gap-3 rounded-[1.2rem] border-[#a7ebf2]/15 bg-[#011c40]/70 px-3 py-3 text-[#a7ebf2]">
          <button
            type="button"
            onClick={() => handleModeSelect("pay-all")}
            className={`flex-1 rounded-[1rem] px-3 py-2 text-sm font-semibold transition ${
              !isSplitMode
                ? "bg-[#54acbf]/20 text-[#a7ebf2] shadow-[0_18px_45px_-36px_rgba(84,172,191,0.9)]"
                : "text-[#a7ebf2]/60 hover:text-[#a7ebf2]"
            }`}
            disabled={lockToParticipantSplit}
          >
            Pay All
          </button>
          <button
            type="button"
            onClick={() => handleModeSelect("split")}
            className={`flex-1 rounded-[1rem] px-3 py-2 text-sm font-semibold transition ${
              isSplitMode
                ? "bg-[#54acbf]/20 text-[#a7ebf2] shadow-[0_18px_45px_-36px_rgba(84,172,191,0.9)]"
                : "text-[#a7ebf2]/60 hover:text-[#a7ebf2]"
            }`}
            disabled={lockToParticipantSplit}
          >
            Split Bill
          </button>
        </div>

        <div className="glass-panel is-highlight flex flex-col items-center rounded-[1.65rem] px-6 py-8 text-center text-[#a7ebf2]">
          {isSplitMode ? (
            <>
              <p className="text-xs uppercase tracking-[0.4em] text-[#a7ebf2]/60">Total bill</p>
              <p className="mt-3 text-5xl font-bold tracking-tight drop-shadow-[0_16px_40px_rgba(2,53,89,0.45)]">
                ¢
                {formattedSplitTotal}
              </p>
              <p className="mt-6 text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/50">Per person share</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[#a7ebf2] drop-shadow-[0_12px_28px_rgba(2,53,89,0.35)]">
                ¢
                {formattedPerPersonAmount}
              </p>
              <p className="mt-4 text-xs text-[#a7ebf2]/70">
                Everyone pays the same amount. Adjust the total with the keypad below.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.4em] text-[#a7ebf2]/60">Amount</p>
              <p className="mt-3 text-5xl font-bold tracking-tight drop-shadow-[0_16px_40px_rgba(2,53,89,0.45)]">
                ¢
                {formattedPayAllAmount}
              </p>
              <p className="mt-4 rounded-full border border-[#a7ebf2]/20 bg-[#a7ebf2]/10 px-4 py-1 text-[11px] uppercase tracking-[0.4em] text-[#a7ebf2]/70">
                1 USD ≈ ₡520
              </p>
            </>
          )}
        </div>

        {isSplitMode && (
          <>
            <div className="glass-panel rounded-[1.5rem] px-5 py-5 text-[#a7ebf2]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/50">People splitting</p>
                  <p className="mt-1 text-sm text-[#a7ebf2]/70">Equal portions for everyone</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDecreasePeople}
                    className="icon-button h-9 w-9 disabled:opacity-40"
                    aria-label="Decrease people"
                    disabled={!canEditSplitSettings || splitPeople <= 2}
                  >
                    -
                  </button>
                  <span className="min-w-[1.5rem] text-center text-lg font-semibold">{splitPeople}</span>
                  <button
                    type="button"
                    onClick={handleIncreasePeople}
                    className="icon-button h-9 w-9 disabled:opacity-40"
                    aria-label="Increase people"
                    disabled={!canEditSplitSettings || splitPeople >= MAX_SPLIT_PARTICIPANTS}
                  >
                    +
                  </button>
                </div>
              </div>
              {canEditSplitSettings && (
                <p className="mt-3 text-xs text-[#a7ebf2]/60">Use the keypad below to set the total amount.</p>
              )}
              {isParticipant && (
                <p className="mt-3 text-xs text-[#a7ebf2]/60">
                  This amount was shared with you. Confirm the details and continue when ready.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {keypadLayout.flat().map((key, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const displayKey = keypadLayout[row][col];

                if (!displayKey) {
                  return <span key={`placeholder-${index}`} />;
                }

                const isBackspace = displayKey === "back";

                return (
                  <button
                    key={displayKey + index}
                    type="button"
                    onClick={() => handleKeyPress(isBackspace ? "back" : displayKey)}
                    className="glass-panel flex h-16 items-center justify-center rounded-[1.35rem] text-2xl font-semibold text-[#a7ebf2] shadow-[0_18px_45px_-30px_rgba(2,53,89,0.9)] transition active:scale-95 disabled:opacity-40"
                    aria-label={isBackspace ? "Delete" : `Add ${displayKey}`}
                    disabled={isSplitMode && !canEditSplitSettings}
                  >
                    {isBackspace ? <BackspaceIcon className="h-7 w-7" /> : displayKey}
                  </button>
                );
              })}
            </div>

            {isParticipant ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onContinue}
                  className="btn-primary-dark w-full rounded-full py-4 text-center text-lg font-semibold shadow-[0_28px_60px_-30px_rgba(84,172,191,0.85)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2] disabled:opacity-40"
                  disabled={!canContinue}
                >
                  Continue to pay
                </button>
                <p className="mt-3 text-center text-xs text-[#a7ebf2]/60">
                  You can review recipient details before final confirmation.
                </p>
              </div>
            ) : (
              <div className="glass-panel rounded-[1.5rem] px-5 py-6 text-center text-[#a7ebf2]">
                <p className="text-sm font-semibold">Share this QR so others can pay their part</p>
                <div className="mt-4 flex justify-center">
                  {splitReviewLink ? (
                    <div className="glow-ring rounded-[1.6rem] bg-[#a7ebf2]/10 p-4">
                      <QRCodeCanvas value={splitReviewLink} size={190} bgColor="#a7ebf2" fgColor="#011c40" includeMargin />
                    </div>
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center text-xs text-[#a7ebf2]/60">
                      Enter the bill total to generate a QR.
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-[#a7ebf2]/60">
                  Scanning opens the review screen with this split pre-filled.
                </p>
                <button
                  type="button"
                  onClick={onContinue}
                  className="mt-6 w-full rounded-full bg-[#54acbf]/90 py-3 text-sm font-semibold text-[#011c40] shadow-[0_24px_55px_-30px_rgba(2,53,89,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2] disabled:opacity-40"
                  disabled={!canContinue}
                >
                  Continue to pay
                </button>
              </div>
            )}
          </>
        )}

        {!isSplitMode && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {keypadLayout.flat().map((key, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const displayKey = keypadLayout[row][col];

                if (!displayKey) {
                  return <span key={`placeholder-${index}`} />;
                }

                const isBackspace = displayKey === "back";

                return (
                  <button
                    key={displayKey + index}
                    type="button"
                    onClick={() => handleKeyPress(isBackspace ? "back" : displayKey)}
                    className="glass-panel flex h-16 items-center justify-center rounded-[1.35rem] text-2xl font-semibold text-[#a7ebf2] shadow-[0_18px_45px_-30px_rgba(2,53,89,0.9)] transition active:scale-95"
                    aria-label={isBackspace ? "Delete" : `Add ${displayKey}`}
                  >
                    {isBackspace ? <BackspaceIcon className="h-7 w-7" /> : displayKey}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={onContinue}
                className="btn-primary-dark w-full rounded-full py-4 text-center text-lg font-semibold shadow-[0_28px_60px_-30px_rgba(84,172,191,0.85)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2] disabled:opacity-40"
                disabled={!canContinue}
              >
                Continue to pay
              </button>
              <p className="mt-3 text-center text-xs text-[#a7ebf2]/60">You can review recipient details before final confirmation.</p>
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
};

export default SendAmountPage;
