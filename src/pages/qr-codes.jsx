import { useState } from "react"
import { QrCode, Download } from "lucide-react"

import { AdminPageHeader, PageError } from "@/components/custom/admin-page"
import { Button } from "@/components/ui/button"
import { api, apiErrorMessage } from "@/api/api"
import { Spinner } from "@/components/ui/spinner"

const options = [
    { value: "home", label: "Campus Trace landing page", hint: "Opens the initial public landing page." },
    { value: "found", label: "Report found item", hint: "Opens the public report-found page." },
    { value: "lost", label: "Report lost item", hint: "Opens the public report-lost page." },
    { value: "claim", label: "Browse and claim", hint: "Opens the found-items catalogue page." },
]

export function QrCodes() {
    const [target, setTarget] = useState("home")
    const [baseUrl, setBaseUrl] = useState(() => window.location.origin)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    async function downloadQr() {
        setBusy(true)
        setError("")
        try {
            const res = await api.get("/admin/qr", { params: { target, base_url: baseUrl }, responseType: "blob" })
            const url = URL.createObjectURL(res.data)
            const a = document.createElement("a")
            a.href = url
            a.download = `campus-trace-${target}-qr.png`
            a.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            setError(apiErrorMessage(e, "Could not download QR code."))
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="flex flex-col gap-6">
            <AdminPageHeader title="QR codes" description="Download QR codes that link to public pages. Share them on posters or at the desk." />
            {error && <PageError error={error} />}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="border p-5">
                    <h2 className="font-medium">Generate a QR code</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Choose where the code should point and the site URL (use your public host in production).</p>
                    <div className="mt-5 grid gap-4">
                        <label className="grid gap-1.5 text-sm">
                            <span className="text-muted-foreground">Destination</span>
                            <select className="h-10 border bg-background px-3" value={target} onChange={(e) => setTarget(e.target.value)}>
                                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <span className="text-xs text-muted-foreground">{options.find((o) => o.value === target)?.hint}</span>
                        </label>
                        <label className="grid gap-1.5 text-sm">
                            <span className="text-muted-foreground">Site URL</span>
                            <input className="h-10 border bg-background px-3" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://campustrace.example" />
                        </label>
                        <Button type="button" onClick={downloadQr} disabled={busy}>
                            {busy ? <Spinner /> : <Download className="size-4" />} Download PNG
                        </Button>
                    </div>
                </div>
                <div className="border p-5 flex flex-col items-center justify-center text-center">
                    <QrCode className="size-10 text-muted-foreground" aria-hidden="true" />
                    <p className="mt-3 text-sm text-muted-foreground">The downloaded image points to <span className="font-mono text-foreground">{baseUrl.replace(/\/$/, "")}{target === "home" ? "/" : target === "found" ? "/report-found" : target === "lost" ? "/report-lost" : "/item"}</span>.</p>
                </div>
            </div>
        </section>
    )
}
