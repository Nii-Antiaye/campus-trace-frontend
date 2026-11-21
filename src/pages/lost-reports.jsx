import { Link } from "react-router"
import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { AdminPageHeader, StatusBadge } from "@/components/custom/admin-page"
import { DataTable, DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format-date"

const columns = [
    {
        accessorKey: "item_name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Missing item" />,
        cell: ({ row }) => <Link className="font-medium hover:underline" to={`/admin/reports/lost/${row.original.id}`}>{row.original.item_name}</Link>,
    },
    { accessorKey: "category", header: ({ header }) => <DataTableColumnHeader header={header} title="Category" /> },
    { accessorKey: "last_seen_location", header: ({ header }) => <DataTableColumnHeader header={header} title="Last seen" /> },
    {
        accessorKey: "claim_count",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Claims" />,
        cell: ({ cell }) => <Badge variant="secondary">{cell.getValue()}</Badge>,
    },
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
        cell: ({ row }) => <Button asChild variant="ghost" size="sm"><Link to={`/admin/reports/lost/${row.original.id}`}>Open</Link></Button>,
    },
]

export function LostReports() {
    const { data, error, isLoading, isValidating, mutate } = useSWR("/admin/reports/lost")
    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader title="Lost reports" description="Track active searches and connect owners to matching published items." />
            <DataTable
                columns={columns}
                data={data}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isRefreshing={isValidating && !isLoading}
                error={error ? new Error(apiErrorMessage(error)) : null}
                onRetry={() => mutate()}
                searchPlaceholder="Search lost reports..."
                empty={{ title: "No lost reports", description: "Reports from owners will appear here." }}
            />
        </section>
    )
}
