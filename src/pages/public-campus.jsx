import { useEffect, useRef, useState } from "react"
import marquee from "@/vendor/taste/moment"
import { still, clamp, fontsReady } from "@/vendor/taste/lib"
import "@/vendor/taste/motion.css"
import "@/vendor/taste/moment.css"
import { Link, NavLink, Outlet, useLocation, useParams, useSearchParams } from "react-router"
import { ArrowUpRight, Check, MapPin, Search, Tag, Waypoints } from "lucide-react"
import useSWR from "swr"
import { api, apiErrorMessage } from "@/api/api"
import logo from "@/assets/images/logo.png"
import "./public-campus.css"

const categories = ["Bags", "Clothing", "Electronics", "ID and cards", "Keys", "Books", "Other"]
const prettyDate = value => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

export function PublicCampus() {
    const { pathname } = useLocation()
    const [menuPath,setMenuPath] = useState(null)
    const menuOpen = menuPath === pathname
    return <div className="campus">
        <a className="campus-skip" href="#public-main">Skip to content</a>
        <header className="campus-nav"><Link to="/" className="campus-brand"><img src={logo} alt="" />Campus Trace</Link>
            <button className="campus-menu" aria-controls="campus-links" aria-expanded={menuOpen} onClick={() => setMenuPath(menuOpen ? null : pathname)}>Menu</button>
            <nav id="campus-links" data-open={menuOpen} aria-label="Public navigation">{[["/item","Found items"],["/lost-items","Lost items"],["/report-lost","Report lost"],["/report-found","Report found"],["/guidelines","Pickup guide"]].map(([url,label]) =>
                <NavLink key={url} to={url} onClick={() => setMenuPath(null)}>{label}</NavLink>)}</nav>
        </header>
        <main id="public-main" className="campus-main wrap"><Outlet /></main>
        <footer className="campus-footer"><span>Campus Trace · Lost property desk</span><Link to="/admin/login">Staff sign-in</Link></footer>
    </div>
}

