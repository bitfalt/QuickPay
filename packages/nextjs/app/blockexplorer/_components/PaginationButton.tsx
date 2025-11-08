import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

type PaginationButtonProps = {
  currentPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
};

const ITEMS_PER_PAGE = 20;

export const PaginationButton = ({ currentPage, totalItems, setCurrentPage }: PaginationButtonProps) => {
  const isPrevButtonDisabled = currentPage === 0;
  const isNextButtonDisabled = currentPage + 1 >= Math.ceil(totalItems / ITEMS_PER_PAGE);

  const baseButtonClasses =
    "inline-flex items-center justify-center rounded-full border border-[#023859]/60 bg-[#023859]/55 px-4 py-2 text-sm font-semibold text-[#a7ebf2] shadow-[0_20px_45px_-30px_rgba(1,28,64,0.9)] transition hover:border-[#54acbf]/70 hover:bg-[#023859]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54acbf]";
  const gradientButtonClasses =
    "inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(84,172,191,0.85),rgba(38,101,140,0.75))] px-4 py-2 text-sm font-semibold text-[#a7ebf2] shadow-[0_24px_45px_-28px_rgba(2,53,89,0.88)] transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54acbf]";

  if (isNextButtonDisabled && isPrevButtonDisabled) return null;

  return (
    <div className="mx-5 mt-6 flex items-center justify-end gap-3 text-[#a7ebf2]">
      <button
        className={isPrevButtonDisabled ? `${baseButtonClasses} opacity-40 cursor-not-allowed` : baseButtonClasses}
        disabled={isPrevButtonDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
        type="button"
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <span className="rounded-full border border-[#023859]/40 bg-[#011c40]/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/75">
        Page {currentPage + 1}
      </span>
      <button
        className={
          isNextButtonDisabled
            ? `${gradientButtonClasses} opacity-45 cursor-not-allowed`
            : gradientButtonClasses
        }
        disabled={isNextButtonDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
        type="button"
        aria-label="Next page"
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
