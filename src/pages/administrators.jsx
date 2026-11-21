import { Hashvatar } from "hashvatar/react"
import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { CreateAdminDialog } from "@/components/custom/create-admin-dialog"
import { DataTable, DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { DeleteAdminDialog } from "@/components/custom/delete-admin-dialog"
import { EditAdminDialog } from "@/components/custom/edit-admin-dialog"
import { Badge } from "@/components/ui/badge"
import { AdminPageHeader } from "@/components/custom/admin-page"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
})

export function Administrator() {
    const { data: currentAdmin } = useSWR("/admin/me")
    const {
        data: administrators,
        error,
        isLoading,
        isValidating,
        mutate,
    } = useSWR("/admin/accounts")
    const canManageAccounts = currentAdmin?.role === "super_admin"

    const columns = [
            {
                accessorKey: "full_name",
                header: ({ header }) => <DataTableColumnHeader header={header} title="Administrator" />,
                cell: ({ row }) => (
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-7 shrink-0 overflow-hidden">
                            <Hashvatar
                                hash={row.original.email}
                                mode="dither"
                                size={28}
                            />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-medium">{row.original.full_name}</p>
                            {row.original.id === currentAdmin?.id && (
                                <p className="text-[11px] text-muted-foreground">Current account</p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "email",
                header: ({ header }) => <DataTableColumnHeader header={header} title="Email" />,
                cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue()}</span>,
            },
            {
                accessorKey: "role",
                header: ({ header }) => <DataTableColumnHeader header={header} title="Role" />,
                cell: ({ cell }) => (
                    <Badge variant={cell.getValue() === "super_admin" ? "default" : "secondary"}>
                        {cell.getValue() === "super_admin" ? "Super admin" : "Admin"}
                    </Badge>
                ),
            },
            {
                accessorKey: "is_active",
                header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
                cell: ({ cell }) => (
                    <Badge variant="outline" className="gap-1.5">
                        <span
                            className={`size-1.5 ${cell.getValue() ? "bg-primary" : "bg-muted-foreground/50"}`}
                            aria-hidden="true"
                        />
                        {cell.getValue() ? "Active" : "Inactive"}
                    </Badge>
                ),
            },
            {
                accessorKey: "created_at",
                header: ({ header }) => <DataTableColumnHeader header={header} title="Added" />,
                cell: ({ cell }) => (
                    <time className="font-heading text-xs text-muted-foreground tabular-nums">
                        {dateFormatter.format(new Date(cell.getValue()))}
                    </time>
                ),
            },
    ]

    if (canManageAccounts) {
        columns.push({
                id: "actions",
                enableSorting: false,
                enableGlobalFilter: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => (
                    <div className="flex justify-end gap-1">
                        <EditAdminDialog
                            administrator={row.original}
                            currentAdminId={currentAdmin.id}
                            onUpdated={() => mutate()}
                        />
                        <DeleteAdminDialog
                            administrator={row.original}
                            currentAdminId={currentAdmin.id}
                            onDeleted={() => mutate()}
                        />
                    </div>
                ),
        })
    }

    const tableError = error
        ? new Error(apiErrorMessage(error, "Administrator accounts could not be loaded."))
        : null

    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader title="Administrators" description="Review dashboard access and account permissions."
                actions={!canManageAccounts && currentAdmin && <Badge variant="outline">View only</Badge>} />

            <DataTable
                columns={columns}
                data={administrators}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isRefreshing={isValidating && !isLoading}
                error={tableError}
                onRetry={() => mutate()}
                searchPlaceholder="Search administrators..."
                empty={{
                    title: "No administrators found",
                    description: "Create the first administrator account to start managing access.",
                }}
                toolbarActions={
                    canManageAccounts
                        ? <CreateAdminDialog onCreated={() => mutate()} />
                        : null
                }
            />
        </section>
    )
}
