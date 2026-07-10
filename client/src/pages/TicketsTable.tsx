import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import axios from "axios";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Role } from "core/constants/role";
import { type Ticket } from "core/constants/ticket";
import { categoryLabel } from "core/constants/ticket-category";

import { useSession } from "@/lib/auth-client";

import ErrorAlert from "@/components/ErrorAlert";
import StatusBadge from "@/components/StatusBadge";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Trash2,
} from "lucide-react";

import type { TicketFilters } from "./TicketsPage";

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 10;

export default function TicketsTable({
  filters,
}: {
  filters: TicketFilters;
}) {
  const { data: session } = useSession();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [filters]);
    const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "tickets",
      sortBy,
      sortOrder,
      filters,
      pagination.pageIndex,
    ],
    queryFn: async () => {
      const { data } = await axios.get<TicketsResponse>("/api/tickets", {
        params: {
          sortBy,
          sortOrder,
          ...filters,
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
        },
      });

      return data;
    },
  });

  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / pagination.pageSize);
  const isEmpty = !isLoading && !error && total === 0;

  const columns = useMemo<ColumnDef<Ticket>[]>(() => {
    const cols: ColumnDef<Ticket>[] = [
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <Link
            to={`/tickets/${row.original.id}`}
            className="link font-medium transition-colors hover:text-primary"
          >
            {row.original.subject}
          </Link>
        ),
      },
      {
        accessorKey: "senderName",
        header: "Sender",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.senderName}
            </div>

            <div className="text-sm text-muted-foreground">
              {row.original.senderEmail}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) =>
          row.original.category ? (
            <Badge
              variant="secondary"
              className="rounded-full border-border/60 bg-muted font-normal"
            >
              {categoryLabel[row.original.category]}
            </Badge>
          ) : (
            <span className="text-muted-foreground">
              —
            </span>
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(
              row.original.createdAt
            ).toLocaleDateString()}
          </span>
        ),
      },
    ];

    if (session?.user.role === Role.admin) {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
             <Button
  variant="ghost"
  size="sm"
  className="text-muted-foreground hover:bg-accent hover:text-primary"
>
  <Trash2 className="h-4 w-4" />
</Button>
            </AlertDialogTrigger>

          <AlertDialogContent
  size="sm"
  className="border-border bg-card shadow-xl"
>
  <AlertDialogHeader>
    <AlertDialogTitle className="text-lg font-semibold text-foreground">
      Delete ticket?
    </AlertDialogTitle>

    <AlertDialogDescription className="text-sm text-muted-foreground">
      This action cannot be undone. The ticket and all of its replies will be
      permanently deleted.
    </AlertDialogDescription>
  </AlertDialogHeader>

  <AlertDialogFooter>
    <AlertDialogCancel
      className="
        border-border
        bg-background
        text-foreground
        hover:bg-muted
      "
    >
      Cancel
    </AlertDialogCancel>

    <AlertDialogAction
      variant="default"
      className="
        bg-primary
        text-primary-foreground
        hover:opacity-90
      "
      onClick={() => deleteMutation.mutate(row.original.id)}
    >
      Delete
    </AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>
          </AlertDialog>
        ),
      });
    }

    return cols;
  }, [session?.user.role, deleteMutation]);

  const table = useReactTable({
    data: data?.tickets ?? [],
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    enableMultiSort: false,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <div className="p-5">
        <ErrorAlert message="Failed to fetch tickets" />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border/60 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-5"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group/sort -ml-3 gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover/sort:opacity-100" />
                      )}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow
                  key={i}
                  className="border-border/40"
                >
                  <TableCell className="px-5 py-3.5">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>

                  <TableCell className="px-5 py-3.5">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>

                  <TableCell className="px-5 py-3.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>

                  <TableCell className="px-5 py-3.5">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>

                  <TableCell className="px-5 py-3.5">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>

                  {session?.user.role === Role.admin && (
                    <TableCell className="px-5 py-3.5">
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  )}
                </TableRow>
              ))
                          ) : isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="px-5 py-16"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                      <Inbox className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium">
                      No tickets found
                    </p>

                    <p className="max-w-xs text-sm text-muted-foreground">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/40 transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-5 py-3.5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && !error && (
        <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "No tickets"
              : `Showing ${
                  pagination.pageIndex * pagination.pageSize + 1
                }–${Math.min(
                  (pagination.pageIndex + 1) *
                    pagination.pageSize,
                  total
                )} of ${total} tickets`}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/60 bg-background/60 hover:border-primary/40"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/60 bg-background/60 hover:border-primary/40"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-sm font-medium">
              {pagination.pageIndex + 1} / {pageCount || 1}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/60 bg-background/60 hover:border-primary/40"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/60 bg-background/60 hover:border-primary/40"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}