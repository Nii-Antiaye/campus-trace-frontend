import { Music2 } from "lucide-react"
import { useIsNavigating, useReportNavigation } from "../../lib/navigation-progress"


const BAR_PROFILE = [
    { height: 20, delay: 0, duration: 1.06 },
    { height: 34, delay: 90, duration: 0.92 },
    { height: 26, delay: 180, duration: 1.14 },
    { height: 42, delay: 270, duration: 0.88 },
    { height: 24, delay: 360, duration: 1.22 },
    { height: 38, delay: 450, duration: 0.96 },
    { height: 30, delay: 540, duration: 1.08 },
]

export function NavigationIndicator() {
    const isLoading = useIsNavigating()

    return (
        <div
            aria-hidden={!isLoading}
            className={`pointer-events-none fixed inset-x-0 top-0 z-100 h-0.75 overflow-hidden transition-opacity duration-200 ${
                isLoading ? "opacity-100" : "opacity-0"
            }`}
        >
            <div aria-hidden="true" className="h-full w-full bg-foreground/8">
                <div className="relative h-full w-1/3 animate-route-progress bg-primary">
                    <span className="absolute -right-3.25 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center bg-primary text-primary-foreground ring-[3px] ring-background/70">
                        <Music2 className="size-2" strokeWidth={3} />
                    </span>
                </div>
            </div>
            {isLoading && (
                <span role="status" className="sr-only">
                    Loading
                </span>
            )}
        </div>
    )
}

export function RouteLoader({ compact = false }) {
    useReportNavigation()

    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex flex-col items-center justify-center gap-5 ${compact ? "" : "w-full min-h-dvh bg-background"}`}
        >
            <div className="relative">
                {!compact && (
                    <>
                        <Music2 aria-hidden className="animate-note-rise absolute -left-11 top-6 size-4 text-primary/50 motion-reduce:hidden" />
                        <Music2 aria-hidden className="animate-note-rise absolute -right-9 top-9 size-5 text-primary/50 motion-reduce:hidden" style={{ animationDelay: "1.4s" }} />
                    </>
                )}
                <div className={`relative flex items-end justify-center gap-0.75 ${compact ? "basis-7" : "border border-border/70 bg-card/40 px-5 pb-4 pt-6"}`}>
                    <Music2
                        aria-hidden
                        className={`animate-note-bob absolute left-1/2 text-primary ${compact ? "-top-5 -ml-2 size-4" : "-top-9 -ml-2.5 size-5"}`}
                    />
                    <div className={`flex items-end gap-0.75 ${compact ? "h-6" : "h-11.5"}`}>
{BAR_PROFILE.map((bar, i) => (
                            <span
                                key={i}
                                aria-hidden
                                className="animate-eq-bar w-0.75 rounded-full bg-primary"
                                style={{
                                    height: compact ? Math.round(bar.height / 2) : bar.height,
                                    opacity: 0.45 + (i / (BAR_PROFILE.length - 1)) * 0.55,
                                    animationDelay: `${bar.delay}ms`,
                                    animationDuration: `${bar.duration}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className={`font-mono uppercase tracking-[0.32em] text-muted-foreground ${compact ? "text-[10px]" : "text-[11px]"}`}>
                Loading
            </p>
        </div>
    )
}