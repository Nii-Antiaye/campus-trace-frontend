import { Bell, CheckCheck, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import useSWR from "swr"

import { api, apiErrorMessage } from "@/api/api"
import { AdminPageHeader, PageError } from "@/components/custom/admin-page"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/lib/format-date"

const notificationStyles = {
    info: {
        icon: Info,
        shell: "border-sky-200 bg-sky-50/70",
        iconClass: "bg-sky-100 text-sky-700",
    },
    success: {
        icon: CircleCheck,
        shell: "border-emerald-200 bg-emerald-50/70",
        iconClass: "bg-emerald-100 text-emerald-700",
    },
    warning: {
        icon: TriangleAlert,
        shell: "border-amber-200 bg-amber-50/70",
        iconClass: "bg-amber-100 text-amber-700",
    },
    error: {
        icon: CircleAlert,
        shell: "border-rose-200 bg-rose-50/70",
        iconClass: "bg-rose-100 text-rose-700",
    },
}

export function Notifications() {
    const { data, error, isLoading, mutate } = useSWR("/admin/notifications")
    const unreadCount = data?.filter((notification) => !notification.is_read).length || 0

    async function markRead(notification) {
        if (notification.is_read) return
        await mutate(
            async (current) => {
                await api.post(`/admin/notifications/${notification.id}/read`)
                return current.map((value) => (
                    value.id === notification.id ? { ...value, is_read: true } : value
                ))
            },
            { revalidate: false },
        )
    }

    async function markAllRead() {
        await mutate(
            async (current) => {
                await api.post("/admin/notifications/read-all")
                return current.map((notification) => ({ ...notification, is_read: true }))
            },
            { revalidate: false },
        )
    }

    if (isLoading) return <div className="grid min-h-72 place-items-center"><Spinner /></div>
    if (error) return <PageError error={apiErrorMessage(error)} onRetry={() => mutate()} />

    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader
                title="Notifications"
                description="Shared operational events, with read status tracked separately for your account."
                actions={unreadCount > 0
                    ? (
                        <Button variant="outline" onClick={markAllRead}>
                            <CheckCheck />
                            Mark all read
                        </Button>
                    )
                    : null}
            />

            <div className="flex items-center gap-3 border-b pb-3">
                <span className="grid size-8 place-items-center bg-primary text-primary-foreground">
                    <Bell className="size-4" />
                </span>
                <p className="text-sm">
                    <span className="font-heading font-medium">{unreadCount}</span>
                    {" "}unread {unreadCount === 1 ? "event" : "events"}
                </p>
            </div>

            {data.length ? (
                <div className="grid gap-2">
                    {data.map((notification) => {
                        const style = notificationStyles[notification.type] || notificationStyles.info
                        const Icon = style.icon
                        return (
                            <button
                                type="button"
                                key={notification.id}
                                onClick={() => markRead(notification)}
                                className={`grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 border p-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${notification.is_read ? "bg-background opacity-70" : style.shell}`}
                            >
                                <span className={`grid size-8 place-items-center ${style.iconClass}`}>
                                    <Icon className="size-4" />
                                </span>
                                <span>
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        {notification.title}
                                        {!notification.is_read && <span className="size-1.5 bg-primary" aria-label="Unread" />}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                        {notification.message}
                                    </span>
                                </span>
                                <time className="hidden font-heading text-[10px] text-muted-foreground sm:block">
                                    {formatDate(notification.created_at)}
                                </time>
                            </button>
                        )
                    })}
                </div>
            ) : (
                <div className="border py-16 text-center">
                    <Bell className="mx-auto size-5 text-muted-foreground" />
                    <h2 className="mt-3 text-sm font-medium">No notifications yet</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Significant report and claim events will appear here.</p>
                </div>
            )}
        </section>
    )
}
