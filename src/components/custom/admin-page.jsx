import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STATUS_CLASSES = {
    submitted: "border-amber-300 bg-amber-50 text-amber-800",
    received: "border-sky-300 bg-sky-50 text-sky-800",
    open: "border-sky-300 bg-sky-50 text-sky-800",
    matched: "border-violet-300 bg-violet-50 text-violet-800",
    resolved: "border-emerald-300 bg-emerald-50 text-emerald-800",
    closed: "border-slate-300 bg-slate-50 text-slate-700",
    cancelled: "border-rose-300 bg-rose-50 text-rose-800",
    draft: "border-slate-300 bg-slate-50 text-slate-700",
    published: "border-teal-300 bg-teal-50 text-teal-800",
    reserved: "border-amber-300 bg-amber-50 text-amber-800",
    returned: "border-emerald-300 bg-emerald-50 text-emerald-800",
    archived: "border-slate-300 bg-slate-50 text-slate-700",
    pending: "border-amber-300 bg-amber-50 text-amber-800",
    approved: "border-teal-300 bg-teal-50 text-teal-800",
    rejected: "border-rose-300 bg-rose-50 text-rose-800",
    completed: "border-emerald-300 bg-emerald-50 text-emerald-800",
    withdrawn: "border-slate-300 bg-slate-50 text-slate-700",
}

export function AdminPageHeader({ title, description, actions }) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {actions}
        </header>
    )
}

export function StatusBadge({ status }) {
    return (
        <Badge
            variant="outline"
            className={STATUS_CLASSES[status] || STATUS_CLASSES.closed}
        >
            {status?.replaceAll("_", " ") || "Unknown"}
        </Badge>
    )
}

export function RecordField({ label, children, className = "" }) {
    return (
        <div className={className}>
            <dt className="font-heading text-[10px] text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm leading-6">{children ?? "—"}</dd>
        </div>
    )
}

export function PageError({ error, onRetry }) {
    return (
        <div className="border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="font-medium text-destructive">This page could not be loaded</h2>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button>}
        </div>
    )
}
