"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BuyerForm } from "@/components/buyers/buyer-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/components/auth/auth-provider"
import { db, type Buyer } from "@/lib/database"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function EditBuyerPage() {
  const { user } = useAuth()
  const params = useParams()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadBuyer = async () => {
      if (user && params.id) {
        try {
          const buyerData = await db.buyers.findById(params.id as string, user.id)
          if (buyerData) {
            setBuyer(buyerData)
          } else {
            setNotFound(true)
          }
        } catch (error) {
          setNotFound(true)
        } finally {
          setLoading(false)
        }
      }
    }

    loadBuyer()
  }, [user, params.id])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="border-b bg-card">
            <div className="flex h-16 items-center px-4 sm:px-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="ml-4 sm:ml-6">
                <h1 className="text-lg sm:text-xl font-semibold text-balance">Buyer Not Found</h1>
              </div>
            </div>
          </div>

          <main className="p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="text-center">
                <CardContent className="py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Edit className="w-12 h-12 text-muted-foreground" />
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3">Cannot Edit Buyer</h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    The buyer you're trying to edit doesn't exist or you don't have access to it. The buyer may have
                    been deleted or moved to a different account.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard">
                      <Button variant="default" className="w-full sm:w-auto">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </Link>
                    <Link href="/buyers">
                      <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                        View All Buyers
                      </Button>
                    </Link>
                    <Link href="/buyers/new">
                      <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Buyer
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
                    <p>If you believe this is an error, please contact support.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <BuyerForm buyer={buyer!} mode="edit" />
    </ProtectedRoute>
  )
}
