"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { WdkConnectButton } from "~~/components/scaffold-eth/WdkConnectButton";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useWdk } from "~~/contexts/WdkContext";
import { AVALANCHE_NETWORKS, NetworkId } from "~~/config/networks";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Avalanche Wallet",
    href: "/wallet",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = ({
  orientation = "horizontal",
  onNavigate,
}: {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  const containerClasses =
    orientation === "horizontal"
      ? "flex items-center gap-2"
      : "flex w-full flex-col gap-2";

  return (
    <nav className={containerClasses} aria-label="Main navigation">
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        const baseItemClasses =
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54acbf]";
        const activeClasses =
          "bg-[#023859] text-[#a7ebf2] shadow-[0_18px_30px_-22px_rgba(1,28,64,0.78)]";
        const inactiveClasses =
          "text-[#a7ebf2]/70 hover:text-[#a7ebf2] hover:bg-[#023859]/60";

        return (
          <Link
            key={href}
            href={href}
            passHref
            onClick={onNavigate}
            className={`${baseItemClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

/**
 * Network Selector Component for Header
 */
const NetworkSelector = () => {
  const { currentNetwork, switchNetwork, isSwitchingNetwork, isInitialized } = useWdk();
  const networkMenuRef = useRef<HTMLDetailsElement>(null);

  const handleNetworkSwitch = async (networkId: NetworkId) => {
    // Close the dropdown
    networkMenuRef.current?.removeAttribute("open");
    
    try {
      await switchNetwork(networkId);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Only show if wallet is initialized
  if (!isInitialized) {
    return null;
  }

  const networkColors = {
    local: "bg-[#54acbf]",
    fuji: "bg-[#08546c]",
    mainnet: "bg-[#011c40]",
  };

  const networkColor = networkColors[currentNetwork.id as keyof typeof networkColors] || "bg-[#023859]";

  return (
    <details className="dropdown dropdown-end" ref={networkMenuRef}>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#023859]/60 bg-[#011c40]/80 px-3 py-1.5 text-sm text-[#a7ebf2] outline-none hover:border-[#54acbf]/60">
        <div className={`h-2.5 w-2.5 rounded-full ${networkColor}`} />
        <span className="hidden font-medium sm:inline">{currentNetwork.displayName}</span>
        <span className="text-xs sm:hidden">{currentNetwork.id.toUpperCase()}</span>
        {isSwitchingNetwork && <span className="loading loading-spinner loading-xs text-[#54acbf]" />}
        <svg className="h-3 w-3 text-[#a7ebf2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </summary>
      <ul className="menu dropdown-content mt-3 w-64 space-y-2 rounded-3xl border border-[#023859]/50 bg-[#011c40]/90 px-4 py-4 text-[#a7ebf2] shadow-[0_24px_45px_-26px_rgba(1,28,64,0.85)] backdrop-blur-xl">
        {Object.values(AVALANCHE_NETWORKS).map(network => (
          <li key={network.id}>
            <button
              onClick={() => handleNetworkSwitch(network.id as NetworkId)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
                currentNetwork.id === network.id
                  ? "bg-[#023859] text-[#a7ebf2]"
                  : "text-[#a7ebf2]/80 hover:bg-[#023859]/60 hover:text-[#a7ebf2]"
              }`}
              disabled={isSwitchingNetwork}
              type="button"
            >
              <div className={`h-2.5 w-2.5 rounded-full ${networkColors[network.id as keyof typeof networkColors]}`} />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">{network.displayName}</span>
                <span className="text-[11px] text-[#a7ebf2]/60">Chain ID: {network.chainId}</span>
              </div>
              {currentNetwork.id === network.id && <span className="ml-auto text-[#54acbf]">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { currentNetwork } = useWdk();
  const isLocalNetwork = currentNetwork.id === "local";

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="glass-panel sticky top-0 z-40 w-full border-[#023859]/35 px-4 py-4 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <details className="dropdown" ref={burgerMenuRef}>
            <summary className="icon-button h-10 w-10 list-none border border-[#023859]/50 bg-[#023859]/40 p-0 text-[#a7ebf2] hover:border-[#54acbf]/60 lg:hidden">
              <Bars3Icon className="h-5 w-5" />
            </summary>
            <div className="dropdown-content mt-4 w-[15rem] rounded-3xl border border-[#023859]/50 bg-[#011c40]/95 p-4 shadow-[0_24px_45px_-28px_rgba(1,28,64,0.85)] backdrop-blur-xl">
              <HeaderMenuLinks
                orientation="vertical"
                onNavigate={() => burgerMenuRef?.current?.removeAttribute("open")}
              />
            </div>
          </details>

          <Link href="/" passHref className="hidden items-center gap-3 lg:flex">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#023859]/80 shadow-[0_18px_30px_-20px_rgba(1,28,64,0.8)]">
              <Image alt="QuickPay logo" className="rounded-lg" fill src="/logo.svg" />
            </div>
            <div className="flex flex-col text-[#a7ebf2]">
              <span className="text-sm font-semibold tracking-wide">QuickPay</span>
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/60">Powered by WDK Avalanche</span>
            </div>
          </Link>
          <div className="hidden lg:flex">
            <HeaderMenuLinks />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NetworkSelector />
          <WdkConnectButton />
        </div>
      </div>
    </header>
  );
};
