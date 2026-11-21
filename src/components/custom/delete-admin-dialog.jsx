import { useState } from "react"
import { Trash2Icon } from "lucide-react"

import { api, apiErrorMessage } from "@/api/api"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export function DeleteAdminDialog({ administrator, currentAdminId, onDeleted }) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState("")
    const isCurrentAccount = administrator.id === currentAdminId

    function handleOpenChange(nextOpen) {
        if (isDeleting) return
        setOpen(nextOpen)
        if (!nextOpen) setError("")
    }

    async function handleDelete(event) {
        event.preventDefault()
        setIsDeleting(true)
        setError("")
        try {
            await api.delete(`/admin/accounts/${administrator.id}`)
            await onDeleted?.(administrator.id)
            setOpen(false)
        } catch (requestError) {
            setError(apiErrorMessage(requestError, "The administrator account could not be deactivated."))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Deactivate ${administrator.full_name}`}
                    disabled={isCurrentAccount || !administrator.is_active}
                    title={isCurrentAccount ? "You cannot deactivate your own account" : "Deactivate account"}
                >
                    <Trash2Icon />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia className="text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Deactivate this administrator?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {administrator.full_name} will immediately lose dashboard access.
                        Their reports, decisions, and activity history will remain recorded.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <FieldError>{error}</FieldError>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Keep active</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting && <Spinner />}
                        {isDeleting ? "Deactivating…" : "Deactivate account"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
