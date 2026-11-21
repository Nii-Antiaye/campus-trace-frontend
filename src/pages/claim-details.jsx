import { useState } from "react"
import { ArrowLeft, CheckCircle2, PackageCheck, XCircle } from "lucide-react"
import { Link, useParams } from "react-router"
import useSWR from "swr"

import { api, apiErrorMessage } from "@/api/api"
import { AdminPageHeader, PageError, RecordField, StatusBadge } from "@/components/custom/admin-page"
import { Button } from "@/components/ui/button"
import { ConfirmWorkflowAction } from "@/components/custom/confirm-workflow-action"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format-date"

export function ClaimDetails() {
    const { claimId } = useParams()
    const { data: claim, error, isLoading, mutate } = useSWR(`/admin/claims/${claimId}`)
    const [isWorking, setIsWorking] = useState(false)
    const [actionError, setActionError] = useState("")

    const [confirmation, setConfirmation] = useState(null)

    function requestDecision(event) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const decision = event.nativeEvent.submitter?.value
        if (!["approve", "reject"].includes(decision)) return
        if (decision === "reject" && !form.get("rejection_reason")?.trim()) {
            setActionError("Enter a reason before rejecting this claim.")
            event.currentTarget.elements.rejection_reason.focus()
            return
        }
        const approve = decision === "approve"
        setConfirmation({
            label: approve ? "Approve claim" : "Reject claim",
            description: approve
                ? `Reserve ${claim.item_title} for ${claim.full_name} and reject other pending claims for this item. Record handover separately at pickup.`
                : `Reject ${claim.full_name}’s claim for ${claim.item_title} with this reason: ${form.get("rejection_reason")}`,
            variant: approve ? "default" : "destructive",
            run: () => decide(form, decision),
        })
    }

    async function decide(form, decision) {
        setIsWorking(true)
        setActionError("")
        try {
            await api.post(`/admin/claims/${claimId}/decision`, {
                decision,
                rejection_reason: form.get("rejection_reason") || null,
                admin_notes: form.get("admin_notes") || null,
            })
            await mutate()
        } catch (requestError) {
            setActionError(apiErrorMessage(requestError))
        } finally {
            setIsWorking(false)
        }
    }

    async function completeReturn() {
        setIsWorking(true)
        setActionError("")
        try {
            await api.post(`/admin/claims/${claimId}/complete`)
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
            <Link to="/admin/claims" className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Ownership claims</Link>
            <AdminPageHeader title={`Claim for ${claim.item_title}`} description={`Submitted by ${claim.full_name} on ${formatDate(claim.created_at)}`} actions={<StatusBadge status={claim.status} />} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="flex flex-col gap-6">
                    <div className="border">
                        <div className="border-b bg-violet-50 px-5 py-3 text-xs font-medium text-violet-900">Claimant details</div>
                        <dl className="grid gap-5 p-5 sm:grid-cols-2">
                            <RecordField label="Name">{claim.full_name}</RecordField>
                            <RecordField label="Phone">{claim.phone_number}</RecordField>
                            <RecordField label="Email">{claim.email}</RecordField>
                            <RecordField label="Item status"><StatusBadge status={claim.item_status} /></RecordField>
                            <RecordField label="Supporting description" className="sm:col-span-2">{claim.claim_description}</RecordField>
                        </dl>
                    </div>
                    <div>
                        <h2 className="mb-3 font-heading text-sm font-medium">Private ownership answers</h2>
                        <div className="border">
                            {claim.answers?.length ? claim.answers.map((answer, index) => (
                                <div key={answer.id} className={`p-5 ${index ? "border-t" : ""}`}>
                                    <p className="text-xs font-medium">{answer.question}</p>
                                    <p className="mt-2 border-l-2 border-violet-300 pl-3 text-sm leading-6">{answer.answer}</p>
                                </div>
                            )) : <p className="p-5 text-sm text-muted-foreground">No verification answers were submitted.</p>}
                        </div>
                    </div>
                </div>
                <aside className="border p-5">
                    {claim.status === "pending" ? (
                        <form onSubmit={requestDecision}>
                            <h2 className="font-heading text-sm font-medium">Verification decision</h2>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">Compare answers with private item details before making a decision.</p>
                            <FieldGroup className="mt-5">
                                <Field>
                                    <FieldLabel htmlFor="rejection-reason">Rejection reason</FieldLabel>
                                    <Textarea id="rejection-reason" name="rejection_reason" placeholder="Required when rejecting" disabled={isWorking} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="claim-notes">Internal notes</FieldLabel>
                                    <Textarea id="claim-notes" name="admin_notes" disabled={isWorking} />
                                </Field>
                                <FieldError>{actionError}</FieldError>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button type="submit" name="decision" value="reject" variant="destructive" disabled={isWorking}><XCircle />Reject</Button>
                                    <Button type="submit" name="decision" value="approve" disabled={isWorking}><CheckCircle2 />Approve</Button>
                                </div>
                            </FieldGroup>
                        </form>
                    ) : (
                        <div>
                            <h2 className="font-heading text-sm font-medium">Review outcome</h2>
                            <dl className="mt-5 grid gap-4">
                                <RecordField label="Decision"><StatusBadge status={claim.status} /></RecordField>
                                <RecordField label="Reviewed by">{claim.reviewed_by_name}</RecordField>
                                <RecordField label="Reviewed">{formatDate(claim.reviewed_at)}</RecordField>
                                {claim.rejection_reason && <RecordField label="Reason">{claim.rejection_reason}</RecordField>}
                                <RecordField label="Internal notes">{claim.admin_notes}</RecordField>
                            </dl>
                            {actionError && <p className="mt-4 text-xs text-destructive">{actionError}</p>}
                            {claim.status === "approved" && (
                                <Button className="mt-5 w-full" onClick={() => setConfirmation({
                                    label: "Record handover",
                                    description: `Confirm that ${claim.full_name} has physically collected ${claim.item_title}. This completes the return.`,
                                    run: completeReturn,
                                })} disabled={isWorking}>
                                    {isWorking ? <Spinner /> : <PackageCheck />}
                                    Confirm physical handover
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
