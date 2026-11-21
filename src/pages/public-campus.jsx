import { useState } from "react"
import { Form, Link, NavLink, Outlet, useParams, useSearchParams } from "react-router"
import { ArrowUpRight, Check, MapPin, Search, Tag, Waypoints } from "lucide-react"
import useSWR from "swr"
import { api, apiErrorMessage } from "@/api/api"
import logo from "@/assets/images/logo.png"
import "./public-campus.css"

const categories = ["Bags", "Clothing", "Electronics", "ID and cards", "Keys", "Books", "Other"]
const prettyDate = value => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

export function PublicCampus() {
    return <div className="campus">
        <a className="campus-skip" href="#public-main">Skip to content</a>
        <header className="campus-nav"><Link to="/" className="campus-brand"><img src={logo} alt="" />Campus Trace</Link>
            <nav aria-label="Public navigation">{[["/item","Found items"],["/report-lost","Report lost"],["/report-found","Report found"],["/guidelines","Pickup guide"]].map(([url,label]) =>
                <NavLink key={url} to={url}>{label}</NavLink>)}</nav>
        </header>
        <main id="public-main" className="campus-main"><Outlet /></main>
        <footer className="campus-footer"><span>Campus Trace · Lost property desk</span><Link to="/admin/login">Staff sign-in</Link></footer>
    </div>
}

export function CampusHome() {
    return <>
        <section className="campus-hero">
            <div><h1>Lost something<br />on campus?</h1>
                <p>Search the items handed in at the desk, or tell us what’s missing.</p>
                <Form method="get" action="/item" className="campus-search"><Search aria-hidden="true" size={20} />
                    <input name="q" aria-label="Search found items" placeholder="Try a backpack, keys or a location" /><button>Search</button>
                </Form>
                <Link to="/item">Browse all found items</Link>
            </div>
            <div className="campus-tag" aria-hidden="true"><i /><Tag size={42} strokeWidth={1.4}/><strong>Lost property</strong><span>Campus Trace</span><b /></div>
        </section>
        <div className="campus-paths">{[
            ["/report-lost","Report a lost item","Leave a description and a way for the desk to reach you."],
            ["/report-found","Hand in a found item","Tell the desk what you found before bringing it in."],
            ["/guidelines","Collect your item","Find out how ownership checks and pickup work."],
        ].map(([url,title,text]) => <Link key={url} to={url}><ArrowUpRight aria-hidden="true" /><h2>{title}</h2><p>{text}</p></Link>)}</div>
    </>
}

function RequestState({ error, retry }) {
    return error ? <div role="alert"><p>{apiErrorMessage(error, "We couldn’t load the catalogue. Try again.")}</p><button className="campus-secondary" onClick={() => retry()}>Try again</button></div>
        : <p role="status">Loading found items…</p>
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
            <span className="campus-thumb">{item.image_url ? <img src={item.image_url} alt="" loading="lazy"/> : <Tag />}</span>
            <span><small>{item.category}</small><strong>{item.title}</strong><span>{item.location_found} · {prettyDate(item.found_at)}</span></span><ArrowUpRight /></Link></li>)}</ul>
            : <p>No items {query || category ? "match these filters." : "are currently listed."} <Link to="/report-lost">Report a missing item</Link></p>}
    </section>
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
        try { const result = await api.post(url,payload); setReference(result.data.reference) }
        catch (err) { setError(apiErrorMessage(err,"Couldn’t send this form. Your entries are still here; please try again.")) }
        finally { setBusy(false) }
    }
    return { busy,error,reference,send }
}

function Receipt({ title, reference, children }) {
    return <section className="campus-receipt" role="status"><Check aria-hidden="true"/><h1>{title}</h1><p>{children}</p><p>Keep this reference for the desk:</p><code>{reference}</code><Link to="/">Back to Campus Trace</Link></section>
}

