import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ConfirmWorkflowAction({ action, onCancel, busy }) {
    return (
        <AlertDialog open={Boolean(action)} onOpenChange={open => { if (!open && !busy) onCancel() }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{action?.label}?</AlertDialogTitle>
                    <AlertDialogDescription>{action?.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant={action?.variant} disabled={busy} onClick={async event => {
                        event.preventDefault()
                        if (busy || !action) return
                        await action.run()
                        onCancel()
                    }}>{busy ? "Saving…" : action?.label}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
