"use client";

import { useState } from "react";
import { ExclamationTriangleIcon, EyeIcon, EyeSlashIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/solid";

import MobileShell from "~~/components/quickpay/MobileShell";
import { useWdk } from "~~/contexts/WdkContext";

const SettingsPage = () => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [privateWarningAcknowledged, setPrivateWarningAcknowledged] = useState(false);
  const [seedWarningAcknowledged, setSeedWarningAcknowledged] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { seedPhrase, privateKey, createWallet, disconnectWallet } = useWdk();
  const [copiedField, setCopiedField] = useState<"private" | "seed" | null>(null);

  const copyToClipboard = async (value: string | null | undefined, field: "private" | "seed") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.warn("Unable to copy", error);
    }
  };

  const togglePrivateKey = () => {
    if (!showPrivateKey && !privateWarningAcknowledged) {
      setPrivateWarningAcknowledged(true);
      return;
    }

    setShowPrivateKey(previous => !previous);
  };

  const toggleSeedPhrase = () => {
    if (!showSeedPhrase && !seedWarningAcknowledged) {
      setSeedWarningAcknowledged(true);
      return;
    }

    setShowSeedPhrase(previous => !previous);
  };

  const handleDeleteWallet = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await disconnectWallet();
      await createWallet();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete wallet", error);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <MobileShell title="Settings">
      <div className="flex flex-1 flex-col gap-6 pb-12 text-[#a7ebf2]">
        <section className="glass-panel is-highlight overflow-hidden rounded-[1.85rem] px-5 py-6">
          <h2 className="text-lg font-semibold text-[#a7ebf2]">Wallet security</h2>
          <p className="mt-2 text-sm text-[#a7ebf2]/70">
            Keep your recovery details safe. Only reveal them when you are ready to back them up in a secure place.
          </p>
        </section>

        <section className="glass-panel rounded-[1.85rem] px-5 py-6">
          <h2 className="text-lg font-semibold text-[#a7ebf2]">Sensitive details</h2>
          <p className="mt-2 text-sm text-[#a7ebf2]/70">
            These values give full access to your account. Never share them with anyone.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#a7ebf2]/50">
                <span>Private key</span>
                <button
                  type="button"
                  onClick={togglePrivateKey}
                  className="flex items-center gap-1 rounded-full border border-[#a7ebf2]/20 bg-[#a7ebf2]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a7ebf2]/70"
                >
                  {showPrivateKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  {showPrivateKey ? "Hide" : "Reveal"}
                </button>
              </div>
              {!showPrivateKey && privateWarningAcknowledged && (
                <p className="mt-3 rounded-xl border border-[#a0bacc]/40 bg-[#a0bacc]/10 px-3 py-3 text-xs text-[#a7ebf2]">
                  Sensitive information. Do not share your private key with anyone. Tap reveal again only if you are in a secure place.
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#a7ebf2]/10 px-3 py-3">
                <span className="truncate text-sm font-mono text-[#a7ebf2]/80">
                  {showPrivateKey ? privateKey ?? "Loading…" : "•••• •••• •••• ••••"}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(showPrivateKey ? privateKey : null, "private")}
                  className="icon-button h-9 w-9"
                  aria-label="Copy private key"
                >
                  {copiedField === "private" ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#a7ebf2]/50">
                <span>Seed phrase</span>
                <button
                  type="button"
                  onClick={toggleSeedPhrase}
                  className="flex items-center gap-1 rounded-full border border-[#a7ebf2]/20 bg-[#a7ebf2]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a7ebf2]/70"
                >
                  {showSeedPhrase ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  {showSeedPhrase ? "Hide" : "Reveal"}
                </button>
              </div>
              {!showSeedPhrase && seedWarningAcknowledged && (
                <p className="mt-3 rounded-xl border border-[#a0bacc]/40 bg-[#a0bacc]/10 px-3 py-3 text-xs text-[#a7ebf2]">
                  This phrase recovers your funds. Never share it. Tap reveal again only if you are ready to store it securely.
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#a7ebf2]/10 px-3 py-3">
                <span className={`text-sm font-medium text-[#a7ebf2]/80 ${showSeedPhrase ? "" : "tracking-[0.3em]"}`}>
                  {showSeedPhrase ? seedPhrase ?? "Loading…" : "•••• •••• •••• •••• •••• ••••"}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(showSeedPhrase ? seedPhrase : null, "seed")}
                  className="icon-button h-9 w-9"
                  aria-label="Copy seed phrase"
                >
                  {copiedField === "seed" ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel border border-[#023859]/40 bg-[linear-gradient(145deg,rgba(2,53,89,0.18),rgba(1,28,64,0.15))] px-5 py-6 text-[#a7ebf2]">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-1 h-6 w-6 text-[#54acbf]" />
            <div>
              <h3 className="text-lg font-semibold">Delete wallet</h3>
              <p className="mt-2 text-sm text-[#a7ebf2]/80">
                This action will remove your wallet from this device. Make sure you have saved your private key and seed phrase before continuing.
              </p>
              <button
                type="button"
                onClick={handleDeleteWallet}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(38,101,140,0.9),rgba(2,53,89,0.85))] py-3 text-sm font-semibold text-[#a7ebf2] shadow-[0_25px_55px_-30px_rgba(1,28,64,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
              >
                <TrashIcon className="h-4 w-4" /> Delete wallet from this device
              </button>
            </div>
          </div>
        </section>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#011c40]/70 px-5">
          <div className="glass-panel is-highlight w-full max-w-sm rounded-3xl px-5 py-6 text-[#a7ebf2]">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-[#54acbf]" />
              <h3 className="text-lg font-semibold">Delete wallet?</h3>
            </div>
            <p className="mt-4 text-sm text-[#a7ebf2]/70">
              If you delete this wallet without saving your private key or seed phrase, you will permanently lose access. This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full rounded-full bg-[#023859] py-3 text-sm font-semibold text-[#a7ebf2] disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes, delete my wallet"}
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="w-full rounded-full bg-[#a7ebf2]/10 py-3 text-sm font-semibold text-[#a7ebf2] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
};

export default SettingsPage;

