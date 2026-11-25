import { useState } from "react"
import { ArrowLeft, Globe2, RotateCcw, XCircle } from "lucide-react"
import { Link, useParams } from "react-router"
import useSWR from "swr"

import { api, apiErrorMessage } from "@/api/api"
import { AdminPageHeader, PageError, RecordField, StatusBadge } from "@/components/custom/admin-page"
import { Button } from "@/components/ui/button"
import { ConfirmWorkflowAction } from "@/components/custom/confirm-workflow-action"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/lib/format-date"

export function LostReportDetails() {
    const { reportId } = useParams()
    const { data: report, error, isLoading, mutate } = useSWR(`/admin/reports/lost/${reportId}`)
    const [isWorking, setIsWorking] = useState(false)
    const [actionError, setActionError] = useState("")
    const [confirmation, setConfirmation] = useState(null)

    function requestStatus(nextStatus) {
        const closing = nextStatus === "closed"
        setConfirmation({
            label: closing ? "Close search" : "Reopen search",
            description: closing
                ? `Remove ${report.item_name} from open searches? Its report will stay on file.`
                : `Return ${report.item_name} to the list of open searches?`,
            run: () => updateStatus(nextStatus),
        })
    }

    function requestPublish() {
        setConfirmation({
            label: "Publish lost search",
            description: `Make ${report.item_name} visible in the public lost-items catalogue? Contact details and private evidence will remain hidden.`,
            run: publishReport,
        })
    }

    async function publishReport() {
        setIsWorking(true)
        setActionError("")
        try {
            await api.post(`/admin/reports/lost/${reportId}/publish`)
            await mutate()
        } catch (requestError) {
            setActionError(apiErrorMessage(requestError))
        } finally {
            setIsWorking(false)
        }
    }

    async function updateStatus(nextStatus) {
        setIsWorking(true)
        setActionError("")
        try {
            await api.put(`/admin/reports/lost/${reportId}/status`, { status: nextStatus })
            await mutate()
        } catch (requestError) {
            setActionError(apiErrorMessage(requestError))
        } finally {
            setIsWorking(false)
        }
    }

    if (isLoading) return <div className="grid min-h-72 place-items-center"><Spinner /></div>
    if (error) return <PageError error={apiErrorMessage(error)} onRetry={() => mutate()} />

    return (
        <section className="flex flex-col gap-6">
            <Link to="/admin/reports/lost" className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Lost reports</Link>
            <AdminPageHeader title={report.item_name} description={`Reported missing by ${report.full_name}`} actions={<div className="flex items-center gap-2"><StatusBadge status={report.status} /><span className={`border px-2 py-1 text-[11px] font-medium ${report.published_at ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{report.published_at ? "Published" : "Private"}</span></div>} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="border">
                    <div className="border-b bg-sky-50 px-5 py-3 text-xs font-medium text-sky-900">Owner report</div>
                    <dl className="grid gap-5 p-5 sm:grid-cols-2">
                        <RecordField label="Description" className="sm:col-span-2">{report.description}</RecordField>
                        <RecordField label="Distinguishing features" className="sm:col-span-2">{report.distinguishing_features}</RecordField>
                        <RecordField label="Category">{report.category}</RecordField>
                        <RecordField label="Last seen">{report.last_seen_location}</RecordField>
                        <RecordField label="Date lost">{formatDate(report.lost_at)}</RecordField>
                        <RecordField label="Reported">{formatDate(report.created_at)}</RecordField>
                        <RecordField label="Published">{formatDate(report.published_at)}</RecordField>
                        <RecordField label="Owner">{report.full_name}</RecordField>
                        <RecordField label="Phone">{report.phone_number}</RecordField>
                        <RecordField label="Email">{report.email}</RecordField>
                        <RecordField label="Linked claims">{report.claim_count}</RecordField>
                    </dl>
                </div>
                <aside className="border p-5">
                    <h2 className="font-heading text-sm font-medium">Report control</h2>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">Matched and resolved states are set by claim approval and collection.</p>
                    {actionError && <p className="mt-4 text-xs text-destructive">{actionError}</p>}
                    <div className="mt-5 grid gap-2">
                        {report.status === "open" && !report.published_at && <Button onClick={requestPublish} disabled={isWorking}>{isWorking ? <Spinner /> : <Globe2 />}Publish to lost items</Button>}
                        {report.status === "open" && <Button variant="outline" onClick={() => requestStatus("closed")} disabled={isWorking}>{isWorking ? <Spinner /> : <XCircle />}Close search</Button>}
                        {report.status === "closed" && <Button variant="outline" onClick={() => requestStatus("open")} disabled={isWorking}>{isWorking ? <Spinner /> : <RotateCcw />}Reopen search</Button>}
                        {["matched", "resolved"].includes(report.status) && <p className="border-l-2 border-violet-400 bg-violet-50 p-3 text-xs text-violet-900">This report is now controlled by its linked ownership claim.</p>}
                    </div>
                </aside>
            </div>
            <ConfirmWorkflowAction action={confirmation} busy={isWorking} onCancel={() => setConfirmation(null)} />
        </section>
    )
}
