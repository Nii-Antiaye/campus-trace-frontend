import { Link } from "react-router"
import { PencilIcon, SignalIcon, MonitorPlayIcon } from "lucide-react"
import { DataTableColumnHeader } from "@/components/custom/datatable/data-table"
import { DeleteAdminDialog } from "@/components/custom/administrator/delete-admin-dialog"
import { DeleteMusicianDialog } from "@/components/custom/administrator/delete-musician-dialog"
import { EditMusicianDialog } from "@/components/custom/administrator/edit-musician-dialog"
import { ToggleMusicianStatusDialog } from "@/components/custom/administrator/toggle-musician-status-dialog"
import { SetProviderAsActiveDialog } from "@/components/custom/administrator/set-provider-as-active-dialog"
import { DeleteProviderDialog } from "@/components/custom/administrator/delete-provider-dialog"
import { DeleteAudioSourceDialog } from "@/components/custom/administrator/delete-audio-source-dialog"
import { ToggleAudioSourceEnabledDialog } from "@/components/custom/administrator/toggle-audio-source-enabled-dialog"
import { DeleteMonitoredSongDialog } from "@/components/custom/musician/delete-monitored-song-dialog"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    SOURCE_TONE_CLASSES,
    SOURCE_TYPE_ICONS,
    describeCoverage,
    describeSourceStatus,
    formatLastChunk,
} from "@/lib/source-status"
import {
    SONG_TONE_CLASSES,
    describeSongStatus,
    formatAdded,
    formatDuration,
    formatRelative,
    slotColor,
} from "@/lib/song-status"
import { cn } from "cn"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
})

// Cell/header renderers receive the v9 context object:
// header: ({ header }) => ..., cell: ({ cell }) => ...
export const AdministratorsColumns = [
    {
        accessorKey: "fullname",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Name" />,
        cell: ({ cell }) => <span className="font-medium">{cell.getValue()}</span>,
    },
    {
        accessorKey: "email",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Email" />,
        cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue()}</span>,
    },
    {
        accessorKey: "dateCreated",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Added" />,
        sortFn: "alphanumeric",
        cell: ({ cell }) => {
            const value = cell.getValue()
            if (!value) return "—"
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return "—"
            return <time className="font-heading tabular-nums">{dateFormatter.format(date)}</time>
        },
    },
    {
        id: "role",
        accessorFn: () => "Administrator",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Role</span>,
        cell: () => <Badge variant="secondary">Admin</Badge>,
    },
    {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ cell }) => (
            <div className="flex justify-end">
                <DeleteAdminDialog administrator={cell.row.original} />
            </div>
        ),
    },
]

// DESIGN §6.5: name, email, quota, active state. Song count and last play need
// aggregation the list endpoint does not return yet, so they are not columns.
export const MusiciansColumns = [
    {
        accessorKey: "fullname",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Musician" />,
        // The DataTable also opens a row on click, but the link is what makes
        // the record reachable from the keyboard and openable in a new tab.
        cell: ({ row }) => (
            <Link
                to={`/dashboard/administrator/musicians/${row.original.id}`}
                className="font-medium underline-offset-4 hover:underline focus-visible:underline"
            >
                {row.original.fullname}
            </Link>
        ),
    },
    {
        accessorKey: "email",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Email" />,
        cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue()}</span>,
    },
    {
        accessorKey: "maxSongsToMonitor",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Song slots" />,
        cell: ({ cell }) => (
            // Mono + tabular so the quota lines up down the column.
            <span className="font-heading tabular-nums">{cell.getValue() ?? "—"}</span>
        ),
    },
    {
        id: "status",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Status</span>,
        cell: ({ row }) => {
            const isActive = Boolean(row.original.isActive)
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "gap-1.5",
                        isActive ? "border-success/40 text-success" : "text-muted-foreground",
                    )}
                >
                    <span
                        className={cn(
                            "size-1.5 rounded-full",
                            isActive ? "bg-success" : "bg-muted-foreground/60",
                        )}
                    />
                    {isActive ? "Active" : "Suspended"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-1">
                <EditMusicianDialog musician={row.original} />
                <ToggleMusicianStatusDialog musician={row.original} />
                <DeleteMusicianDialog musician={row.original} />
            </div>
        ),
    },
]

