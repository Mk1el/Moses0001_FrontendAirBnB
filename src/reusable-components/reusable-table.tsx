import React, { useState } from "react";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  itemsPerPage?: number;
  loading?: boolean;
  noDataMessage?: string;
}

export default function ReusableTable<T>({
  data,
  columns,
  itemsPerPage = 5,
  loading = false,
  noDataMessage = "No data found.",
}: ReusableTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`p-3 text-left font-medium ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-6 italic text-gray-500">
                Loading...
              </td>
            </tr>
          ) : currentData.length > 0 ? (
            currentData.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b hover:bg-gray-50 transition">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`p-3 ${col.className || ""}`}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center p-6 italic text-gray-500">
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded hover:bg-gray-300 ${
                currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
