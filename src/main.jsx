import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router/dom"
import { appRoutes } from './routes'
import { SWRConfig } from "swr"
import { apiFetcher } from "@/api/api"

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<SWRConfig
			value={{
				fetcher: apiFetcher,
				revalidateOnFocus: false,
				shouldRetryOnError: (error) => (error?.response?.status ?? 500) >= 500,
				errorRetryCount: 2,
			}}
		>
			<RouterProvider router={appRoutes} />
		</SWRConfig>
	</StrictMode>,
)
