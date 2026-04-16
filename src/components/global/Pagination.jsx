import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  className = "",
}) => {
  const siblingCount = 1;

  const generatePagination = () => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const pages = [];

    pages.push(1);

    if (showLeftDots) pages.push("...");

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }

    if (showRightDots) pages.push("...");

    if (totalPages !== 1) pages.push(totalPages);

    return pages;
  };

  const pages = generatePagination();

  return (
    <div className={`flex items-center justify-center gap-5 m-2.5 ${className}`}>
      
      {/* Prev */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1447E6] text-[#1447E6] hover:bg-[#1447E6]/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
        Previous
      </button>

      {/* Pages */}
      <div className="flex items-center gap-3">
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition ${
                currentPage === page
                  ? "bg-[#1447E6]/10 text-[#1447E6]"
                  : "text-gray-700 hover:text-[#1447E6]"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1447E6] text-[#1447E6] hover:bg-[#1447E6]/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;