import { useState } from "react"
import { ArrowUpRight, BookOpen, CheckCheck, ClipboardList, Handshake, MapPin, Radio, ShieldCheck, Tags } from "lucide-react"
import { Link } from "react-router"
import useSWR from "swr"

import { apiErrorMessage } from "@/api/api"
import { PageError } from "@/components/custom/admin-page"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/lib/format-date"

const stations = {
    receipt: { name: "Intake", action: "Receive item", icon: ClipboardList, tint: "bg-amber-100 text-amber-900", path: "reports/found" },
    publish: { name: "Catalogue", action: "Review listing", icon: Tags, tint: "bg-sky-100 text-sky-900", path: "reports/found" },
    review: { name: "Claims", action: "Review evidence", icon: ShieldCheck, tint: "bg-violet-100 text-violet-900", path: "claims" },
    handover: { name: "Pickup", action: "Open handover", icon: Handshake, tint: "bg-teal-100 text-teal-900", path: "claims" },
}

export function Dashboard() {
    const [filter, setFilter] = useState("all")
    const { data, error, isLoading, mutate } = useSWR("/admin/dashboard", { refreshInterval: 30000 })
    if (isLoading) return <div className="grid min-h-72 place-items-center"><Spinner /></div>
    if (error) return <PageError error={apiErrorMessage(error)} onRetry={() => mutate()} />
    const queue = data.work_queue
    const rows = queue.filter(row => filter === "all" || row.stage === filter)
    const next = queue[0]
    return (
        <section className="grid gap-7">
            <header className="desk-board">
                <div className="relative z-10 max-w-xl">
                    <p className="flex items-center gap-2 text-sm text-cyan-100"><Radio size={16} /> Campus Trace operations</p>
                    <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Recovery desk</h1>
                    <p className="my-3 text-base text-blue-100">{queue.length ? `${queue.length} ${queue.length === 1 ? "case needs" : "cases need"} attention at the desk.` : "The desk is clear. New cases will appear here."}</p>
                    {next && <Link className="mt-3 inline-flex items-center gap-3 rounded-full bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-100" to={`/admin/${stations[next.stage].path}/${next.id}`}>Open oldest case <ArrowUpRight size={16} /></Link>}
                </div>
                <div className="desk-tag" aria-hidden="true"><Tags size={42} strokeWidth={1.3} /><span>Campus Trace</span><strong>Property tag</strong><i /></div>
            </header>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,1fr)]">
                <section className="desk-panel">
                    <h2 className="text-xl font-semibold">Work queue</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Oldest first. Choose a station to narrow the list.</p>
                    <div aria-label="Filter work queue" className="my-5 flex flex-wrap gap-1.5">
                        {["all", ...Object.keys(stations)].map(key => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === key ? "bg-[#173552] text-white" : "bg-muted hover:bg-secondary"}`}>{stations[key]?.name || "All"}</button>)}
                    </div>
                    <ul className="divide-y">{rows.map(row => {
                        const station = stations[row.stage]
                        return <li key={`${row.stage}-${row.id}`}><Link className="group flex items-center gap-3 py-4" to={`/admin/${station.path}/${row.id}`}>
                            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${station.tint}`}><station.icon size={18} /></span>
                            <span className="min-w-0 flex-1"><strong className="block truncate text-sm group-hover:underline">{row.title}</strong><span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} />{row.location}</span></span>
                            <span className="hidden text-xs sm:inline">{station.action}</span><ArrowUpRight size={15} />
                        </Link></li>
                    })}</ul>
                    {!rows.length && <p className="py-6 text-sm text-muted-foreground">No cases waiting here.</p>}
                </section>
                <aside className="space-y-5">
                    <section className="desk-panel">
                        <h2 className="mb-3 text-xl font-semibold">Desk register</h2>
                        {[
                            ["Open searches", data.counts.lost_open, BookOpen, "/admin/reports/lost"],
                            ["Published items", data.counts.items_published, Tags, "/admin/reports/found"],
                            ["Completed returns", data.counts.items_returned, CheckCheck, "/admin/returned"],
                        ].map(([label, count, Icon, href]) => <Link key={label} to={href} className="flex items-center gap-3 border-t py-3 text-sm hover:underline"><Icon size={17} className="text-teal-700" />{label}<b className="ml-auto font-heading">{count}</b></Link>)}
                    </section>
                    <section className="desk-panel">
                        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Desk activity</h2><Link to="/admin/logs" className="text-xs underline">Full log</Link></div>
                        <ol className="mt-4 ml-1 border-l-2 border-teal-200">{data.recent_activity.map(entry => <li key={entry.id} className="relative pb-4 pl-4 last:pb-0 before:absolute before:top-1.5 before:-left-[5px] before:size-2 before:rounded-full before:bg-teal-600"><p className="text-sm">{entry.description}</p><time className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</time></li>)}</ol>
                        {!data.recent_activity.length && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
                    </section>
                </aside>
            </div>
        </section>
    )
}
