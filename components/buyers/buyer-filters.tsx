"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface FilterState {
  status: string[]
  leadQuality: string[]
  propertyType: string[]
  budgetMin: string
  budgetMax: string
  preApproved: boolean | null
}

interface BuyerFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  onClearFilters: () => void
}

export function BuyerFilters({ isOpen, onClose, onApplyFilters, onClearFilters }: BuyerFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    leadQuality: [],
    propertyType: [],
    budgetMin: "",
    budgetMax: "",
    preApproved: null,
  })

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: checked ? [...prev.status, status] : prev.status.filter((s) => s !== status),
    }))
  }

  const handleQualityChange = (quality: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      leadQuality: checked ? [...prev.leadQuality, quality] : prev.leadQuality.filter((q) => q !== quality),
    }))
  }

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: checked ? [...prev.propertyType, type] : prev.propertyType.filter((t) => t !== type),
    }))
  }

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClear = () => {
    const clearedFilters: FilterState = {
      status: [],
      leadQuality: [],
      propertyType: [],
      budgetMin: "",
      budgetMax: "",
      preApproved: null,
    }
    setFilters(clearedFilters)
    onClearFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filter Buyers</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2 mt-2">
                  {["active", "inactive", "closed_won", "closed_lost"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                        {status.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Lead Quality</Label>
                <div className="space-y-2 mt-2">
                  {["hot", "warm", "cold"].map((quality) => (
                    <div key={quality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`quality-${quality}`}
                        checked={filters.leadQuality.includes(quality)}
                        onCheckedChange={(checked) => handleQualityChange(quality, checked as boolean)}
                      />
                      <Label htmlFor={`quality-${quality}`} className="text-sm capitalize">
                        {quality}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="space-y-2 mt-2">
                  {["single_family", "condo", "townhouse", "multi_family", "land", "commercial"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.propertyType.includes(type)}
                        onCheckedChange={(checked) => handlePropertyTypeChange(type, checked as boolean)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                        {type.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Pre-approved</Label>
                <Select
                  value={filters.preApproved === null ? "all" : filters.preApproved.toString()}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      preApproved: value === "all" ? null : value === "true",
                    }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget-min" className="text-sm font-medium">
                Min Budget
              </Label>
              <Input
                id="budget-min"
                type="number"
                placeholder="0"
                value={filters.budgetMin}
                onChange={(e) => setFilters((prev) => ({ ...prev, budgetMin: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="budget-max" className="text-sm font-medium">
                Max Budget
              </Label>
              <Input
                id="budget-max"
                type="number"
                placeholder="1000000"
                value={filters.budgetMax}
                onChange={(e) => setFilters((prev) => ({ ...prev, budgetMax: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BuyerFilters
