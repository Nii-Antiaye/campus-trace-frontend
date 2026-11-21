import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"

import { api, apiErrorMessage } from "@/api/api"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { createAdminFormSchema } from "@/lib/form-schema"

const DEFAULT_VALUES = {
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "admin",
}

export function CreateAdminDialog({ onCreated }) {
    const [open, setOpen] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createAdminFormSchema),
        defaultValues: DEFAULT_VALUES,
    })

    function handleOpenChange(nextOpen) {
        if (isSubmitting) return
        setOpen(nextOpen)
        if (!nextOpen) reset(DEFAULT_VALUES)
    }

    async function handleCreate(values) {
        try {
            const payload = { ...values }
            delete payload.confirm_password
            const response = await api.post("/admin/accounts", payload)
            await onCreated?.(response.data)
            setOpen(false)
            reset(DEFAULT_VALUES)
        } catch (error) {
            setError("root.server", {
                message: apiErrorMessage(error, "The administrator account could not be created."),
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon data-icon="inline-start" />
                    Add administrator
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add administrator</DialogTitle>
                    <DialogDescription>
                        Create dashboard credentials and choose the account&apos;s level of access.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreate)} noValidate>
                    <FieldGroup>
                        <Field data-invalid={errors.full_name ? true : undefined}>
                            <FieldLabel htmlFor="create-admin-name">Full name</FieldLabel>
                            <Input
                                id="create-admin-name"
                                autoComplete="name"
                                disabled={isSubmitting}
                                aria-invalid={errors.full_name ? true : undefined}
                                {...register("full_name")}
                            />
                            <FieldError>{errors.full_name?.message}</FieldError>
                        </Field>
                        <Field data-invalid={errors.email ? true : undefined}>
                            <FieldLabel htmlFor="create-admin-email">Email address</FieldLabel>
                            <Input
                                id="create-admin-email"
                                type="email"
                                autoComplete="email"
                                placeholder="admin@campus.edu"
                                disabled={isSubmitting}
                                aria-invalid={errors.email ? true : undefined}
                                {...register("email")}
                            />
                            <FieldError>{errors.email?.message}</FieldError>
                        </Field>
                        <Field data-invalid={errors.role ? true : undefined}>
                            <FieldLabel htmlFor="create-admin-role">Role</FieldLabel>
                            <NativeSelect
                                id="create-admin-role"
                                className="w-full"
                                disabled={isSubmitting}
                                aria-invalid={errors.role ? true : undefined}
                                {...register("role")}
                            >
                                <option value="admin">Administrator</option>
                                <option value="super_admin">Super administrator</option>
                            </NativeSelect>
                            <FieldError>{errors.role?.message}</FieldError>
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field data-invalid={errors.password ? true : undefined}>
                                <FieldLabel htmlFor="create-admin-password">Password</FieldLabel>
                                <Input
                                    id="create-admin-password"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    aria-invalid={errors.password ? true : undefined}
                                    {...register("password")}
                                />
                                <FieldError>{errors.password?.message}</FieldError>
                            </Field>
                            <Field data-invalid={errors.confirm_password ? true : undefined}>
                                <FieldLabel htmlFor="create-admin-confirm">Confirm password</FieldLabel>
                                <Input
                                    id="create-admin-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    aria-invalid={errors.confirm_password ? true : undefined}
                                    {...register("confirm_password")}
                                />
                                <FieldError>{errors.confirm_password?.message}</FieldError>
                            </Field>
                        </div>
                        <FieldError>{errors.root?.server?.message}</FieldError>
                    </FieldGroup>
                    <DialogFooter className="mt-5">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isSubmitting ? "Creating…" : "Create account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
