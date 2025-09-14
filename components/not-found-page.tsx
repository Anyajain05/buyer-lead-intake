import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface NotFoundPageProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actions?: Array<{
    label: string
    href: string
    variant?: "default" | "outline" | "secondary"
    icon?: React.ReactNode
  }>
}

export function NotFoundPage({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or you don't have access to it.",
  icon,
  actions = [
    {
      label: "Back to Dashboard",
      href: "/dashboard",
      variant: "default" as const,
      icon: <ArrowLeft className="w-4 h-4 mr-2" />,
    },
  ],
}: NotFoundPageProps) {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardContent className="py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            {icon || defaultIcon}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">{description}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button variant={action.variant || "outline"} className="w-full sm:w-auto">
                  {action.icon}
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <p>Need help? Contact support or check your permissions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
