import { Address } from "viem";
import { useContractLogs } from "~~/hooks/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

export const AddressLogsTab = ({ address }: { address: Address }) => {
  const contractLogs = useContractLogs(address);

  return (
    <section className="glass-panel space-y-4 rounded-[1.75rem] px-6 py-6 text-[#a7ebf2]">
      <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Event Logs</h3>
      <div className="code-surface max-h-[420px] overflow-y-auto">
        <pre>
          {contractLogs.map((log, i) => (
            <div key={i}>
              <strong>Log {i}:</strong> {JSON.stringify(log, replacer, 2)}
            </div>
          ))}
        </pre>
      </div>
    </section>
  );
};
