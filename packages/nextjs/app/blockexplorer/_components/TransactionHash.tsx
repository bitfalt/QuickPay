import Link from "next/link";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth/useCopyToClipboard";

export const TransactionHash = ({ hash }: { hash: string }) => {
  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();

  return (
    <div className="flex items-center text-[#a7ebf2]">
      <Link
        href={`/blockexplorer/transaction/${hash}`}
        className="rounded-full bg-[#023859]/45 px-3 py-1 text-xs font-semibold tracking-[0.3em] uppercase text-[#54acbf] transition hover:bg-[#023859]/65 hover:text-[#a7ebf2]"
      >
        {hash?.substring(0, 6)}...{hash?.substring(hash.length - 4)}
      </Link>
      {isAddressCopiedToClipboard ? (
        <CheckCircleIcon
          className="ml-2 h-5 w-5 text-[#54acbf]"
          aria-hidden="true"
        />
      ) : (
        <DocumentDuplicateIcon
          className="ml-2 h-5 w-5 cursor-pointer text-[#a7ebf2]/70 transition hover:text-[#a7ebf2]"
          aria-hidden="true"
          onClick={() => copyAddressToClipboard(hash)}
        />
      )}
    </div>
  );
};
