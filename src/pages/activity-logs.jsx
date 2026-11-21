import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { AdminPageHeader } from "@/components/custom/admin-page"
import { DataTable, DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format-date"

const actionClasses = {
    created: "border-sky-300 bg-sky-50 text-sky-800",
    updated: "border-slate-300 bg-slate-50 text-slate-700",
    received: "border-amber-300 bg-amber-50 text-amber-800",
    published: "border-teal-300 bg-teal-50 text-teal-800",
    submitted: "border-violet-300 bg-violet-50 text-violet-800",
    approved: "border-emerald-300 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-300 bg-rose-50 text-rose-800",
    returned: "border-emerald-300 bg-emerald-50 text-emerald-800",
    login: "border-sky-300 bg-sky-50 text-sky-800",
    logout: "border-slate-300 bg-slate-50 text-slate-700",
}

const columns = [
    {
        accessorKey: "created_at",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Time" />,
        cell: ({ cell }) => (
            <time className="font-heading text-xs text-muted-foreground">
                {formatDate(cell.getValue())}
            </time>
        ),
    },
    {
        accessorKey: "admin_name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Administrator" />,
        cell: ({ cell }) => <span className="font-medium">{cell.getValue()}</span>,
    },
    {
        accessorKey: "action",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Action" />,
        cell: ({ cell }) => (
            <Badge variant="outline" className={actionClasses[cell.getValue()]}>
                {cell.getValue()}
            </Badge>
        ),
    },
    {
        accessorKey: "entity",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Record" />,
        cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue().replaceAll("_", " ")}</span>,
    },
    {
        accessorKey: "description",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Event" />,
        cell: ({ cell }) => <span className="block min-w-64">{cell.getValue()}</span>,
    },
]

export function ActivityLogs() {
    const { data, error, isLoading, isValidating, mutate } = useSWR("/admin/logs")

    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader
                title="Activity logs"
                description="An audit trail of administrator decisions and lifecycle changes."
            />
            <DataTable
                columns={columns}
                data={data}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isRefreshing={isValidating && !isLoading}
                error={error ? new Error(apiErrorMessage(error)) : null}
                onRetry={() => mutate()}
                searchPlaceholder="Search activity..."
                empty={{
                    title: "No activity recorded",
                    description: "Administrator actions will appear here.",
                }}
            />
        </section>
    )
}
