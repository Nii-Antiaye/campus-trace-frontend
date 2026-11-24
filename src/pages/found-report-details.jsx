import { useState } from "react"
import { ArrowLeft, PackageCheck, Send } from "lucide-react"
import { Link, useParams } from "react-router"
import useSWR from "swr"

import { api, apiAssetUrl, apiErrorMessage } from "@/api/api"
import { AdminPageHeader, PageError, RecordField, StatusBadge } from "@/components/custom/admin-page"
import { Button } from "@/components/ui/button"
import { ConfirmWorkflowAction } from "@/components/custom/confirm-workflow-action"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format-date"

export function FoundReportDetails() {
    const { reportId } = useParams()
    const { data: report, error, isLoading, mutate } = useSWR(`/admin/reports/found/${reportId}`)
    const [isWorking, setIsWorking] = useState(false)
    const [actionError, setActionError] = useState("")

    const [confirmation, setConfirmation] = useState(null)

    function requestReceipt(event) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const questions = form.get("verification_questions").split("\n").map(line => line.trim()).filter(Boolean)
        if (!questions.length) {
            setActionError("Enter at least one ownership question.")
            event.currentTarget.elements.verification_questions.focus()
            return
        }
        setConfirmation({
            label: "Confirm receipt",
            description: `Confirm that you physically received ${form.get("title")}. This saves the item and its ownership questions as a draft for review before publication.`,
            run: () => receiveItem(form, questions),
        })
    }

    async function receiveItem(form, questions) {
        setIsWorking(true)
        setActionError("")
        try {
            await api.post(`/admin/reports/found/${reportId}/receive`, {
                title: form.get("title"),
                public_description: form.get("public_description"),
                admin_notes: form.get("admin_notes") || null,
                verification_questions: questions,
            })
            await mutate()
        } catch (requestError) {
            setActionError(apiErrorMessage(requestError))
        } finally {
            setIsWorking(false)
        }
    }

    async function publishItem() {
        setIsWorking(true)
        setActionError("")
        try {
            await api.post(`/admin/items/${report.item.id}/publish`)
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
            <Link to="/admin/reports/found" className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Found reports</Link>
            <AdminPageHeader
                title={report.item_name}
                description={`Reported by ${report.full_name} on ${formatDate(report.created_at)}`}
                actions={<StatusBadge status={report.status} />}
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
                <div className="border">
                    <div className="border-b bg-amber-50 px-5 py-3 text-xs font-medium text-amber-900">Finder report</div>
                    <dl className="grid gap-5 p-5 sm:grid-cols-2">
                        <RecordField label="Description" className="sm:col-span-2">{report.description}</RecordField>
                        <RecordField label="Category">{report.category}</RecordField>
                        <RecordField label="Found at">{report.location_found}</RecordField>
                        <RecordField label="Date found">{formatDate(report.found_at)}</RecordField>
                        <RecordField label="Finder">{report.full_name}</RecordField>
                        <RecordField label="Email">{report.email}</RecordField>
                        <RecordField label="Phone">{report.phone_number}</RecordField>
                                        <RecordField label="Additional notes" className="sm:col-span-2">{report.additional_notes || "—"}</RecordField>
                        {report.uploaded_images?.length > 0 && (
                            <RecordField label="Submitted photos" className="sm:col-span-2">
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {report.uploaded_images.map((src) => (
                                        <a key={src} href={apiAssetUrl(src)} target="_blank" rel="noreferrer" className="block w-24 h-24 border overflow-hidden">
                                            <img src={apiAssetUrl(src)} alt="" className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </RecordField>
                        )}
                    </dl>
                </div>

                <aside className="border p-5">
                    {report.status === "submitted" ? (
                        <form onSubmit={requestReceipt}>
                            <div className="mb-5 flex items-center gap-2">
                                <PackageCheck className="size-4 text-primary" />
                                <h2 className="font-heading text-sm font-medium">Confirm physical receipt</h2>
                            </div>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="listing-title">Catalogue title</FieldLabel>
                                    <Input id="listing-title" name="title" defaultValue={report.item_name} required disabled={isWorking} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="public-description">Public description</FieldLabel>
                                    <Textarea id="public-description" name="public_description" defaultValue={report.description} required disabled={isWorking} />
                                    <FieldDescription>Do not expose private identifying details.</FieldDescription>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="questions">Private ownership questions</FieldLabel>
                                    <Textarea id="questions" name="verification_questions" placeholder={"What is engraved on the item?\nWhat was inside it?"} required disabled={isWorking} />
                                    <FieldDescription>Enter one question per line about a detail only the owner would know.</FieldDescription>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="admin-notes">Internal notes</FieldLabel>
                                    <Textarea id="admin-notes" name="admin_notes" disabled={isWorking} />
                                </Field>
                                <FieldError>{actionError}</FieldError>
                                <Button type="submit" disabled={isWorking}>
                                    {isWorking ? <Spinner /> : <PackageCheck />}
                                    Confirm receipt
                                </Button>
                            </FieldGroup>
                        </form>
                    ) : (
                        <div>
                            <h2 className="font-heading text-sm font-medium">Catalogue record</h2>
                            <dl className="mt-5 grid gap-4">
                                <RecordField label="Listing">{report.item?.title}</RecordField>
                                <RecordField label="Item status"><StatusBadge status={report.item?.status} /></RecordField>
                                <RecordField label="Received">{formatDate(report.received_at)}</RecordField>
                                <RecordField label="Received by">{report.received_by_name}</RecordField>
                                {report.item?.image_urls?.length > 0 && (
                                    <RecordField label="Photos">
                                        <div className="mt-1 flex flex-wrap gap-2">{report.item.image_urls.map((u) => <a key={u} href={apiAssetUrl(u)} target="_blank" rel="noreferrer" className="block w-16 h-16 border overflow-hidden"><img src={apiAssetUrl(u)} alt="" className="w-full h-full object-cover" /></a>)}</div>
                                    </RecordField>
                                )}
                                <RecordField label="Ownership questions">
                                    <ul className="list-disc pl-4">{report.item?.verification_questions?.map(q => <li key={q.id}>{q.question}</li>)}</ul>
                                </RecordField>
                            </dl>
                            <FieldError className="mt-4">{actionError}</FieldError>
                            {report.item?.status === "draft" && (
                                <Button className="mt-5 w-full" onClick={() => setConfirmation({
                                    label: "Publish to catalogue",
                                    description: `Make the listing for ${report.item.title} public and available for ownership claims?`,
                                    run: publishItem,
                                })} disabled={isWorking}>
                                    {isWorking ? <Spinner /> : <Send />}
                                    Publish to catalogue
                                </Button>
                            )}
                        </div>
                    )}
                </aside>
            </div>
            <ConfirmWorkflowAction action={confirmation} busy={isWorking} onCancel={() => setConfirmation(null)} />
        </section>
    )
}
