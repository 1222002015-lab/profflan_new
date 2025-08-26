"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "../context/AppContext"
import { LogIn, Shield, FileText, Users, Eye, EyeOff } from "lucide-react"

export function Login() {
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { state, dispatch } = useApp()

  const handlePublicTracking = () => {
    // Dispatch action to show public tracking or use callback from parent
    window.dispatchEvent(new CustomEvent("showPublicTracking", { detail: true }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const user = state.users.find((u) => u.id === credentials.id && u.password === credentials.password)

    if (user) {
      dispatch({ type: "LOGIN", payload: user })
    } else {
      setError("ID atau password salah")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 border border-border/20 relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SITRACK</h1>
          <p className="text-lg font-medium text-primary mb-1">Sistem Tracking Surat</p>
          <p className="text-sm text-muted-foreground">Kementerian Lingkungan Hidup Republik Indonesia</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-3 rounded-lg bg-card/50">
            <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Tracking Dokumen</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card/50">
            <Users className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Multi User</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card/50">
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Keamanan Tinggi</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="id" className="block text-sm font-semibold text-foreground">
              ID Pengguna
            </label>
            <input
              type="text"
              id="id"
              value={credentials.id}
              onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-foreground placeholder:text-muted-foreground"
              placeholder="Masukkan ID pengguna"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-foreground placeholder:text-muted-foreground pr-12"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogIn className="w-5 h-5" />
            Masuk ke Sistem
          </button>

          <button
            type="button"
            onClick={handlePublicTracking}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-3"
          >
            <FileText className="w-5 h-5" />
            Lacak Surat Publik
          </button>
        </form>

        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/20">
          <p className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            Akun Demo untuk Testing
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Admin</p>
              <p className="text-muted-foreground">admin1 / admin123</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Tata Usaha</p>
              <p className="text-muted-foreground">tu1 / tu123</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Koordinator</p>
              <p className="text-muted-foreground">coord1 / coord123</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Staff</p>
              <p className="text-muted-foreground">staff1 / staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
