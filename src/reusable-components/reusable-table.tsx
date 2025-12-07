import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string | number;
  className?: string;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  loading?: boolean;
  noDataMessage?: string;
  dense?: boolean;
  onRowClick?: (row: T) => void;
}

export default function ReusableTable<T>({
  data,
  columns,
  rowsPerPageOptions = [5, 8, 12, 24],
  initialRowsPerPage = 8,
  loading = false,
  noDataMessage = "No data found.",
  dense = false,
  onRowClick,
}: ReusableTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table size={dense ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} align={col.align || "left"} style={{ width: col.width }}>
                  <Typography variant="subtitle2">{col.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : paged.length > 0 ? (
              paged.map((row, rIdx) => (
                <TableRow
                  key={rIdx}
                  hover
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align || "left"}>
                      {col.render ? (
                        col.render(row)
                      ) : (
                        // Basic accessor (row as any)[col.key]
                        <span>{(row as any)[col.key]}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{noDataMessage}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" p={2}>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </Box>
    </Paper>
  );
}
