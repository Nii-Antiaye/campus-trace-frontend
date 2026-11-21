import { Link } from "react-router"
import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { AdminPageHeader, StatusBadge } from "@/components/custom/admin-page"
import { DataTable, DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format-date"

const columns = [
    {
        accessorKey: "item_title",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Item" />,
        cell: ({ row }) => <Link className="font-medium hover:underline" to={`/admin/claims/${row.original.id}`}>{row.original.item_title}</Link>,
    },
    { accessorKey: "full_name", header: ({ header }) => <DataTableColumnHeader header={header} title="Claimant" /> },
    { accessorKey: "email", header: ({ header }) => <DataTableColumnHeader header={header} title="Contact" />, cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue()}</span> },
    {
        accessorKey: "status",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
    },
    {
        accessorKey: "created_at",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Submitted" />,
        cell: ({ cell }) => <span className="font-heading text-xs text-muted-foreground">{formatDate(cell.getValue())}</span>,
    },
    {
        id: "review",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => <Button asChild variant={row.original.status === "pending" ? "default" : "ghost"} size="sm"><Link to={`/admin/claims/${row.original.id}`}>{row.original.status === "pending" ? "Review" : "View"}</Link></Button>,
    },
]

export function Claims() {
    const { data, error, isLoading, isValidating, mutate } = useSWR("/admin/claims")
    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader title="Ownership claims" description="Compare private answers with item records before approving collection." />
            <DataTable
                columns={columns}
                data={data}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isRefreshing={isValidating && !isLoading}
                error={error ? new Error(apiErrorMessage(error)) : null}
                onRetry={() => mutate()}
                searchPlaceholder="Search claims..."
                empty={{ title: "No ownership claims", description: "Claims on published items will appear here." }}
            />
        </section>
    )
}
