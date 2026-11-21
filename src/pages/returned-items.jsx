import { Link } from "react-router"
import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { AdminPageHeader, StatusBadge } from "@/components/custom/admin-page"
import { DataTable, DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format-date"

const columns = [
    {
        accessorKey: "title",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Item" />,
        cell: ({ cell }) => <span className="font-medium">{cell.getValue()}</span>,
    },
    {
        accessorKey: "category",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Category" />,
    },
    {
        accessorKey: "owner_name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Collected by" />,
    },
    {
        accessorKey: "status",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
    },
    {
        accessorKey: "returned_at",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Handed over" />,
        cell: ({ cell }) => (
            <span className="font-heading text-xs text-muted-foreground">
                {formatDate(cell.getValue())}
            </span>
        ),
    },
    {
        id: "claim",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => row.original.claim_id
            ? (
                <Button asChild variant="ghost" size="sm">
                    <Link to={`/admin/claims/${row.original.claim_id}`}>View record</Link>
                </Button>
            )
            : null,
    },
]

export function ReturnedItems() {
    const { data, error, isLoading, isValidating, mutate } = useSWR("/admin/returned")

    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader
                title="Returned items"
                description="A permanent ledger of items physically handed to verified owners."
            />
            <div className="border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-950">
                A return appears here only after an administrator confirms the physical handover.
            </div>
            <DataTable
                columns={columns}
                data={data}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isRefreshing={isValidating && !isLoading}
                error={error ? new Error(apiErrorMessage(error)) : null}
                onRetry={() => mutate()}
                searchPlaceholder="Search returned items..."
                empty={{
                    title: "No completed returns",
                    description: "Items will appear here after verified collection.",
                }}
            />
        </section>
    )
}