// AI providers are the rack of model endpoints the assistant can be patched
// through. The list leads with the one live thing on it — which provider is
// currently on the wire — so the active lamp is the only pulsing element.
export const AiProvidersColumns = [
    {
        accessorKey: "name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Provider" />,
        // The DataTable also opens a row on click; the link keeps the record
        // reachable from the keyboard and openable in a new tab.
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        row.original.isActive ? "animate-pulse bg-live" : "bg-muted-foreground/40",
                    )}
                    aria-hidden="true"
                />
                <Link
                    to={`/dashboard/administrator/ai-providers/${row.original.id}`}
                    className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                >
                    {row.original.name}
                </Link>
            </div>
        ),
    },
    {
        accessorKey: "providerType",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Type" />,
        // Mono callsign: the value is a machine prefix, not prose.
        cell: ({ cell }) => (
            <Badge variant="secondary" className="font-heading text-[11px] tracking-tight">
                {cell.getValue() ?? "—"}
            </Badge>
        ),
    },
    {
        accessorKey: "defaultModel",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Default model" />,
        cell: ({ row }) => (
            <span className="font-heading text-xs text-muted-foreground">
                {row.original.defaultModel ?? "—"}
                {row.original.baseUrl ? (
                    <span className="ml-1.5 text-muted-foreground/60" title={row.original.baseUrl}>
                        · custom URL
                    </span>
                ) : null}
            </span>
        ),
    },
    {
        id: "credentials",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Key</span>,
        cell: ({ row }) => {
            const { hasApiKey, apiKeyHint } = row.original
            if (!hasApiKey) {
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        None
                    </Badge>
                )
            }
            return (
                <span className="font-heading text-xs text-muted-foreground tabular-nums">
                    {apiKeyHint ?? "••••"}
                </span>
            )
        },
    },
    {
        id: "agents",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Agents</span>,
        cell: ({ row }) => (
            <span className="font-heading tabular-nums">{row.original.agentConfigCount ?? 0}</span>
        ),
    },
    {
        id: "state",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">State</span>,
        cell: ({ row }) => {
            const { isActive, isEnabled } = row.original
            return (
                <div className="flex items-center gap-1.5">
                    {isActive ? (
                        <Badge variant="outline" className="gap-1.5 border-live/40 text-live">
                            <span className="size-1.5 animate-pulse rounded-full bg-live" />
                            On the wire
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className={cn(
                                "gap-1.5",
                                isEnabled ? "text-muted-foreground" : "border-destructive/40 text-destructive",
                            )}
                        >
                            {isEnabled ? "Standby" : "Disabled"}
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-1">
                {!row.original.isActive && <SetProviderAsActiveDialog provider={row.original} />}
                <Link
                    to={`/dashboard/administrator/ai-providers/${row.original.id}/update`}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                    aria-label={`Edit ${row.original.name}`}
                >
                    <PencilIcon />
                </Link>
                <DeleteProviderDialog provider={row.original} />
            </div>
        ),
    },
]

// A source is a channel strip: the name and type say what it is, the status
// column says what it is *doing*, and those are different questions answered by
// different writers. The status column therefore never merges the switch and the
// lamp — a disagreeing pair is the single most useful thing on this screen.
export const AudioSourcesColumns = [
    {
        accessorKey: "name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Source" />,
        cell: ({ row }) => {
            const { name, id, type } = row.original
            const TypeIcon = type === "youtube" ? MonitorPlayIcon : SignalIcon
            return (
                <div className="flex items-center gap-2">
                    <TypeIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <Link
                        to={`/dashboard/administrator/audio-sources/${id}`}
                        className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {name}
                    </Link>
                </div>
            )
        },
    },
    {
        id: "status",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Status</span>,
        cell: ({ row }) => {
            const source = row.original
            const { label, tone } = describeSourceStatus(source)
            const classes = SOURCE_TONE_CLASSES[tone] ?? SOURCE_TONE_CLASSES.muted
            const lastChunk = formatLastChunk(source.lastChunkAt)

            return (
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            classes.dot,
                            // Only a source actually listening gets motion.
                            tone === "live" && "animate-pulse",
                        )}
                        aria-hidden="true"
                    />
                    <Badge variant="outline" className={cn("gap-1.5", classes.border, classes.text)}>
                        {label}
                    </Badge>
                    {source.status === "running" && lastChunk ? (
                        <span className="font-heading text-[11px] text-muted-foreground tabular-nums">
                            {lastChunk}
                        </span>
                    ) : null}
                </div>
            )
        },
    },
    {
        accessorKey: "type",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Type" />,
        cell: ({ cell }) => (
            <Badge variant="secondary" className="font-heading text-[11px] tracking-tight">
                {cell.getValue() ?? "—"}
            </Badge>
        ),
    },
    {
        id: "interval",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Chunk</span>,
        cell: ({ row }) => (
            <span className="font-heading text-xs text-muted-foreground tabular-nums">
                {row.original.chunkSeconds}s
            </span>
        ),
    },
    {
        id: "desired",
        accessorKey: "enabled",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Wanted" />,
        cell: ({ row }) => {
            const { enabled, status } = row.original
            // Call out the disagreement rather than letting a source with the
            // switch on read as healthy when the manager has not caught up.
            const isDiverging = enabled && status !== "running" && status !== "starting"
            return (
                <span className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            "font-heading text-xs tabular-nums",
                            enabled ? "text-foreground" : "text-muted-foreground",
                        )}
                    >
                        {enabled ? "On" : "Off"}
                    </span>
                    {isDiverging ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="size-1.5 rounded-full bg-chart-2" aria-hidden="true" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Wanted on, but the manager has not got there yet.
                            </TooltipContent>
                        </Tooltip>
                    ) : null}
                </span>
            )
        },
    },
    {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-1">
                <ToggleAudioSourceEnabledDialog source={row.original} />
                <Link
                    to={`/dashboard/administrator/audio-sources/${row.original.id}/update`}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                    aria-label={`Edit ${row.original.name}`}
                >
                    <PencilIcon />
                </Link>
                <DeleteAudioSourceDialog source={row.original} />
            </div>
        ),
    },
]

