import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PencilIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { editAdminFormSchema } from "@/lib/form-schema"

function valuesFor(administrator) {
    return {
        full_name: administrator.full_name,
        email: administrator.email,
        role: administrator.role,
        is_active: administrator.is_active,
        password: "",
    }
}

export function EditAdminDialog({ administrator, currentAdminId, onUpdated }) {
    const [open, setOpen] = useState(false)
    const isCurrentAccount = administrator.id === currentAdminId
    const {
        control,
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(editAdminFormSchema),
        defaultValues: valuesFor(administrator),
    })

    function handleOpenChange(nextOpen) {
        if (isSubmitting) return
        setOpen(nextOpen)
        if (nextOpen) reset(valuesFor(administrator))
    }

    async function handleUpdate(values) {
        try {
            const response = await api.put(`/admin/accounts/${administrator.id}`, {
                ...values,
                password: values.password || null,
            })
            await onUpdated?.(response.data)
            setOpen(false)
        } catch (error) {
            setError("root.server", {
                message: apiErrorMessage(error, "The administrator account could not be updated."),
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${administrator.full_name}`}>
                    <PencilIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit administrator</DialogTitle>
                    <DialogDescription>
                        Update account details, permissions, or access status.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleUpdate)} noValidate>
                    <FieldGroup>
                        <Field data-invalid={errors.full_name ? true : undefined}>
                            <FieldLabel htmlFor={`edit-name-${administrator.id}`}>Full name</FieldLabel>
                            <Input
                                id={`edit-name-${administrator.id}`}
                                disabled={isSubmitting}
                                aria-invalid={errors.full_name ? true : undefined}
                                {...register("full_name")}
                            />
                            <FieldError>{errors.full_name?.message}</FieldError>
                        </Field>
                        <Field data-invalid={errors.email ? true : undefined}>
                            <FieldLabel htmlFor={`edit-email-${administrator.id}`}>Email address</FieldLabel>
                            <Input
                                id={`edit-email-${administrator.id}`}
                                type="email"
                                disabled={isSubmitting}
                                aria-invalid={errors.email ? true : undefined}
                                {...register("email")}
                            />
                            <FieldError>{errors.email?.message}</FieldError>
                        </Field>
                        <Field data-invalid={errors.role ? true : undefined}>
                            <FieldLabel htmlFor={`edit-role-${administrator.id}`}>Role</FieldLabel>
                            <NativeSelect
                                id={`edit-role-${administrator.id}`}
                                className="w-full"
                                disabled={isSubmitting}
                                aria-invalid={errors.role ? true : undefined}
                                {...register("role")}
                            >
                                <option
                                    value="admin"
                                    disabled={isCurrentAccount && administrator.role !== "admin"}
                                >
                                    Administrator
                                </option>
                                <option
                                    value="super_admin"
                                    disabled={isCurrentAccount && administrator.role !== "super_admin"}
                                >
                                    Super administrator
                                </option>
                            </NativeSelect>
                            {isCurrentAccount && <FieldDescription>You cannot change your own role.</FieldDescription>}
                            <FieldError>{errors.role?.message}</FieldError>
                        </Field>
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Field orientation="horizontal">
                                    <FieldLabel className="items-center">
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting || isCurrentAccount}
                                        />
                                        <span>
                                            Account active
                                            <FieldDescription>Active accounts can sign in to the dashboard.</FieldDescription>
                                        </span>
                                    </FieldLabel>
                                </Field>
                            )}
                        />
                        <Field data-invalid={errors.password ? true : undefined}>
                            <FieldLabel htmlFor={`edit-password-${administrator.id}`}>New password</FieldLabel>
                            <Input
                                id={`edit-password-${administrator.id}`}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Leave blank to keep the current password"
                                disabled={isSubmitting}
                                aria-invalid={errors.password ? true : undefined}
                                {...register("password")}
                            />
                            <FieldError>{errors.password?.message}</FieldError>
                        </Field>
                        <FieldError>{errors.root?.server?.message}</FieldError>
                    </FieldGroup>
                    <DialogFooter className="mt-5">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isSubmitting ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
