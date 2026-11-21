import { useEffect, useRef, useState } from "react"
import {
    columnFilteringFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    tableFeatures,
    useTable,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon, OctagonAlertIcon, SearchIcon, SearchXIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { NativeSelect } from "@/components/ui/native-select"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "cn"

// TanStack Table v9 requires features AND their row-model factories to be
// registered up front. Keep this at module scope: a new features object per
// render rebuilds every row model.
const dataTableFeatures = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortFns: { alphanumeric: sortFn_alphanumeric },
})

// Stable fallback so `data ?? []` never produces a fresh array per render.
const EMPTY_ROWS = []

// A row click that starts inside one of these belongs to that control, not to
// the row: cell actions must not also open the record.
const ROW_CLICK_IGNORED = "a, button, input, select, textarea, [role='menuitem']"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

function useDebouncedValue(value, delayMs) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs)
        return () => clearTimeout(timer)
    }, [value, delayMs])
    return debounced
}

/**
 * Sortable header for a DataTable column. Render it from a column def:
 * `header: ({ header }) => <DataTableColumnHeader header={header} title="Email" />`
 */
export function DataTableColumnHeader({ header, title, className }) {
    if (!header.column.getCanSort?.()) {
        return <span className={cn("px-2", className)}>{title}</span>
    }

    const sorted = header.column.getIsSorted()

    return (
        <Button
            variant="ghost"
            size="xs"
            onClick={() => header.column.toggleSorting()}
            className={cn("data-[active=true]:text-foreground", sorted && "data-[active=true]", className)}
            data-active={sorted ? "true" : "false"}
        >
            {title}
            {sorted === "asc" ? (
                <ArrowUpIcon />
            ) : sorted === "desc" ? (
                <ArrowDownIcon />
            ) : (
                <ArrowUpDownIcon className="text-muted-foreground" />
            )}
        </Button>
    )
}

/**
 * Reusable DataTable on TanStack Table v9 + shadcn Table primitives.
 *
 * Client mode (default): sorting, filtering and pagination run on `data` locally.
 *
 * Server mode: pass `serverPagination` plus `totalRows` and `onQueryChange`;
 * the table becomes a controlled view — every pagination/sort/search change is
 * reported through `onQueryChange` and `data` must already be the current page
 * from the API. Pair with SWR `keepPreviousData` and pass `isRefreshing` to
 * dim rows during refetches.
 *
 * `onRowClick(row)` makes the whole row a pointer target for opening a record.
 * Clicks that land on a control inside a cell are left to that control, so pair
 * it with a real link inside one of the cells for keyboard users.
 */
export function DataTable({
    columns,
    data,
    getRowId,
    serverPagination = false,
    totalRows,
    onQueryChange,
    onRowClick,
    isLoading = false,
    isRefreshing = false,
    error = null,
    onRetry,
    searchPlaceholder = "Search...",
    empty,
    toolbarActions,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSizeOptions[0] })
    const [sorting, setSorting] = useState([])
    const [globalFilter, setGlobalFilter] = useState("")
    const debouncedFilter = useDebouncedValue(globalFilter, 300)

    // New sort or search returns to page 1 — folded into the change handlers so
    // it lands in the same render instead of an effect that sets state.
    const handleSortingChange = (updater) => {
        setSorting(updater)
        setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }))
    }
    const handleFilterChange = (updater) => {
        setGlobalFilter(updater)
        setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }))
    }

    const rows = data ?? EMPTY_ROWS

    const handleRowClick = onRowClick
        ? (event, row) => {
            if (event.target.closest(ROW_CLICK_IGNORED)) return
            onRowClick(row)
        }
        : undefined

    const table = useTable({
        features: dataTableFeatures,
        columns,
        data: rows,
        getRowId,
        globalFilterFn: "includesString",
        enableMultiSort: false,
        // Controlled state: keep table state in React state, not in the table.
        state: { pagination, sorting, globalFilter: debouncedFilter },
        onPaginationChange: setPagination,
        onSortingChange: handleSortingChange,
        onGlobalFilterChange: handleFilterChange,
        // Server mode: data arrives pre-sorted/filtered/paged from the API.
        manualPagination: serverPagination,
        manualSorting: serverPagination,
        manualFiltering: serverPagination,
        rowCount: totalRows,
        autoResetPageIndex: false,
    })

    // Report state changes to the owner (e.g. to rebuild the SWR key / query params).
    const onQueryChangeRef = useRef(onQueryChange)
    useEffect(() => {
        onQueryChangeRef.current = onQueryChange
    })
    useEffect(() => {
        onQueryChangeRef.current?.({ pagination, sorting, globalFilter: debouncedFilter })
    }, [pagination, sorting, debouncedFilter])

    const pageIndex = table.state.pagination.pageIndex
    const pageCount = table.getPageCount()
    const rowCount = serverPagination ? (totalRows ?? 0) : table.getRowCount()
    const canPrevious = table.getCanPreviousPage()
    const canNext = table.getCanNextPage()
    const showEmpty = !isLoading && !error && table.getRowModel().rows.length === 0

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative w-full max-w-xs">
                    <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={searchPlaceholder}
                        aria-label={searchPlaceholder}
                        className="pl-8"
                    />
                    {globalFilter && (
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="absolute top-1/2 right-1 -translate-y-1/2"
                            onClick={() => setGlobalFilter("")}
                            aria-label="Clear search"
                        >
                            <SearchXIcon />
                        </Button>
                    )}
                </div>
                {toolbarActions}
            </div>

            <div className={cn("border transition-opacity", isRefreshing && "opacity-60")}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pagination.pageSize > 8 ? 8 : pagination.pageSize }).map((_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    {columns.map((column, j) => (
                                        <TableCell key={column.id ?? j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length} className="p-0">
                                    <Empty className="border-0 py-12">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                                                <OctagonAlertIcon />
                                            </EmptyMedia>
                                            <EmptyTitle>Couldn&rsquo;t load this table</EmptyTitle>
                                            <EmptyDescription>{error.message}</EmptyDescription>
                                        </EmptyHeader>
                                        {onRetry && (
                                            <Button variant="outline" size="sm" onClick={onRetry}>
                                                Try again
                                            </Button>
                                        )}
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : showEmpty ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length} className="p-0">
                                    <Empty className="border-0 py-12">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <SearchXIcon />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                {debouncedFilter ? "No matches" : empty?.title ?? "Nothing here yet"}
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                {debouncedFilter
                                                    ? `No results for “${debouncedFilter}”. Try a different search.`
                                                    : empty?.description}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        {debouncedFilter && (
                                            <Button variant="outline" size="sm" onClick={() => setGlobalFilter("")}>
                                                Clear search
                                            </Button>
                                        )}
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={handleRowClick && ((event) => handleRowClick(event, row))}
                                    className={cn(handleRowClick && "cursor-pointer")}
                                >
                                    {row.getAllCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <span className="font-heading text-xs text-muted-foreground tabular-nums">
                        {rowCount} {rowCount === 1 ? "row" : "rows"}
                    </span>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        Rows per page
                        <NativeSelect
                            size="sm"
                            value={String(pagination.pageSize)}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </NativeSelect>
                    </label>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-heading text-xs text-muted-foreground tabular-nums">
                        Page {pageIndex + 1} of {Math.max(pageCount, 1)}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.previousPage()}
                            disabled={!canPrevious}
                            aria-label="Previous page"
                        >
                            <ChevronLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.nextPage()}
                            disabled={!canNext}
                            aria-label="Next page"
                        >
                            <ChevronRightIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
