"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex flex-col items-center justify-center min-h-[300px] px-6 py-12 rounded-2xl mx-4 my-6"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(255,77,79,0.2)" }}
        >
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "rgba(255,77,79,0.1)" }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: "#FF4D4F" }} />
          </div>
          <h2 className="text-base font-bold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
            Algo deu errado
          </h2>
          <p className="text-sm text-center mb-6 max-w-sm" style={{ color: "var(--text-muted)" }}>
            Ocorreu um erro inesperado nesta seção. Tente recarregar ou volte ao dashboard.
          </p>
          {this.state.error && (
            <p className="text-xs mb-5 px-3 py-2 rounded-lg font-mono text-center max-w-md truncate"
              style={{ background: "var(--bg-subtle)", color: "var(--text-faint)" }}>
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#00D084", color: "#0A0C12" }}
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
