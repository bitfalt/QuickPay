import { BackButton } from "./BackButton";
import { ContractTabs } from "./ContractTabs";
import { Address as AddressType } from "viem";
import { Address, Balance } from "~~/components/scaffold-eth";

export const AddressComponent = ({
  address,
  contractData,
}: {
  address: AddressType;
  contractData: { bytecode: string; assembly: string } | null;
}) => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-12 text-[#a7ebf2]">
      <div className="flex justify-start">
        <BackButton />
      </div>

      <section className="glass-panel is-highlight flex flex-col gap-4 rounded-[2rem] px-6 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#a7ebf2]/55">Address Overview</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Address address={address} format="long" onlyEnsOrAddress />
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#a7ebf2]/65">
              <span className="outline-pill">Balance</span>
              <Balance address={address} />
            </div>
          </div>
          {contractData && (
            <span className="outline-pill is-ambient text-[#a7ebf2]/80">
              Contract Detected
            </span>
          )}
        </div>
      </section>

      <ContractTabs address={address} contractData={contractData} />
    </div>
  );
};
