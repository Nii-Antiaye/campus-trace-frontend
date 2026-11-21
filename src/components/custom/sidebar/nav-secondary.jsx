import * as React from "react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router"
import { LifeBuoy, Send } from "lucide-react"


export function NavSecondary({ ...props }) {
    const supportLinks = [
        { title: "Support", url: "mailto:support@mysupermuse.com", icon: LifeBuoy },
        { title: "Feedback", url: "mailto:support@mysupermuse.com", icon: Send },
    ]

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {supportLinks.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild size="sm">
                                <Link to={item.url} className="text-xs">
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
