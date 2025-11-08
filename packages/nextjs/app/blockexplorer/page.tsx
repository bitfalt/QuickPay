"use client";

import { useEffect, useState } from "react";
import { PaginationButton, SearchBar, TransactionsTable } from "./_components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { notification } from "~~/utils/scaffold-eth";

const BlockExplorer: NextPage = () => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, error } = useFetchBlocks();
  const { targetNetwork } = useTargetNetwork();
  const [isLocalNetwork, setIsLocalNetwork] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (targetNetwork.id !== hardhat.id) {
      setIsLocalNetwork(false);
    }
  }, [targetNetwork.id]);

  useEffect(() => {
    if (targetNetwork.id === hardhat.id && error) {
      setHasError(true);
    }
  }, [targetNetwork.id, error]);

  useEffect(() => {
    if (!isLocalNetwork) {
      notification.error(
        <>
          <p className="font-bold mt-0 mb-1">
            <code className="italic bg-base-300 text-base font-bold"> targetNetwork </code> is not localhost
          </p>
          <p className="m-0">
            - You are on <code className="italic bg-base-300 text-base font-bold">{targetNetwork.name}</code> .This
            block explorer is only for <code className="italic bg-base-300 text-base font-bold">localhost</code>.
          </p>
          <p className="mt-1 break-normal">
            - You can use{" "}
            <a className="text-accent" href={targetNetwork.blockExplorers?.default.url}>
              {targetNetwork.blockExplorers?.default.name}
            </a>{" "}
            instead
          </p>
        </>,
      );
    }
  }, [
    isLocalNetwork,
    targetNetwork.blockExplorers?.default.name,
    targetNetwork.blockExplorers?.default.url,
    targetNetwork.name,
  ]);

  useEffect(() => {
    if (hasError) {
      notification.error(
        <>
          <p className="font-bold mt-0 mb-1">Cannot connect to local provider</p>
          <p className="m-0">
            - Did you forget to run <code className="italic bg-base-300 text-base font-bold">yarn chain</code> ?
          </p>
          <p className="mt-1 break-normal">
            - Or you can change <code className="italic bg-base-300 text-base font-bold">targetNetwork</code> in{" "}
            <code className="italic bg-base-300 text-base font-bold">scaffold.config.ts</code>
          </p>
        </>,
      );
    }
  }, [hasError]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-12 text-[#a7ebf2]">
      <header className="glass-panel is-highlight flex flex-col gap-4 rounded-[2rem] px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#a7ebf2]/55">Block Explorer</p>
          <h1 className="mt-2 text-3xl font-semibold drop-shadow-[0_18px_38px_rgba(1,28,64,0.6)]">Network Activity</h1>
          <p className="mt-3 max-w-xl text-sm text-[#a7ebf2]/70">
            Inspect recent blocks, transactions and contract interactions across your current QuickPay network.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <span className="outline-pill is-ambient">
            <span>Target</span>
            {targetNetwork.name}
          </span>
          <span className="text-xs uppercase tracking-[0.35em] text-[#a7ebf2]/55">
            {isLocalNetwork ? "Local Development Chain" : "External Chain"}
          </span>
        </div>
      </header>

      <SearchBar />

      <TransactionsTable blocks={blocks} transactionReceipts={transactionReceipts} />

      <PaginationButton currentPage={currentPage} totalItems={Number(totalBlocks)} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default BlockExplorer;
