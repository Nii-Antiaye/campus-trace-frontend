import { useState } from "react"
import { Loader, LogOutIcon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LogoutDialog({ open, onOpenChange, onConfirm }) {
    const [isSigningOut, setIsSigningOut] = useState(false)

    function handleOpenChange(nextOpen) {
        if (!isSigningOut) {
            onOpenChange?.(nextOpen)
        }
    }

    async function handleSignOut(event) {
        event.preventDefault()
        setIsSigningOut(true)
        try {
            await onConfirm?.()
            onOpenChange?.(false)
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sign out of Campus Trace?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This ends the administrator session on this device. You will need
                        your email and password to open the dashboard again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSigningOut}>Stay signed in</AlertDialogCancel>
                    <AlertDialogAction
                        variant="secondary"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                    >
                        {isSigningOut
                            ? <Loader className="animate-spin" aria-hidden="true" />
                            : <LogOutIcon aria-hidden="true" />}
                        {isSigningOut ? "Signing out…" : "Sign out"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
