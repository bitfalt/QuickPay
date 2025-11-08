"use client";

import { useEffect, useMemo, useState } from "react";
import { Hash, Transaction, TransactionReceipt, formatEther, formatUnits } from "viem";
import { hardhat } from "viem/chains";
import { usePublicClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";
import { BackButton } from "../../_components/BackButton";

const TransactionComp = ({ txHash }: { txHash: Hash }) => {
  const client = usePublicClient({ chainId: hardhat.id });
  const [transaction, setTransaction] = useState<Transaction>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [functionCalled, setFunctionCalled] = useState<string>();

  const { targetNetwork } = useTargetNetwork();

  useEffect(() => {
    if (txHash && client) {
      const fetchTransaction = async () => {
        const tx = await client.getTransaction({ hash: txHash });
        const receipt = await client.getTransactionReceipt({ hash: txHash });

        const transactionWithDecodedData = decodeTransactionData(tx);
        setTransaction(transactionWithDecodedData);
        setReceipt(receipt);

        const functionCalled = transactionWithDecodedData.input.substring(0, 10);
        setFunctionCalled(functionCalled);
      };

      fetchTransaction();
    }
  }, [client, txHash]);

  const valueInEther = transaction ? formatEther(transaction.value) : "0";
  const gasPriceInGwei = transaction ? formatUnits(transaction.gasPrice || 0n, 9) : "0";
  const blockNumber = transaction?.blockNumber ? Number(transaction.blockNumber) : undefined;
  const statusLabel = receipt?.status === "success" ? "Confirmed" : receipt?.status === "reverted" ? "Reverted" : "Pending";
  const statusClassName = receipt?.status === "success" ? "outline-pill is-ambient text-[#54acbf]" : "outline-pill text-[#a7ebf2]/80";
  const logs = useMemo(() => receipt?.logs ?? [], [receipt?.logs]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-12 text-[#a7ebf2]">
      <div className="flex items-center justify-between">
        <BackButton />
        {blockNumber !== undefined && (
          <span className="outline-pill is-ambient text-[#a7ebf2]/80">Block {blockNumber}</span>
        )}
      </div>

      {transaction ? (
        <>
          <section className="glass-panel is-highlight flex flex-col gap-4 rounded-[2rem] px-6 py-6">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#a7ebf2]/55">Transaction</p>
            <h1 className="break-all text-xl font-semibold drop-shadow-[0_18px_38px_rgba(1,28,64,0.6)]">
              {transaction.hash}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className={statusClassName}>{statusLabel}</span>
              <span className="outline-pill text-[#54acbf]">
                {valueInEther} {targetNetwork.nativeCurrency.symbol}
              </span>
              <span className="outline-pill text-[#a0bacc]">Gas {gasPriceInGwei} Gwei</span>
            </div>
          </section>

          <section className="glass-panel grid gap-6 rounded-[1.9rem] px-6 py-6 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">From</h2>
              <Address address={transaction.from} format="long" onlyEnsOrAddress />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">To</h2>
              {!receipt?.contractAddress ? (
                transaction.to && <Address address={transaction.to} format="long" onlyEnsOrAddress />
              ) : (
                <div className="space-y-2">
                  <span className="outline-pill text-[#a7ebf2]/75">Contract Creation</span>
                  <Address address={receipt.contractAddress} format="long" onlyEnsOrAddress />
                </div>
              )}
            </div>
            <div className="space-y-3 md:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Function</h2>
              {functionCalled === "0x" ? (
                <p className="text-sm text-[#a7ebf2]/70">This transaction did not call any function.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#023859]/50 bg-[#023859]/45 px-4 py-1 text-sm font-semibold text-[#a7ebf2]">
                    {getFunctionDetails(transaction)}
                  </span>
                  <span className="rounded-full bg-[#023859]/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]">
                    {functionCalled}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="glass-panel space-y-4 rounded-[1.9rem] px-6 py-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Call Data</h2>
            <div className="code-surface max-h-[320px] overflow-y-auto">
              <pre>{transaction.input}</pre>
            </div>
          </section>

          <section className="glass-panel space-y-4 rounded-[1.9rem] px-6 py-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Logs</h2>
            {logs.length ? (
              <div className="code-surface max-h-[320px] overflow-y-auto">
                <pre>
                  {logs.map((log, index) => (
                    <div key={index}>
                      <strong>Log {index}:</strong> {JSON.stringify(log, replacer, 2)}
                    </div>
                  ))}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-[#a7ebf2]/70">No logs emitted by this transaction.</p>
            )}
          </section>
        </>
      ) : (
        <div className="glass-panel flex items-center justify-center rounded-[1.9rem] px-6 py-24 text-[#a7ebf2]/70">
          Loading transaction details...
        </div>
      )}
    </div>
  );
};

export default TransactionComp;
