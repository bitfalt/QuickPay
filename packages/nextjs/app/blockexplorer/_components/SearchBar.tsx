"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress, isHex } from "viem";
import { useWdkProvider } from "~~/hooks/scaffold-eth";

export const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const provider = useWdkProvider();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isHex(searchInput)) {
      try {
        const tx = await provider?.getTransaction(searchInput);
        if (tx) {
          router.push(`/blockexplorer/transaction/${searchInput}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      }
    }

    if (isAddress(searchInput)) {
      router.push(`/blockexplorer/address/${searchInput}`);
      return;
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-[1.75rem] border border-[#023859]/60 bg-[#011c40]/70 px-4 py-3 shadow-[0_20px_45px_-30px_rgba(1,28,64,0.9)] backdrop-blur-2xl"
    >
      <input
        className="flex-1 rounded-full border border-transparent bg-transparent px-4 py-2.5 text-sm text-[#a7ebf2] placeholder:text-[#a7ebf2]/40 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#54acbf]"
        type="text"
        value={searchInput}
        placeholder="Search by hash or address"
        onChange={e => setSearchInput(e.target.value)}
      />
      <button
        className="rounded-full bg-[linear-gradient(135deg,rgba(84,172,191,0.85),rgba(38,101,140,0.75))] px-5 py-2 text-sm font-semibold text-[#a7ebf2] shadow-[0_22px_40px_-26px_rgba(2,53,89,0.88)] transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54acbf]"
        type="submit"
      >
        Search
      </button>
    </form>
  );
};
