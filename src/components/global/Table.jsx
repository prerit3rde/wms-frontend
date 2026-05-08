const Table = ({ columns = [], data = [], className = "", stickyActions = false }) => {
  return (
    <div className="overflow-x-auto relative">
      <table className={`w-full border-collapse ${className}`}>
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            {columns.map((column) => {
              const isActions = column.key === "actions";
              const stickyClass = stickyActions && isActions ? "sticky right-0 bg-gray-100 z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]" : "";
              
              return (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap ${stickyClass}`}
                >
                  {column.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                {columns.map((column) => {
                  const isActions = column.key === "actions";
                  const stickyClass = stickyActions && isActions ? "sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]" : "";

                  return (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-700 whitespace-nowrap ${stickyClass}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
