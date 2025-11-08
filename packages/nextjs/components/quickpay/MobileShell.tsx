"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import BottomNav from "./BottomNav";

type MobileShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  actionSlot?: ReactNode;
  contentClassName?: string;
  hideHeader?: boolean;
};

const joinClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

const MobileShell = ({
  children,
  title,
  subtitle,
  backHref,
  actionSlot,
  contentClassName,
  hideHeader = false,
}: MobileShellProps) => {
  const topPadding = hideHeader ? "pt-4" : "pt-8";
  const mainBaseClass = hideHeader ? "flex h-full flex-col" : "mt-8 flex h-full flex-col gap-6";

  return (
    <div className="liquid-shell relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-deep-900 text-soft">
      <div className="absolute inset-0 -z-30 quickpay-gradient" />
      <div className="absolute inset-x-[-40%] top-[-30%] -z-20 h-[55%] rounded-[50%] bg-[radial-gradient(circle_at_center,_rgba(167,235,242,0.32),_transparent_60%)] blur-[60px]" />
      <div className="absolute right-[-40%] top-[25%] -z-10 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(84,172,191,0.25),_transparent_65%)] blur-[40px]" />
      <div className="absolute left-[-20%] bottom-[15%] -z-10 h-[180px] w-[180px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(160,186,204,0.18),_transparent_70%)] blur-[50px]" />

      <div className={`flex-1 px-5 pb-32 ${topPadding}`}>
        {!hideHeader && (
          <header className="glass-panel is-compact flex items-center justify-between rounded-[1.25rem] border-[#a7ebf2]/10 bg-[#a7ebf2]/10 px-4 py-3 backdrop-blur-xl">
            {backHref ? (
              <Link
                href={backHref}
                className="icon-button h-10 w-10 rounded-[1rem] bg-[#a7ebf2]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>
            ) : (
              <span className="h-10 w-10" aria-hidden />
            )}

            {(title || subtitle) && (
              <div className="flex flex-1 flex-col items-center gap-1 text-center">
                {title && (
                  <h1 className="text-[1.55rem] font-semibold tracking-tight text-[#a7ebf2] drop-shadow-[0_8px_18px_rgba(2,53,89,0.45)]">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-[0.65rem] uppercase tracking-[0.4em] text-soft">{subtitle}</p>}
              </div>
            )}

            {actionSlot ? actionSlot : <span className="h-10 w-10" aria-hidden />}
          </header>
        )}

        <main className={joinClassNames(mainBaseClass, contentClassName)}>{children}</main>
      </div>

      <BottomNavWrapper />
    </div>
  );
};

export default MobileShell;

const BottomNavWrapper = () => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-5">
      <div className="pointer-events-auto w-full max-w-md px-5">
        <BottomNav />
      </div>
    </div>
  );
};

