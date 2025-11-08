"use client";

import { useEffect, useState } from "react";
import { Address, createPublicClient, http, toHex } from "viem";
import { hardhat } from "viem/chains";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export const AddressStorageTab = ({ address }: { address: Address }) => {
  const [storage, setStorage] = useState<string[]>([]);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const storageData = [];
        let idx = 0;

        while (true) {
          const storageAtPosition = await publicClient.getStorageAt({
            address: address,
            slot: toHex(idx),
          });

          if (storageAtPosition === "0x" + "0".repeat(64)) break;

          if (storageAtPosition) {
            storageData.push(storageAtPosition);
          }

          idx++;
        }
        setStorage(storageData);
      } catch (error) {
        console.error("Failed to fetch storage:", error);
      }
    };

    fetchStorage();
  }, [address]);

  return (
    <section className="glass-panel space-y-4 rounded-[1.75rem] px-6 py-6 text-[#a7ebf2]">
      <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70">Storage Slots</h3>
      {storage.length > 0 ? (
        <div className="code-surface max-h-[420px] overflow-y-auto">
          <pre>
            {storage.map((data, i) => (
              <div key={i}>
                <strong>Slot {i}:</strong> {data}
              </div>
            ))}
          </pre>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-[#023859]/40 bg-[#011c40]/60 px-4 py-6 text-sm text-[#a7ebf2]/70">
          This contract does not have any storage variables.
        </div>
      )}
    </section>
  );
};