export function ReportForm({ found = false }) {
    const { busy,error,reference,send } = useSubmission()
    const kind = found ? "found" : "lost"
    function submit(event) {
        event.preventDefault()
        const payload = Object.fromEntries(new FormData(event.currentTarget))
        const date = found ? "found_at" : "lost_at"
        payload[date] = payload[date] ? new Date(payload[date]).toISOString() : null
        send(`/public/reports/${kind}`, payload)
    }
    if (reference) return <Receipt title={`${found ? "Found" : "Lost"} report received`} reference={reference}>{found ? "Bring the item to the campus lost property desk. Staff will check it before publishing a listing." : "The desk has your description. You can also browse found items and submit a claim if you recognize yours."}</Receipt>
    return <section className="campus-split"><div><h1>Report a {kind} item</h1><p className="campus-intro">{found ? "Tell the desk what you found and where you picked it up." : "Describe what’s missing and where you last remember having it."}</p>
        <form className="campus-form" onSubmit={submit}><fieldset><legend>Item details</legend>
            <label>Item name<input name="item_name" placeholder="e.g. Blue backpack" maxLength={200} required /></label>
            <label>Category<select name="category" required defaultValue=""><option value="" disabled>Choose a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>{found ? "Where did you find it?" : "Where did you last see it?"}<input name={found ? "location_found" : "last_seen_location"} maxLength={255} required /></label>
            <label>{found ? "When did you find it?" : "When did you last see it? (optional)"}<input type="datetime-local" name={found ? "found_at" : "lost_at"} required={found} /></label>
            <label>Description<textarea name="description" maxLength={4000} required rows={3} /></label>
        </fieldset><ContactFields />{error && <p role="alert">{error}</p>}<button disabled={busy}>{busy ? "Sending…" : `Send ${kind} report`}</button></form></div>
        <aside><MapPin/><h2>{found ? "Keep it with you until hand-in" : "Already spotted your item?"}</h2><p>{found ? "A report lets staff know an item is on its way. Only items physically checked by the desk appear in the catalogue." : "Open its catalogue listing to answer the ownership questions. Filing a lost report alone does not reserve it."}</p><Link to={found ? "/guidelines" : "/item"}>{found ? "Read the pickup guide" : "Browse found items"}</Link></aside>
    </section>
}

export function ItemDetails() {
    const { itemId } = useParams()
    return <ClaimPage key={itemId} itemId={itemId} />
}

function ClaimPage({ itemId }) {
    const { data:item,error,mutate } = useSWR(`/public/items/${itemId}`)
    const submission = useSubmission()
    function submit(event) {
        event.preventDefault()
        const payload = Object.fromEntries(new FormData(event.currentTarget))
        const answers = {}
        for (const q of item.questions) {
            const answer = payload[q.id]?.trim()
            if (answer) answers[q.id] = answer
            delete payload[q.id]
        }
        submission.send(`/public/items/${itemId}/claims`,{ ...payload,answers })
    }
    if (submission.reference) return <Receipt title="Claim received" reference={submission.reference}>Staff will review your private answers. Wait for approval and pickup instructions before coming to collect the item.</Receipt>
    return <section><Link to="/item">Back to found items</Link>{error || !item ? <RequestState error={error} retry={mutate}/> : <div className="campus-split campus-detail"><div>
        <small>{item.category}</small><h1>{item.title}</h1><p className="campus-intro">{item.public_description}</p>
        <p><strong>Found at {item.location_found}</strong><br />{prettyDate(item.found_at)}</p>
        {item.image_url && <img className="campus-photo" src={item.image_url} alt={item.title}/>}
        </div><form className="campus-form" onSubmit={submit}><fieldset><legend>Claim this item</legend><p>Give details only the owner would know. Only desk staff can read your answers.</p>
            <label>How can you identify it?<textarea name="claim_description" required maxLength={4000}/></label>
            {item.questions.map(q => <label key={q.id}>{q.question}{!q.is_required && " (optional)"}<textarea name={q.id} required={q.is_required} maxLength={2000}/></label>)}
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
