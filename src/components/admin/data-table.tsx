"use client";

import type { ReactNode } from "react";

export type AdminTableColumn<T> = {
  id: string;
  label: ReactNode;
  className?: string;
  render: (row: T) => ReactNode;
};

type Identifiable = { id: string };

export function AdminDataTable<T extends Identifiable>({
  columns,
  rows,
  selectedIds,
  onSelectionChange,
  onRowClick,
  empty,
  rowLabel = "record"
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  rowLabel?: string;
}) {
  const selectable = Boolean(selectedIds && onSelectionChange);
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds?.includes(row.id));
  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange((selectedIds ?? []).filter((id) => !rows.some((row) => row.id === id)));
      return;
    }
    onSelectionChange([...new Set([...(selectedIds ?? []), ...rows.map((row) => row.id)])]);
  };
  const toggleRow = (id: string) => onSelectionChange?.(selectedIds?.includes(id) ? selectedIds.filter((value) => value !== id) : [...(selectedIds ?? []), id]);

  if (rows.length === 0 && empty) return <div className="rounded-md border border-[#e3e0dc] bg-white">{empty}</div>;

  return (
    <div className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-[#e3e0dc] bg-[#faf6ef] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
            <tr>
              {selectable ? <th className="w-11 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label={`Select all ${rowLabel}s`} className="h-4 w-4 accent-[#236339]" /></th> : null}
              {columns.map((column) => <th key={column.id} className={`whitespace-nowrap px-4 py-3 font-medium ${column.className ?? ""}`}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeeae5]">
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                onKeyDown={onRowClick ? (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? `Open ${rowLabel}` : undefined}
                className={onRowClick ? "cursor-pointer transition hover:bg-[#fcfbf8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#236339]" : undefined}
              >
                {selectable ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selectedIds?.includes(row.id) ?? false} onChange={() => toggleRow(row.id)} aria-label={`Select ${rowLabel}`} className="h-4 w-4 accent-[#236339]" /></td> : null}
                {columns.map((column) => <td key={column.id} className={`px-4 py-3 align-middle ${column.className ?? ""}`}>{column.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableSkeleton({ columns = 6, rows = 6 }: { columns?: number; rows?: number }) {
  return <div className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white p-4"><div className="grid gap-3">{Array.from({ length: rows }, (_, row) => <div key={row} className="grid grid-cols-6 gap-3">{Array.from({ length: columns }, (_, column) => <span key={column} className="h-8 animate-pulse rounded bg-[#f1eee9]" />)}</div>)}</div></div>;
}

export function AdminPagination({ page, totalPages, onPageChange, total, pageSize, onPageSizeChange }: { page: number; totalPages: number; onPageChange: (page: number) => void; total: number; pageSize: number; onPageSizeChange: (size: number) => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4 text-xs text-[#737373]"><span>{total === 0 ? "No results" : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}</span><div className="flex items-center gap-2"><label className="flex items-center gap-1">Rows <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="rounded border border-[#d4d0cc] bg-white px-1.5 py-1 text-xs"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded border border-[#d4d0cc] px-2 py-1 disabled:opacity-35">Previous</button><span>{page} / {Math.max(totalPages, 1)}</span><button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded border border-[#d4d0cc] px-2 py-1 disabled:opacity-35">Next</button></div></div>;
}

export function downloadAdminCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(quote).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
