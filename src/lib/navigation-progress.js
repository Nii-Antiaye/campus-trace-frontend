import { useId, useLayoutEffect, useSyncExternalStore } from "react"


const active = new Set()
const listeners = new Set()

function subscribe(onChange) {
    listeners.add(onChange)
    return () => listeners.delete(onChange)
}

function getSnapshot() {
    return active.size > 0
}

export function useIsNavigating() {
    return useSyncExternalStore(subscribe, getSnapshot)
}


export function useReportNavigation() {
    const id = useId()

    useLayoutEffect(() => {
        active.add(id)
        for (const listener of listeners) listener()

        return () => {
            active.delete(id)
            for (const listener of listeners) listener()
        }
    }, [id])
}