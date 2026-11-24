import axios from "axios"

const TOKEN_KEY = "campus-trace-access-token"
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export const api = axios.create({
    baseURL: API_BASE_URL,
})

export function apiAssetUrl(path) {
    if (!path) return ""
    if (/^https?:\/\//i.test(path)) return path
    return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function storeToken(token, rememberMe = false) {
    clearToken()
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        if (typeof config.headers.delete === "function") {
            config.headers.delete("Content-Type")
        } else {
            delete config.headers["Content-Type"]
        }
    }
    const token = getStoredToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function apiFetcher(url) {
    const response = await api.get(url)
    return response.data
}

export async function loginAdmin(credentials) {
    const response = await api.post("/login", credentials)
    return response.data
}

export function apiErrorMessage(error, fallback = "The request could not be completed.") {
    const detail = error?.response?.data?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
        return detail.map((item) => {
            const field = item.loc?.at(-1)
            return field ? `${String(field).replaceAll("_", " ")}: ${item.msg}` : item.msg
        }).filter(Boolean).join(". ") || fallback
    }
    return fallback
}
