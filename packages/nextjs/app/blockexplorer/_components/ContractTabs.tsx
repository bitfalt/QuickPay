"use client";

import { useEffect, useMemo, useState } from "react";
import { AddressCodeTab } from "./AddressCodeTab";
import { AddressLogsTab } from "./AddressLogsTab";
import { AddressStorageTab } from "./AddressStorageTab";
import { PaginationButton } from "./PaginationButton";
import { TransactionsTable } from "./TransactionsTable";
import { Address, createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

type AddressCodeTabProps = {
  bytecode: string;
  assembly: string;
};

type PageProps = {
  address: Address;
  contractData: AddressCodeTabProps | null;
};

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export const ContractTabs = ({ address, contractData }: PageProps) => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = useFetchBlocks();
  const [activeTab, setActiveTab] = useState("transactions");
  const [isContract, setIsContract] = useState(false);

  useEffect(() => {
    const checkIsContract = async () => {
      const contractCode = await publicClient.getBytecode({ address: address });
      setIsContract(contractCode !== undefined && contractCode !== "0x");
    };

    checkIsContract();
  }, [address]);

  const tabs = useMemo(
    () =>
      [
        { id: "transactions", label: "Transactions", isVisible: true },
        { id: "code", label: "Code", isVisible: isContract && !!contractData },
        { id: "storage", label: "Storage", isVisible: isContract },
        { id: "logs", label: "Logs", isVisible: isContract },
      ].filter(tab => tab.isVisible),
    [contractData, isContract],
  );

  useEffect(() => {
    if (!tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id ?? "transactions");
    }
  }, [tabs, activeTab]);

  const filteredBlocks = blocks.filter(block =>
    block.transactions.some(tx => {
      if (typeof tx === "string") {
        return false;
      }
      return tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase();
    }),
  );

  return (
    <div className="space-y-6">
      {tabs.length > 1 && (
        <div role="tablist" className="tab-pill-group">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              className={`tab-pill ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-4">
          <TransactionsTable blocks={filteredBlocks} transactionReceipts={transactionReceipts} />
          <PaginationButton
            currentPage={currentPage}
            totalItems={Number(totalBlocks)}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
      {activeTab === "code" && contractData && (
        <AddressCodeTab bytecode={contractData.bytecode} assembly={contractData.assembly} />
      )}
      {activeTab === "storage" && <AddressStorageTab address={address} />}
      {activeTab === "logs" && <AddressLogsTab address={address} />}
    </div>
  );
};
