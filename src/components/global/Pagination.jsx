import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  limit = 50,
  onPageChange = () => {},
  className = "",
}) => {
  const siblingCount = 1;

  if (totalPages <= 1 && totalRecords <= limit) return null;

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
    <div className={`mt-4 flex flex-col md:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4 w-full ${className}`}>
      
      {/* Total Records Text */}
      {totalRecords > 0 ? (
        <span className="text-sm font-semibold text-slate-700">
          Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)} of <span className="text-blue-600">{totalRecords}</span> records
        </span>
      ) : (
        <span className="text-sm font-semibold text-slate-700">No records</span>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
        
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30"
        >
          First
        </button>

        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30 mr-2"
        >
          Prev
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-1 text-slate-400 text-xs">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] px-2 py-1 text-xs border rounded transition ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 hover:bg-slate-100 border-slate-300"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30 ml-2"
        >
          Next
        </button>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(totalPages)}
          className="px-2 py-1 text-xs bg-white border rounded hover:bg-slate-100 disabled:opacity-30"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;