export function CampusHome() {
    const rail = useRef(null)
    useEffect(() => {
        const instance = marquee(rail.current, { speed: 20, gap: 42 }, { reduced: still, clamp, fontsReady })
        return () => instance.destroy?.()
    }, [])
    const [query,setQuery] = useState("")
    const { data,error,mutate } = useSWR("/public/items")
    const matches = data?.filter(item => [item.title,item.location_found,item.category].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
    return <>
        <section className="campus-hero hero--split" data-enter>
            <div><h1>The campus<br />lost property desk.</h1>
                <p>Every listing is an item staff have physically received. Search the desk’s register, or leave a description of what’s missing. No account needed.</p>
                <Link className="campus-primary" to="/report-lost">Report a lost item <ArrowUpRight size={18}/></Link>
            </div>
            <div className="desk-register hero__visual app-frame" role="region" aria-label="Search found items">
                <div className="register-top"><Tag size={22}/><strong>Found at the desk</strong></div>
                <label className="register-search"><Search size={18}/><input type="search" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search found items" placeholder="Item, category or location"/></label>
                {error || !matches ? <RequestState error={error} retry={mutate}/> : matches.length ?
                    <ul>{matches.slice(0,3).map(item => <li key={item.id}><Link to={`/item/${item.id}`}><span><small>{item.category}</small><strong>{item.title}</strong><span>{item.location_found}</span></span><ArrowUpRight size={18}/></Link></li>)}</ul>
                    : <p role="status">{query ? "No matching items. Try another name or location." : "No items have been published yet."}</p>}
                <Link className="register-all" to={query ? `/item?q=${encodeURIComponent(query)}` : "/item"}>Open the catalogue <ArrowUpRight size={16}/></Link>
            </div>
        </section>
        <section className="campus-directory"><h2>Reports and collection</h2><div className="campus-paths">{[
            ["/lost-items","See what people are looking for","Check active lost-item searches and help an item find its owner."],
            ["/report-lost","Report a lost item","Leave a description and a way for the desk to reach you."],
            ["/report-found","Hand in a found item","Tell the desk what you found before bringing it in."],
            ["/guidelines","Collect your item","Find out how ownership checks and pickup work."],
        ].map(([url,title,text]) => <Link key={url} to={url}><h3>{title}</h3><p>{text}</p><ArrowUpRight aria-hidden="true" /></Link>)}</div>
            <div ref={rail} data-moment="marquee-row" className="category-rail"><ul aria-label="Item categories" className="mo-mq__track">{categories.map(category => <li key={category}>{category}</li>)}</ul></div>
        </section>
    </>
}

function RequestState({ error, retry, loading = "Loading found items…", fallback = "We couldn’t load the catalogue. Try again." }) {
    return error ? <div role="alert"><p>{apiErrorMessage(error, fallback)}</p><button className="campus-secondary" onClick={() => retry()}>Try again</button></div>
        : <p role="status">{loading}</p>
}

export function Catalogue() {
    const { data, error, mutate } = useSWR("/public/items")
    const [params, setParams] = useSearchParams()
    const query = params.get("q") || ""
    const category = params.get("category") || ""
    function filter(key, value) {
        const next = new URLSearchParams(params)
        if (value) next.set(key,value); else next.delete(key)
        setParams(next,{ replace:true })
    }
    const rows = data?.filter(item => (!category || item.category === category) && [item.title,item.category,item.location_found,item.public_description].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
    return <section><h1>Found items</h1><p className="campus-intro">These items have been received at the desk. Open a listing to check the details and claim it.</p>
        <div className="campus-filters"><label>Search the catalogue<input type="search" value={query} onChange={e => filter("q",e.target.value)} placeholder="Item or location" /></label>
            <label>Category<select value={category} onChange={e => filter("category",e.target.value)}><option value="">All categories</option>{[...new Set([...(data || []).map(item => item.category), ...(category ? [category] : [])])].sort().map(c => <option key={c}>{c}</option>)}</select></label></div>
        {error || !rows ? <RequestState error={error} retry={mutate}/> : rows.length ? <ul className="campus-list">{rows.map(item => <li key={item.id}><Link to={`/item/${item.id}`}>
            <span className="campus-thumb"><Tag /></span>
            <span><small>{item.category}</small><strong>{item.title}</strong><span>{item.location_found} · {prettyDate(item.found_at)}</span></span><ArrowUpRight /></Link></li>)}</ul>
            : <p>No items {query || category ? "match these filters." : "are currently listed."} <Link to="/report-lost">Report a missing item</Link></p>}
    </section>
}

export function LostCatalogue() {
    const { data, error, mutate } = useSWR("/public/lost-items")
    const [params, setParams] = useSearchParams()
    const query = params.get("q") || ""
    const category = params.get("category") || ""
    function filter(key, value) {
        const next = new URLSearchParams(params)
        if (value) next.set(key,value); else next.delete(key)
        setParams(next,{ replace:true })
    }
    const rows = data?.filter(report => (!category || report.category === category) && [report.item_name,report.category,report.last_seen_location,report.description].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
    return <section><h1>Lost items</h1><p className="campus-intro">These items are still being searched for. If you have seen one, open the report and tell the desk what you found.</p>
        <div className="campus-filters"><label>Search active reports<input type="search" value={query} onChange={e => filter("q",e.target.value)} placeholder="Item or last-seen location" /></label>
            <label>Category<select value={category} onChange={e => filter("category",e.target.value)}><option value="">All categories</option>{[...new Set([...(data || []).map(report => report.category), ...(category ? [category] : [])])].sort().map(c => <option key={c}>{c}</option>)}</select></label></div>
        {error || !rows ? <RequestState error={error} retry={mutate} loading="Loading lost items…" fallback="We couldn’t load active lost-item searches. Try again."/> : rows.length ? <ul className="campus-list">{rows.map(report => <li key={report.id}><Link to={`/lost-items/${report.id}`}>
            <span className="campus-thumb"><Search /></span>
            <span><small>{report.category}</small><strong>{report.item_name}</strong><span>Last seen: {report.last_seen_location}{report.lost_at ? ` · ${prettyDate(report.lost_at)}` : ""}</span></span><ArrowUpRight /></Link></li>)}</ul>
            : <p>No lost items {query || category ? "match these filters." : "are currently being searched for."} <Link to="/report-lost">Report a missing item</Link></p>}
    </section>
}

export function LostItemDetails() {
    const { reportId } = useParams()
    const { data:report,error,mutate } = useSWR(reportId ? `/public/lost-items/${reportId}` : null)
    return <section><Link to="/lost-items">Back to lost items</Link>{error || !report ? <RequestState error={error} retry={mutate} loading="Loading lost item…" fallback="We couldn’t load this lost-item search."/> : <div className="campus-split campus-detail"><div>
        <small>{report.category}</small><h1>{report.item_name}</h1><p className="campus-intro">{report.description}</p>
        <p><strong>Last seen at {report.last_seen_location}</strong><br />{report.lost_at ? prettyDate(report.lost_at) : `Reported ${prettyDate(report.reported_at)}`}</p>
        </div><aside><MapPin/><h2>Have you seen this item?</h2><p>Send a found report with where and when you found it. Keep the item safe until desk staff confirm the hand-in.</p><Link to="/report-found">Report it found</Link></aside></div>}</section>
}

function ContactFields() {
    return <fieldset><legend>Your contact details</legend><p>The desk uses these details to follow up privately.</p>
        <label>Full name<input name="full_name" autoComplete="name" minLength={2} maxLength={150} required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" maxLength={255} required /></label>
        <label>Phone number<input name="phone_number" type="tel" autoComplete="tel" maxLength={30} required /></label>
    </fieldset>
}

function useSubmission() {
    const [busy,setBusy] = useState(false)
    const [error,setError] = useState("")
    const [reference,setReference] = useState("")
    async function send(url, payload) {
        if (busy) return
        setBusy(true); setError("")
        try {
            const result = await api.post(url, payload)
            setReference(result.data.reference)
        } catch (err) { setError(apiErrorMessage(err, "Couldn’t send this form. Your entries are still here; please try again.")) }
        finally { setBusy(false) }
    }
    return { busy, error, reference, setError, send }
}

function Receipt({ title, reference, children }) {
    return <section className="campus-receipt" role="status"><Check aria-hidden="true"/><h1>{title}</h1><p>{children}</p><p>Keep this reference for the desk:</p><code>{reference}</code><Link to="/">Back to Campus Trace</Link></section>
}

export function ReportForm({ found = false }) {
    const { busy, error, reference, setError, send } = useSubmission()
    const kind = found ? "found" : "lost"
    const [files, setFiles] = useState([])
    function submit(event) {
        event.preventDefault()
        const form = event.currentTarget
        if (found) {
            if (files.length < 3 || files.length > 5) {
                setError("Upload between 3 and 5 photos of the item (each up to 5 MB).")
                return
            }
            if (files.some(file => file.size > 5 * 1024 * 1024)) {
                setError("Each photo must be 5 MB or smaller.")
                return
            }
            const fd = new FormData(form)
            const dt = fd.get("found_at")
            fd.set("found_at", dt ? new Date(dt).toISOString() : new Date().toISOString())
            send("/public/reports/found", fd)
            return
        }
        const payload = Object.fromEntries(new FormData(form))
        payload.lost_at = payload.lost_at ? new Date(payload.lost_at).toISOString() : null
        send("/public/reports/lost", payload)
    }
    if (reference) return <Receipt title={`${found ? "Found" : "Lost"} report received`} reference={reference}>{found ? "Bring the item to the campus lost property desk with your photos. Staff will check it before publishing a listing." : "The desk has your description. You can also browse found items and submit a claim if you recognize yours."}</Receipt>
    return <section className="campus-split"><div><h1>Report a {kind} item</h1><p className="campus-intro">{found ? "Tell the desk what you found, when and where, and add 3 to 5 photos." : "Describe what’s missing and where you last remember having it."}</p>
        <form className="campus-form" onSubmit={submit}><fieldset><legend>Item details</legend>
            <label>Item name<input name="item_name" placeholder="e.g. Blue backpack" maxLength={200} required /></label>
            <label>Category<select name="category" required defaultValue=""><option value="" disabled>Choose a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>{found ? "Where did you find it?" : "Where did you last see it?"}<input name={found ? "location_found" : "last_seen_location"} maxLength={255} required /></label>
            <label>{found ? "When did you find it?" : "When did you last see it? (optional)"}<input type="datetime-local" name={found ? "found_at" : "lost_at"} required={found} /></label>
            <label>Description<textarea name="description" maxLength={4000} required rows={3} />{!found && <small>This description will appear publicly while the search is active. Keep private proof of ownership out of it.</small>}</label>
            {found && <label>Photos (3–5, JPG/PNG/WebP, up to 5 MB each)<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple required onChange={e => setFiles(Array.from(e.target.files || []))} /></label>}
        </fieldset><ContactFields />{error && <p role="alert">{error}</p>}<button disabled={busy}>{busy ? "Sending…" : `Send ${kind} report`}</button></form></div>
        <aside><MapPin/><h2>{found ? "Keep it with you until hand-in" : "Already spotted your item?"}</h2><p>{found ? "Upload clear photos so staff can identify the item. Only items physically checked by the desk appear in the catalogue." : "Open its catalogue listing to answer the ownership questions. Filing a lost report alone does not reserve it."}</p><Link to={found ? "/guidelines" : "/item"}>{found ? "Read the pickup guide" : "Browse found items"}</Link>{!found && <Link to="/lost-items">View active lost searches</Link>}</aside>
    </section>
}

export function ItemDetails() {
    const { itemId } = useParams()
    return <ClaimPage key={itemId} itemId={itemId} />
}

function ClaimPage({ itemId }) {
    const { data:item,error,mutate } = useSWR(itemId ? `/public/items/${itemId}` : null)
    const submission = useSubmission()
    function submit(event) {
        event.preventDefault()
        if (!item) return
        const payload = Object.fromEntries(new FormData(event.currentTarget))
        const answers = {}
        for (const q of item.questions || []) {
            const answer = payload[q.id]?.trim()
            if (answer) answers[q.id] = answer
            delete payload[q.id]
        }
        submission.send(`/public/items/${itemId}/claims`,{ ...payload,answers })
    }
    if (submission.reference) return <Receipt title="Claim received" reference={submission.reference}>Staff will review your private answers. Wait for approval and pickup instructions before coming to collect the item.</Receipt>
    const questions = item?.questions || []
    return <section><Link to="/item">Back to found items</Link>{error || !item ? <RequestState error={error} retry={mutate}/> : <div className="campus-split campus-detail"><div>
        <small>{item.category}</small><h1>{item.title}</h1><p className="campus-intro">{item.public_description}</p>
        <p><strong>Found at {item.location_found}</strong><br />{prettyDate(item.found_at)}</p>
        </div><form className="campus-form" onSubmit={submit}><fieldset><legend>Claim this item</legend><p>Give details only the owner would know. Only desk staff can read your answers.</p>
            <label>How can you identify it?<textarea name="claim_description" required maxLength={4000}/></label>
            {questions.map(q => <label key={q.id}>{q.question}{!q.is_required && " (optional)"}<textarea name={q.id} required={q.is_required} maxLength={2000}/></label>)}
        </fieldset><ContactFields/>{submission.error && <p role="alert">{submission.error}</p>}<button disabled={submission.busy}>{submission.busy ? "Sending…" : "Send ownership claim"}</button></form></div>}</section>
}

export function Guidelines() {
    return <section className="campus-split"><div><h1>Picking up your item</h1><p className="campus-intro">A listing means the desk has the item. Follow these steps before collecting it.</p>
        <ol className="campus-steps">{[
            ["Find the listing","Check the description, location and date. If nothing matches, file a lost report so the desk has your details."],
            ["Send a private claim","Answer the item’s ownership questions and include a contact method. Keep your claim reference."],
            ["Wait for approval","Staff compare your answers with the item. Follow their instructions about when and where to collect it and what to bring."],
            ["Collect it in person","Give staff your reference and any requested evidence. Staff record the handover once you have the item."],
        ].map(([heading,text]) => <li key={heading}><h2>{heading}</h2><p>{text}</p></li>)}</ol><Link to="/item">Browse found items</Link></div>
        <aside><Waypoints/><h2>If you found something</h2><p>File a found report and hand the item to the desk. Staff handle ownership checks and collection.</p><Link to="/report-found">Report a found item</Link></aside></section>
}
