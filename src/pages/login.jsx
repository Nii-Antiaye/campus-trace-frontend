import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"

import { loginAdmin, storeToken } from "@/api/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { loginFormSchema } from "@/lib/form-schema"
import logo from "@/assets/images/logo.png"

function safeNextPath(value) {
    return value?.startsWith("/") && !value.startsWith("//") ? value : "/admin"
}

export function Login() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [showPassword, setShowPassword] = useState(false)
    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: "",
            password: "",
            remember_me: false,
        },
    })

    async function handleLogin(credentials) {
        try {
            const token = await loginAdmin(credentials)
            storeToken(token.access_token, credentials.remember_me)
            navigate(safeNextPath(searchParams.get("next")), { replace: true })
        } catch (error) {
            const message = error?.response?.data?.detail
                || "Campus Trace could not reach the server. Check that the API is running and try again."
            setError("root.server", { message })
        }
    }

    return (
        <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
            <section className="hidden flex-col gap-8 bg-[#e1efed] p-10 text-[#102f50] lg:flex">
                <Link
                    to="/"
                    className="flex w-fit items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                    <span className="flex size-12 overflow-hidden bg-white">
                        <img src={logo} alt="" className="size-full scale-125 object-cover" />
                    </span>
                    <span className="text-xl font-semibold tracking-tight">Campus Trace</span>
                </Link>

                <div className="grid flex-1 place-items-center">
                    <svg viewBox="0 0 430 260" fill="none" aria-hidden="true" className="w-full max-w-lg">
                        <g transform="rotate(-12 235 140)">
                            <path d="M115 110l32-33h235v126H147l-32-33z" fill="#fffefa" />
                            <circle cx="136" cy="141" r="7" fill="#102f50" />
                            <text x="165" y="125" fill="#102f50" fontSize="22" fontWeight="600">Found property</text>
                            <path d="M165 140h186m-186 30h186" stroke="#b8cec9" />
                            <text x="165" y="161" fill="#425f66" fontSize="14">Library returns desk</text>
                        </g>
                        <g transform="rotate(28 92 129)">
                            <path fillRule="evenodd" fill="#008e86" d="M92 96a32 32 0 0 1 12 62v60l-12 12-13-12v-13h9v-10h-9v-37a32 32 0 0 1 13-62zm0 12a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
                        </g>
                        <path d="M99 116c-35-22-9-58 15-39 20 15 4 53 20 82" stroke="#102f50" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>
                <div>
                    <h1 className="max-w-[12ch] text-5xl leading-[0.99] font-semibold tracking-[-0.045em] xl:text-6xl">Campus lost &amp; found</h1>
                    <p className="mt-5 max-w-sm text-base leading-6 text-[#425f66]">
                        Log what arrives at the desk, check who it belongs to, and record the handover.
                    </p>
                </div>
            </section>

            <section className="flex min-h-svh flex-col p-5 sm:p-8">
                <Link to="/" className="flex w-fit items-center gap-2 font-medium lg:hidden">
                    <span className="flex size-9 overflow-hidden border bg-white">
                        <img src={logo} alt="" className="size-full scale-125 object-cover" />
                    </span>
                    Campus Trace
                </Link>

                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 flex size-10 items-center justify-center border bg-muted text-primary">
                            <img src={logo} alt="" className="size-full scale-125 object-cover" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight">Sign in to administration</h2>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                            Use the administrator account issued for your campus.
                        </p>

                        <form noValidate className="mt-8" onSubmit={handleSubmit(handleLogin)}>
                            <FieldGroup>
                                {errors.root?.server && (
                                    <Alert variant="destructive">
                                        <AlertCircle aria-hidden="true" />
                                        <AlertTitle>Sign-in failed</AlertTitle>
                                        <AlertDescription>{errors.root.server.message}</AlertDescription>
                                    </Alert>
                                )}

                                <Field data-invalid={errors.username ? true : undefined}>
                                    <FieldLabel htmlFor="username">Email address</FieldLabel>
                                    <Input
                                        id="username"
                                        type="email"
                                        placeholder="admin@campus.edu"
                                        autoComplete="username"
                                        autoFocus
                                        disabled={isSubmitting}
                                        aria-invalid={errors.username ? true : undefined}
                                        {...register("username")}
                                    />
                                    <FieldError>{errors.username?.message}</FieldError>
                                </Field>

                                <Field data-invalid={errors.password ? true : undefined}>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            className="pr-9"
                                            disabled={isSubmitting}
                                            aria-invalid={errors.password ? true : undefined}
                                            {...register("password")}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            className="absolute top-1/2 right-1 -translate-y-1/2"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            disabled={isSubmitting}
                                        >
                                            {showPassword ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                    <FieldError>{errors.password?.message}</FieldError>
                                </Field>

                                <Controller
                                    name="remember_me"
                                    control={control}
                                    render={({ field }) => (
                                        <Field orientation="horizontal">
                                            <FieldLabel className="items-center font-normal">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                />
                                                Keep me signed in on this device
                                            </FieldLabel>
                                        </Field>
                                    )}
                                />

                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Spinner />
                                            Checking credentials
                                        </>
                                    ) : (
                                        <>
                                            Sign in
                                            <ArrowRight data-icon="inline-end" />
                                        </>
                                    )}
                                </Button>
                            </FieldGroup>
                        </form>

                        <FieldDescription className="mt-6 border-t pt-5">
                            Accounts are created from the secure Campus Trace administrator CLI.
                        </FieldDescription>
                    </div>
                </div>
                <p className="text-center font-heading text-[11px] text-muted-foreground">
                    Campus Trace · Controlled lost-and-found management
                </p>
            </section>
        </main>
    )
}
