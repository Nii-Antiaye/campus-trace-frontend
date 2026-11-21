import { z } from "zod"

export const loginFormSchema = z.object({
    username: z.email("Enter a valid email address"),
    password: z.string().min(1, "Enter your password"),
    remember_me: z.boolean(),
})

export const createAdminFormSchema = z.object({
    full_name: z.string().trim().min(2, "Enter the administrator's full name").max(150),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirm_password: z.string(),
    role: z.enum(["admin", "super_admin"]),
}).refine((values) => values.password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
})

export const editAdminFormSchema = z.object({
    full_name: z.string().trim().min(2, "Enter the administrator's full name").max(150),
    email: z.email("Enter a valid email address"),
    role: z.enum(["admin", "super_admin"]),
    is_active: z.boolean(),
    password: z.string().refine(
        (value) => value.length === 0 || value.length >= 8,
        "New password must contain at least 8 characters",
    ),
})
