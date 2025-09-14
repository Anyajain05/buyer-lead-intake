"use client"

import { Component, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="py-12">
              <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                An unexpected error occurred while loading this page. Please try refreshing or go back to the dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="default" className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mt-8 pt-6 border-t text-left">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground mb-2">Error Details (Development)</summary>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">{this.state.error.stack}</pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
