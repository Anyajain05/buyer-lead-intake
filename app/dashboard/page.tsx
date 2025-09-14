"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/components/auth/auth-provider"
import { db, type Buyer } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Phone, Home } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import BuyerFilters from "@/components/buyers/buyer-filters"
import ImportExportDialog from "@/components/buyers/import-export-dialog"

export default function DashboardPage() {
  const { user } = useAuth()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadBuyers = async () => {
    if (user) {
      try {
        const buyerList = await db.buyers.findMany(user.id)
        setBuyers(buyerList)
        setFilteredBuyers(buyerList)
        setTotalPages(Math.ceil(buyerList.length / 6))
      } catch (error) {
        console.error("Failed to load buyers:", error)
      }
    }
  }

  useEffect(() => {
    loadBuyers().then(() => setLoading(false))
  }, [user])

  const stats = {
    total: buyers.length,
    active: buyers.filter((b) => b.status === "active").length,
    closed_won: buyers.filter((b) => b.status === "closed_won").length,
    avgBudget:
      buyers.length > 0 ? buyers.reduce((sum, b) => sum + (b.budget_min + b.budget_max) / 2, 0) / buyers.length : 0,
  }

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
        return "bg-green-100 text-green-800"
      case "closed_won":
        return "bg-blue-100 text-blue-800"
      case "closed_lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "hot":
        return "bg-yellow-100 text-yellow-800"
      case "warm":
        return "bg-orange-100 text-orange-800"
      case "cold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSearch = (query: string) => {
    const filtered = buyers.filter(
      (buyer) =>
        buyer.name.toLowerCase().includes(query.toLowerCase()) ||
        buyer.email.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredBuyers(filtered)
    setCurrentPage(1)
  }

  const handleFiltersChange = (filters: any) => {
    const filtered = buyers.filter((buyer) => {
      let matches = true
      if (filters.status && buyer.status !== filters.status) matches = false
      if (filters.lead_quality && buyer.lead_quality !== filters.lead_quality) matches = false
      return matches
    })
    setFilteredBuyers(filtered)
    setCurrentPage(1)
  }

  // Get recent buyers (last 6)
  const recentBuyers = filteredBuyers.slice((currentPage - 1) * 6, currentPage * 6)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          showSearch={true}
          onSearch={handleSearch}
          onFilterToggle={() => setShowFilters(!showFilters)}
          onImportExportToggle={() => setShowImportExport(!showImportExport)}
        />

        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-balance">Dashboard</h1>
                <p className="text-muted-foreground">Manage your buyer leads and track progress</p>
              </div>
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <div className="text-center flex-1 sm:flex-none">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Buyers</div>
                </div>
                <div className="text-center flex-1 sm:flex-none">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center flex-1 sm:flex-none">
                  <div className="text-2xl font-bold text-blue-600">{stats.closed_won}</div>
                  <div className="text-sm text-muted-foreground">Closed Won</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <Card>
                <CardContent className="pt-6">
                  <BuyerFilters onFiltersChange={handleFiltersChange} />
                </CardContent>
              </Card>
            )}

            {/* Buyers Grid */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredBuyers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No buyers found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {recentBuyers.map((buyer) => (
                      <Card key={buyer.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg truncate">{buyer.name}</CardTitle>
                              <p className="text-sm text-muted-foreground truncate">{buyer.email}</p>
                            </div>
                            <div className="flex flex-col space-y-1 ml-2">
                              <Badge className={getStatusColor(buyer.status)} variant="secondary">
                                {buyer.status.replace("_", " ")}
                              </Badge>
                              <Badge className={getQualityColor(buyer.lead_quality)} variant="outline">
                                {buyer.lead_quality}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{buyer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span>
                              {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="capitalize truncate">{buyer.property_type.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(buyer.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {buyer.preferred_locations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {buyer.preferred_locations.slice(0, 2).map((location) => (
                                <Badge key={location} variant="secondary" className="text-xs">
                                  {location}
                                </Badge>
                              ))}
                              {buyer.preferred_locations.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{buyer.preferred_locations.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                            <Link href={`/buyers/${buyer.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/buyers/${buyer.id}/edit`} className="flex-1">
                              <Button size="sm" className="w-full">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Import/Export Dialog */}
        <ImportExportDialog
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          buyers={buyers}
          onImportComplete={loadBuyers}
        />
      </div>
    </ProtectedRoute>
  )
}
