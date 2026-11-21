import { Link } from "react-router"
import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { AdminPageHeader, StatusBadge } from "@/components/custom/admin-page"
import { DataTable, DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format-date"

const columns = [
    {
        accessorKey: "item_name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Item" />,
        cell: ({ row }) => <Link className="font-medium hover:underline" to={`/admin/reports/found/${row.original.id}`}>{row.original.item_name}</Link>,
    },
    { accessorKey: "category", header: ({ header }) => <DataTableColumnHeader header={header} title="Category" /> },
    { accessorKey: "location_found", header: ({ header }) => <DataTableColumnHeader header={header} title="Found at" /> },
    {
        accessorKey: "status",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
    },
    {
        accessorKey: "created_at",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Reported" />,
        cell: ({ cell }) => <span className="font-heading text-xs text-muted-foreground">{formatDate(cell.getValue())}</span>,
    },
    {
        id: "open",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => <Button asChild variant="ghost" size="sm"><Link to={`/admin/reports/found/${row.original.id}`}>Review</Link></Button>,
    },
]

export function FoundReports() {
    const { data, error, isLoading, isValidating, mutate } = useSWR("/admin/reports/found")
    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader title="Found reports" description="Confirm physical handover before preparing an item for the public catalogue." />
            <DataTable
                columns={columns}
                data={data}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isRefreshing={isValidating && !isLoading}
                error={error ? new Error(apiErrorMessage(error)) : null}
                onRetry={() => mutate()}
                searchPlaceholder="Search found reports..."
                empty={{ title: "No found reports", description: "New reports from finders will appear here." }}
            />
        </section>
    )
}
