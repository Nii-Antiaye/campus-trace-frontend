import { createBrowserRouter, Outlet } from "react-router"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ActivityLogs } from "@/pages/activity-logs"
import { Administrator } from "@/pages/administrators"
import { BaseDashboard } from "@/pages/base-dashboard"
import { ClaimDetails } from "@/pages/claim-details"
import { Claims } from "@/pages/claims"
import { Dashboard } from "@/pages/dashboard"
import { FoundReportDetails } from "@/pages/found-report-details"
import { FoundReports } from "@/pages/found-reports"
import { Login } from "@/pages/login"
import { LostReportDetails } from "@/pages/lost-report-details"
import { LostReports } from "@/pages/lost-reports"
import { Notifications } from "@/pages/notifications"
import { ReturnedItems } from "@/pages/returned-items"
import { QrCodes } from "@/pages/qr-codes"
import { PublicCampus, CampusHome, ReportForm, Catalogue, ItemDetails, LostCatalogue, LostItemDetails, Guidelines } from "@/pages/public-campus"

export const appRoutes = createBrowserRouter([
    {
        path: "/",
        element: (
            <TooltipProvider>
                <Outlet />
            </TooltipProvider>
        ),
        children: [
            { element: <PublicCampus />, children: [
                { index: true, element: <CampusHome /> },
                { path: "report-lost", element: <ReportForm key="lost" /> },
                { path: "report-found", element: <ReportForm key="found" found /> },
                { path: "item", element: <Catalogue /> },
                { path: "item/:itemId", element: <ItemDetails /> },
                { path: "lost-items", element: <LostCatalogue /> },
                { path: "lost-items/:reportId", element: <LostItemDetails /> },
                { path: "guidelines", element: <Guidelines /> },
            ] },
            { path: "admin/login", element: <Login /> },
            {
                path: "admin",
                element: <BaseDashboard />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: "reports/found", element: <FoundReports /> },
                    { path: "reports/found/:reportId", element: <FoundReportDetails /> },
                    { path: "reports/lost", element: <LostReports /> },
                    { path: "reports/lost/:reportId", element: <LostReportDetails /> },
                    { path: "claims", element: <Claims /> },
                    { path: "claims/:claimId", element: <ClaimDetails /> },
                    { path: "administrators", element: <Administrator /> },
                    { path: "returned", element: <ReturnedItems /> },
                    { path: "qr-codes", element: <QrCodes /> },
                    { path: "notifications", element: <Notifications /> },
                    { path: "logs", element: <ActivityLogs /> },
                ],
            },
        ],
    },
])
