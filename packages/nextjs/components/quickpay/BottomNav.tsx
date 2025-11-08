"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cog6ToothIcon,
  HomeIcon,
  PaperAirplaneIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

type NavItem = {
  href: string;
  label: string;
  icon: (props: ComponentProps<typeof HomeIcon>) => JSX.Element;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: HomeIcon,
    match: pathname => pathname === "/home",
  },
  {
    href: "/scan",
    label: "Send",
    icon: PaperAirplaneIcon,
    match: pathname => pathname.startsWith("/scan") || pathname.startsWith("/send"),
  },
  {
    href: "/receive",
    label: "Receive",
    icon: QrCodeIcon,
    match: pathname => pathname.startsWith("/receive"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Cog6ToothIcon,
    match: pathname => pathname.startsWith("/settings"),
  },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="glass-panel mx-auto flex w-full items-center justify-around gap-2 rounded-[1.75rem] border-[#a7ebf2]/10 bg-[#a7ebf2]/10 px-3 py-2.5 shadow-[0_22px_50px_-32px_rgba(1,28,64,0.9)] backdrop-blur-xl"
    >
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = item.match(pathname ?? "");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2] ${
              isActive
                ? "glass-panel is-highlight text-[#a7ebf2] shadow-[0_18px_45px_-28px_rgba(2,53,89,0.95)]"
                : "text-soft hover:text-[#a7ebf2]"
            }`}
          >
            <Icon className="h-6 w-6" aria-hidden />
            <span className="mt-1 font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;

