import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="relative mt-auto w-full text-[#a7ebf2]">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-6">
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-4">
          <div className="glass-panel flex items-center justify-between rounded-[1.75rem] border-[#a7ebf2]/10 bg-[#011c40]/80 px-5 py-4 shadow-[0_24px_45px_-28px_rgba(1,28,64,0.88)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {nativeCurrencyPrice > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full border border-[#023859]/50 bg-[#023859]/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#a7ebf2]/80">
                  <CurrencyDollarIcon className="h-4 w-4 text-[#54acbf]" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              )}
              {isLocalNetwork && (
                <Faucet />
              )}
              {isLocalNetwork && (
                <Link
                  href="/blockexplorer"
                  passHref
                  className="btn btn-sm btn-secondary gap-2 rounded-full border border-[#023859]/60 bg-[#023859]/60 text-[#a7ebf2] hover:border-[#54acbf]/70"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              )}
            </div>
            <SwitchTheme className="ml-3" />
          </div>

          <div className="mb-2 flex flex-col items-center gap-2 text-xs text-[#a7ebf2]/70">
            <div className="flex items-center gap-2 text-center">
              <span>Built with</span>
              <HeartIcon className="h-4 w-4 text-[#54acbf]" />
              <a className="link text-[#a7ebf2]" href="https://dojocoding.io/" target="_blank" rel="noreferrer">
                Dojo Coding
              </a>
            </div>
            <a className="link text-[#54acbf]" href="https://discord.gg/dojocoding" target="_blank" rel="noreferrer">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