// A musician reads a station for one thing: whether their music was heard on
// it. So the station's own health stays a lamp and a label, and the airplay
// takes the numbers — the plays this station caught of theirs, which of their
// songs it heard, and how much of the week we were listening at all.
//
// There is no "wanted" column and no actions here. Whether a station should
// run is the operator's decision, not the musician's, and the only thing the
// musician can do with a station is open it.
export const MusicianAudioSourcesColumns = [
    {
        accessorKey: "name",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Station" />,
        cell: ({ row }) => {
            const { name, id, type } = row.original
            const TypeIcon = SOURCE_TYPE_ICONS[type] ?? SignalIcon
            return (
                <div className="flex items-center gap-2">
                    <TypeIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <Link
                        to={`/dashboard/musician/audio-sources/${id}`}
                        className="font-medium underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {name}
                    </Link>
                </div>
            )
        },
    },
    {
        id: "status",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Listening</span>,
        cell: ({ row }) => {
            const source = row.original
            const { label, tone } = describeSourceStatus(source)
            const classes = SOURCE_TONE_CLASSES[tone] ?? SOURCE_TONE_CLASSES.muted
            const lastChunk = formatLastChunk(source.lastChunkAt)

            return (
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            classes.dot,
                            // Only a station actually listening gets motion.
                            tone === "live" && "animate-pulse",
                        )}
                        aria-hidden="true"
                    />
                    <Badge variant="outline" className={cn("gap-1.5", classes.border, classes.text)}>
                        {label}
                    </Badge>
                    {source.status === "running" && lastChunk ? (
                        <span className="font-heading text-[11px] text-muted-foreground tabular-nums">
                            {lastChunk}
                        </span>
                    ) : null}
                </div>
            )
        },
    },
    {
        accessorKey: "matchCount",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Your plays" />,
        cell: ({ cell }) => (
            <span className="font-heading text-sm tabular-nums">{cell.getValue() ?? 0}</span>
        ),
    },
    {
        id: "songsCaught",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Songs heard</span>,
        cell: ({ row }) => (
            <span className="font-heading text-sm tabular-nums">{row.original.songsCaught ?? 0}</span>
        ),
    },
    {
        id: "coverage",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="px-2">Coverage</span>,
        cell: ({ row }) => {
            const { label, tone } = describeCoverage(row.original.coverage)
            const classes = SOURCE_TONE_CLASSES[tone] ?? SOURCE_TONE_CLASSES.muted
            return (
                <span
                    className={cn("font-heading text-xs tabular-nums", classes.text)}
                    title="How much of the last week we were listening to this station"
                >
                    {label}
                </span>
            )
        },
    },
    {
        accessorKey: "lastPlayedAt",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Last heard" />,
        cell: ({ cell }) => {
            const value = cell.getValue()
            if (!value) {
                return <span className="text-xs text-muted-foreground">Never</span>
            }
            return (
                <div className="flex flex-col">
                    <span className="font-heading text-xs tabular-nums">{formatRelative(value)}</span>
                    <span className="text-[11px] text-muted-foreground">{formatAdded(value)}</span>
                </div>
            )
        },
    },
]

