"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WdkProvider } from "~~/contexts/WdkContext";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <main className="relative flex min-h-screen flex-col">{children}</main>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WdkProvider>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#54acbf" />
        <ScaffoldEthApp>{children}</ScaffoldEthApp>
      </QueryClientProvider>
    </WdkProvider>
  );
};
