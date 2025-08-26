"use client"

import { StrictMode } from "react"
import App from "../src/App"
import { AppProvider } from "../src/context/AppContext"
import "../src/index.css"

export default function Page() {
  return (
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>
  )
}