// A monitored song is a slot in the musician's set: the colour and the number
// travel with it everywhere in the app, so the console reads the same way on
// every screen. The slot number is always written beside the colour — the
// chart ramp is too close in value to carry the meaning on its own.
export const MonitoredSongsColumns = [
    {
        accessorKey: "title",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Song" />,
        cell: ({ row }) => {
            const { title, slot } = row.original
            return (
                <div className="flex items-center gap-2">
                    <span
                        className={cn("h-6 w-1 shrink-0 rounded-sm", slotColor(slot))}
                        aria-hidden="true"
                    />
                    <span className="font-heading text-xs text-muted-foreground tabular-nums">
                        {String(slot ?? 0).padStart(2, "0")}
                    </span>
                    <Link
                        to={`/dashboard/musician/monitored-songs/${row.original.id}`}
                        className="truncate font-medium underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {title}
                    </Link>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
        cell: ({ row }) => {
            const song = row.original
            const { label, tone } = describeSongStatus(song)
            const classes = SONG_TONE_CLASSES[tone] ?? SONG_TONE_CLASSES.muted

            return (
                <div className="flex flex-col items-start gap-1">
                    <Badge variant="outline" className={cn("gap-1.5", classes.border, classes.text)}>
                        <span className={cn("size-1.5 rounded-full", classes.dot)} aria-hidden="true" />
                        {label}
                    </Badge>
                    {/* A failed song is useless without its reason, so the reason
                        rides with the status rather than behind a hover. */}
                    {song.error ? (
                        <span
                            className="max-w-56 truncate text-[11px] text-destructive"
                            title={song.error}
                        >
                            {song.error}
                        </span>
                    ) : null}
                </div>
            )
        },
    },
    {
        accessorKey: "durationSeconds",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Length" />,
        cell: ({ cell }) => (
            <span className="font-heading text-xs text-muted-foreground tabular-nums">
                {formatDuration(cell.getValue()) ?? "—"}
            </span>
        ),
    },
    {
        accessorKey: "playCount",
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Plays" />,
        cell: ({ row }) => {
            const { playCount, lastPlayedAt } = row.original
            const lastPlayed = formatRelative(lastPlayedAt)
            return (
                <div className="flex flex-col">
                    <span className="font-heading text-xs tabular-nums">{playCount ?? 0}</span>
                    {lastPlayed ? (
                        <span className="text-[11px] text-muted-foreground">{lastPlayed}</span>
                    ) : null}
                </div>
            )
        },
    },
    {
        accessorKey: "dateCreated",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Added" />,
        cell: ({ cell }) => (
            <span className="font-heading text-xs text-muted-foreground tabular-nums">
                {formatAdded(cell.getValue()) ?? "—"}
            </span>
        ),
    },
    {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <DeleteMonitoredSongDialog song={row.original} />
            </div>
        ),
    },
]

/**
 * The administrator's review queue: every song on the platform, and whose it is.
 *
 * The slot colour and number are the same as the musician's — a song keeps
 * its slot wherever it is read — but the queue adds the owner, because an
 * administrator reads a song as part of somebody's set, not on its own.
 *
 * There is no delete here: removing a song is the musician's call, and the
 * endpoint that does it is scoped to the musician who owns it.
 */
export const AdministratorMonitoredSongsColumns = [
    {
        accessorKey: "title",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Song" />,
        cell: ({ row }) => {
            const { title, slot } = row.original
            return (
                <div className="flex items-center gap-2">
                    <span
                        className={cn("h-6 w-1 shrink-0 rounded-sm", slotColor(slot))}
                        aria-hidden="true"
                    />
                    <span className="font-heading text-xs text-muted-foreground tabular-nums">
                        {String(slot ?? 0).padStart(2, "0")}
                    </span>
                    <Link
                        to={`/dashboard/administrator/monitored-songs/${row.original.id}`}
                        className="truncate font-medium underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {title}
                    </Link>
                </div>
            )
        },
    },
    {
        accessorKey: "musicianName",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Musician" />,
        cell: ({ row }) => (
            <Link
                to={`/dashboard/administrator/musicians/${row.original.musicianId}`}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:underline"
            >
                {row.original.musicianName}
            </Link>
        ),
    },
    {
        accessorKey: "status",
        header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
        cell: ({ row }) => {
            const song = row.original
            const { label, tone } = describeSongStatus(song)
            const classes = SONG_TONE_CLASSES[tone] ?? SONG_TONE_CLASSES.muted

            return (
                <div className="flex flex-col items-start gap-1">
                    <Badge variant="outline" className={cn("gap-1.5", classes.border, classes.text)}>
                        <span className={cn("size-1.5 rounded-full", classes.dot)} aria-hidden="true" />
                        {label}
                    </Badge>
                    {/* A failed song is useless without its reason, so the reason
                        rides with the status rather than behind a hover. */}
                    {song.error ? (
                        <span
                            className="max-w-56 truncate text-[11px] text-destructive"
                            title={song.error}
                        >
                            {song.error}
                        </span>
                    ) : null}
                </div>
            )
        },
    },
    {
        accessorKey: "durationSeconds",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Length" />,
        cell: ({ cell }) => (
            <span className="font-heading text-xs text-muted-foreground tabular-nums">
                {formatDuration(cell.getValue()) ?? "—"}
            </span>
        ),
    },
    {
        accessorKey: "playCount",
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Plays" />,
        cell: ({ row }) => {
            const { playCount, lastPlayedAt } = row.original
            const lastPlayed = formatRelative(lastPlayedAt)
            return (
                <div className="flex flex-col">
                    <span className="font-heading text-xs tabular-nums">{playCount ?? 0}</span>
                    {lastPlayed ? (
                        <span className="text-[11px] text-muted-foreground">{lastPlayed}</span>
                    ) : null}
                </div>
            )
        },
    },
    {
        accessorKey: "dateCreated",
        enableGlobalFilter: false,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Added" />,
        cell: ({ cell }) => (
            <span className="font-heading text-xs text-muted-foreground tabular-nums">
                {formatAdded(cell.getValue()) ?? "—"}
            </span>
        ),
    },
]
