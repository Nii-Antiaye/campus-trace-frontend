import { Suspense, useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import useSWR, { useSWRConfig } from "swr"

import { clearToken, getStoredToken } from "@/api/api"
import { NavMain } from "@/components/custom/sidebar/nav-main"
import { NavUser } from "@/components/custom/sidebar/nav-user"
import { adminLinks } from "@/components/custom/sidebar/user-links"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { RouteLoader } from "@/components/custom/navigation-indicator"
import logo from "@/assets/images/logo.png"

export function BaseDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const { cache } = useSWRConfig()
    const hasToken = Boolean(getStoredToken())
    const { data: admin, error, isLoading } = useSWR(hasToken ? "/admin/me" : null)

    useEffect(() => {
        if (!hasToken || error?.response?.status === 401) {
            clearToken()
            const next = encodeURIComponent(`${location.pathname}${location.search}`)
            navigate(`/admin/login?next=${next}`, { replace: true })
        }
    }, [error, hasToken, location.pathname, location.search, navigate])

    function handleLogout() {
        clearToken()
        cache.delete("/admin/me")
        navigate("/admin/login", { replace: true })
    }

    if (!hasToken || isLoading || error?.response?.status === 401) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <Spinner className="text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-svh items-center justify-center p-6">
                <div className="max-w-sm border p-5">
                    <h1 className="font-medium">Dashboard unavailable</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The API could not load your administrator profile. Check the server and refresh this page.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/admin">
                                    <span className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                                        <img src={logo} alt="" className="size-full scale-125 object-cover" />
                                    </span>
                                    <span className="grid flex-1 text-left leading-tight">
                                        <span className="truncate text-sm font-semibold">Campus Trace</span>
                                        <span className="truncate text-xs text-muted-foreground">Administration</span>
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={adminLinks} />
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={admin} onLogout={handleLogout} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <SidebarInset>
                <main className="max-w-6xl mx-auto w-full">
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Suspense fallback={<div className="flex flex-1 items-center justify-center py-20"><RouteLoader compact /></div>}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
