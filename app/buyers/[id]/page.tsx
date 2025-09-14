"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/components/auth/auth-provider"
import { db, type Buyer, type BuyerHistory } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Mail, Phone, MapPin, DollarSign, Calendar, Home, CreditCard, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function BuyerDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [history, setHistory] = useState<BuyerHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadBuyerData = async () => {
      if (user && params.id) {
        try {
          const buyerData = await db.buyers.findById(params.id as string, user.id)
          if (buyerData) {
            setBuyer(buyerData)
            const historyData = await db.buyerHistory.findByBuyerId(buyerData.id, user.id)
            setHistory(historyData)
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

    loadBuyerData()
  }, [user, params.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "closed_won":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "closed_lost":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "hot":
        return "bg-red-100 text-red-800 border-red-200"
      case "warm":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (notFound || !buyer) {
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
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3">Buyer Not Found</h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    The buyer you're looking for doesn't exist or you don't have access to it. This could happen if the
                    buyer was deleted or if you don't have the necessary permissions.
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
                    <p>Need help? Contact support or check your permissions.</p>
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
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="flex h-auto sm:h-16 items-start sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-0">
            <div className="flex items-start sm:items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-balance">{buyer.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getStatusColor(buyer.status)}>{buyer.status.replace("_", " ")}</Badge>
                  <Badge className={getQualityColor(buyer.lead_quality)}>{buyer.lead_quality}</Badge>
                </div>
              </div>
            </div>
            <Link href={`/buyers/${buyer.id}/edit`} className="mt-2 sm:mt-0">
              <Button className="flex items-center space-x-2 w-full sm:w-auto">
                <Edit className="w-4 h-4" />
                <span>Edit Buyer</span>
              </Button>
            </Link>
          </div>
        </div>

        <main className="p-4 sm:p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium truncate">{buyer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{buyer.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium leading-relaxed">{buyer.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium capitalize">{buyer.property_type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Timeline</p>
                        <p className="font-medium capitalize">{buyer.move_in_timeline.replace("_", " ")}</p>
                      </div>
                    </div>
                  </div>

                  {(buyer.bedrooms_min || buyer.bathrooms_min) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {buyer.bedrooms_min && (
                        <div>
                          <p className="text-sm text-muted-foreground">Min Bedrooms</p>
                          <p className="font-medium">{buyer.bedrooms_min}</p>
                        </div>
                      )}
                      {buyer.bathrooms_min && (
                        <div>
                          <p className="text-sm text-muted-foreground">Min Bathrooms</p>
                          <p className="font-medium">{buyer.bathrooms_min}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {(buyer.square_feet_min || buyer.square_feet_max) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {buyer.square_feet_min && (
                        <div>
                          <p className="text-sm text-muted-foreground">Min Square Feet</p>
                          <p className="font-medium">{buyer.square_feet_min.toLocaleString()}</p>
                        </div>
                      )}
                      {buyer.square_feet_max && (
                        <div>
                          <p className="text-sm text-muted-foreground">Max Square Feet</p>
                          <p className="font-medium">{buyer.square_feet_max.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Preferred Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {buyer.preferred_locations.map((location) => (
                        <Badge key={location} variant="secondary">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Financing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                      <p className="font-medium">
                        {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Financing Type</p>
                        <p className="font-medium capitalize">{buyer.financing_type}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pre-approved</p>
                      <Badge variant={buyer.pre_approved ? "default" : "secondary"}>
                        {buyer.pre_approved ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {buyer.agent_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{buyer.agent_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Source</p>
                    <p className="font-medium">{buyer.lead_source}</p>
                  </div>

                  {buyer.last_contact_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Contact</p>
                      <p className="font-medium">{new Date(buyer.last_contact_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {buyer.next_follow_up_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next Follow-up</p>
                      <p className="font-medium">{new Date(buyer.next_follow_up_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(buyer.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {buyer.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {buyer.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {history.slice(0, 5).map((item) => (
                        <div key={item.id} className="border-l-2 border-muted pl-4">
                          <p className="text-sm font-medium capitalize">{item.action_type.replace("_", " ")}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.action_description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.action_date), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
