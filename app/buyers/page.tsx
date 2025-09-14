"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { BuyerCard } from "@/components/buyers/buyer-card"
import { BuyerFilters } from "@/components/buyers/buyer-filters"
import { ImportExportDialog } from "@/components/buyers/import-export-dialog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/components/auth/auth-provider"
import { db, type Buyer } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Calendar, DollarSign, Plus } from "lucide-react"
import Link from "next/link"

interface FilterState {
  status: string[]
  leadQuality: string[]
  propertyType: string[]
  budgetMin: string
  budgetMax: string
  preApproved: boolean | null
}

export default function BuyersPage() {
  const { user } = useAuth()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadBuyers = async () => {
    if (user) {
      try {
        const buyerList = await db.buyers.findMany(user.id)
        setBuyers(buyerList)
        setFilteredBuyers(buyerList)
      } catch (error) {
        console.error("Failed to load buyers:", error)
      }
    }
  }

  useEffect(() => {
    loadBuyers().then(() => setLoading(false))
  }, [user])

  useEffect(() => {
    let filtered = buyers

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (buyer) =>
          buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          buyer.phone.includes(searchQuery) ||
          buyer.preferred_locations.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredBuyers(filtered)
  }, [buyers, searchQuery])

  const applyFilters = (filters: FilterState) => {
    let filtered = buyers

    // Apply search filter first
    if (searchQuery) {
      filtered = filtered.filter(
        (buyer) =>
          buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          buyer.phone.includes(searchQuery) ||
          buyer.preferred_locations.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((buyer) => filters.status.includes(buyer.status))
    }

    // Apply lead quality filter
    if (filters.leadQuality.length > 0) {
      filtered = filtered.filter((buyer) => filters.leadQuality.includes(buyer.lead_quality))
    }

    // Apply property type filter
    if (filters.propertyType.length > 0) {
      filtered = filtered.filter((buyer) => filters.propertyType.includes(buyer.property_type))
    }

    // Apply budget filters
    if (filters.budgetMin) {
      filtered = filtered.filter((buyer) => buyer.budget_max >= Number.parseInt(filters.budgetMin))
    }
    if (filters.budgetMax) {
      filtered = filtered.filter((buyer) => buyer.budget_min <= Number.parseInt(filters.budgetMax))
    }

    // Apply pre-approved filter
    if (filters.preApproved !== null) {
      filtered = filtered.filter((buyer) => buyer.pre_approved === filters.preApproved)
    }

    setFilteredBuyers(filtered)
  }

  const clearFilters = () => {
    setFilteredBuyers(buyers)
  }

  const handleImportComplete = () => {
    loadBuyers()
  }

  const stats = {
    total: buyers.length,
    active: buyers.filter((b) => b.status === "active").length,
    hot: buyers.filter((b) => b.lead_quality === "hot").length,
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
          onSearch={setSearchQuery}
          onFilterToggle={() => setShowFilters(true)}
          onImportExportToggle={() => setShowImportExport(true)}
          showSearch={true}
        />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-balance">Buyer Management</h1>
                <p className="text-muted-foreground mt-2">Manage your buyer leads and track your pipeline</p>
              </div>
              <Link href="/buyers/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Buyer</span>
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Buyers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.hot}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgBudget)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Buyers Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Buyers ({filteredBuyers.length})</h2>
              </div>

              {filteredBuyers.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No buyers found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || buyers.length === 0
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first buyer"}
                      </p>
                      {buyers.length === 0 && (
                        <Link href="/buyers/new">
                          <Button className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Buyer</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBuyers.map((buyer) => (
                    <BuyerCard key={buyer.id} buyer={buyer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <BuyerFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        <ImportExportDialog
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          buyers={buyers}
          onImportComplete={handleImportComplete}
        />
      </div>
    </ProtectedRoute>
  )
}
