import { TransactionHash } from "./TransactionHash";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks, transactionReceipts }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();

  if (!blocks.length) {
    return (
      <div className="glass-panel is-highlight flex flex-col items-center justify-center rounded-[1.75rem] px-6 py-16 text-center text-[#a7ebf2]">
        <p className="text-lg font-semibold">No transactions yet</p>
        <p className="mt-2 text-sm text-[#a7ebf2]/65">Send a transaction to see it appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem] px-0 text-[#a7ebf2]">
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#023859]/45 text-[11px] uppercase tracking-[0.3em] text-[#a7ebf2]/70">
            <tr>
              <th className="px-6 py-4 font-semibold">Tx Hash</th>
              <th className="px-6 py-4 font-semibold">Function</th>
              <th className="px-6 py-4 font-semibold">Block</th>
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">From</th>
              <th className="px-6 py-4 font-semibold">To</th>
              <th className="px-6 py-4 text-right font-semibold">
                Value ({targetNetwork.nativeCurrency.symbol})
              </th>
            </tr>
          </thead>
          <tbody>
            {blocks.map(block =>
              (block.transactions as TransactionWithFunction[]).map(tx => {
                const receipt = transactionReceipts[tx.hash];
                const timeMined = new Date(Number(block.timestamp) * 1000).toLocaleString();
                const functionCalled = tx.input.substring(0, 10);

                return (
                  <tr
                    key={tx.hash}
                    className="border-b border-[#023859]/25 bg-transparent transition hover:bg-[#023859]/18"
                  >
                    <td className="px-6 py-4 align-top">
                      <TransactionHash hash={tx.hash} />
                    </td>
                    <td className="px-6 py-4 align-top">
                      {tx.functionName === "0x" ? "" : <span className="mr-2 font-semibold">{tx.functionName}</span>}
                      {functionCalled !== "0x" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#023859]/55 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a7ebf2]">
                          {functionCalled}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-[#a7ebf2]/80">{block.number?.toString()}</td>
                    <td className="px-6 py-4 align-top text-[#a7ebf2]/70">{timeMined}</td>
                    <td className="px-6 py-4 align-top">
                      <Address address={tx.from} size="sm" onlyEnsOrAddress />
                    </td>
                    <td className="px-6 py-4 align-top">
                      {!receipt?.contractAddress ? (
                        tx.to && <Address address={tx.to} size="sm" onlyEnsOrAddress />
                      ) : (
                        <div className="relative">
                          <Address address={receipt.contractAddress} size="sm" onlyEnsOrAddress />
                          <small className="absolute left-0 top-6 text-[10px] uppercase tracking-[0.28em] text-[#a7ebf2]/60">
                            Contract
                          </small>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#54acbf]">
                      {formatEther(tx.value)} {targetNetwork.nativeCurrency.symbol}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
