import {
    Bell,
    ClipboardList,
    FileClock,
    LayoutDashboard,
    PackageCheck,
    QrCode,
    ShieldCheck,
    Users,
} from "lucide-react"

export const adminLinks = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
    {
        title: "Reports",
        url: "/admin/reports/found",
        icon: ClipboardList,
        isActive: true,
        items: [
            { title: "Found reports", url: "/admin/reports/found" },
            { title: "Lost reports", url: "/admin/reports/lost" },
        ],
    },
    { title: "Claims", url: "/admin/claims", icon: ShieldCheck },
    { title: "Returned items", url: "/admin/returned", icon: PackageCheck },
    { title: "QR Codes", url: "/admin/qr-codes", icon: QrCode },
    { title: "Administrators", url: "/admin/administrators", icon: Users },
    { title: "Notifications", url: "/admin/notifications", icon: Bell },
    { title: "Activity logs", url: "/admin/logs", icon: FileClock },
]
