"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buyerSchema, type BuyerFormData } from "@/lib/validations"
import { db, type Buyer } from "@/lib/database"
import { useAuth } from "@/components/auth/auth-provider"
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { handleError } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"

interface BuyerFormProps {
  buyer?: Buyer
  mode: "create" | "edit"
}

export function BuyerForm({ buyer, mode }: BuyerFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newTag, setNewTag] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: buyer
      ? {
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          address: buyer.address,
          budget_min: buyer.budget_min,
          budget_max: buyer.budget_max,
          preferred_locations: buyer.preferred_locations,
          property_type: buyer.property_type,
          bedrooms_min: buyer.bedrooms_min,
          bathrooms_min: buyer.bathrooms_min,
          square_feet_min: buyer.square_feet_min,
          square_feet_max: buyer.square_feet_max,
          move_in_timeline: buyer.move_in_timeline,
          financing_type: buyer.financing_type,
          pre_approved: buyer.pre_approved,
          lead_source: buyer.lead_source,
          lead_quality: buyer.lead_quality,
          last_contact_date: buyer.last_contact_date,
          next_follow_up_date: buyer.next_follow_up_date,
          status: buyer.status,
          tags: buyer.tags,
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          budget_min: 0,
          budget_max: 0,
          preferred_locations: [],
          property_type: "single_family",
          move_in_timeline: "3_6_months",
          financing_type: "conventional",
          pre_approved: false,
          lead_source: "",
          lead_quality: "warm",
          status: "active",
          tags: [],
        },
  })

  const watchedLocations = watch("preferred_locations") || []
  const watchedTags = watch("tags") || []

  const onSubmit = async (data: BuyerFormData) => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      if (mode === "create") {
        await db.buyers.create({
          ...data,
          owner_id: user.id,
        })
        toast({
          title: "Buyer Created",
          description: `${data.name} has been successfully added to your buyer list.`,
        })
      } else if (buyer) {
        await db.buyers.update(buyer.id, data, user.id)
        toast({
          title: "Buyer Updated",
          description: `${data.name}'s information has been successfully updated.`,
        })
      }

      router.push("/dashboard")
    } catch (err) {
      const { message } = handleError(err)
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addLocation = () => {
    if (newLocation.trim() && !watchedLocations.includes(newLocation.trim())) {
      const updatedLocations = [...watchedLocations, newLocation.trim()]
      setValue("preferred_locations", updatedLocations)
      setNewLocation("")
    }
  }

  const removeLocation = (location: string) => {
    const updatedLocations = watchedLocations.filter((loc) => loc !== location)
    setValue("preferred_locations", updatedLocations)
  }

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      const updatedTags = [...watchedTags, newTag.trim()]
      setValue("tags", updatedTags)
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    const updatedTags = watchedTags.filter((t) => t !== tag)
    setValue("tags", updatedTags)
  }

  return (
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
            <h1 className="text-lg sm:text-xl font-semibold text-balance">
              {mode === "create" ? "Add New Buyer" : `Edit ${buyer?.name}`}
            </h1>
          </div>
        </div>
      </div>

      <main className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="John Smith"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="john@example.com"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lead_source">Lead Source *</Label>
                    <Input
                      id="lead_source"
                      {...register("lead_source")}
                      placeholder="Website, Referral, etc."
                      className={errors.lead_source ? "border-destructive" : ""}
                    />
                    {errors.lead_source && <p className="text-sm text-destructive">{errors.lead_source.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="123 Main St, City, State 12345"
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Property Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Property Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type *</Label>
                    <Select
                      value={watch("property_type")}
                      onValueChange={(value) => setValue("property_type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_family">Single Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi_family">Multi Family</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="move_in_timeline">Move-in Timeline *</Label>
                    <Select
                      value={watch("move_in_timeline")}
                      onValueChange={(value) => setValue("move_in_timeline", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="1_3_months">1-3 Months</SelectItem>
                        <SelectItem value="3_6_months">3-6 Months</SelectItem>
                        <SelectItem value="6_12_months">6-12 Months</SelectItem>
                        <SelectItem value="over_1_year">Over 1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms_min">Min Bedrooms</Label>
                    <Input
                      id="bedrooms_min"
                      type="number"
                      min="0"
                      {...register("bedrooms_min", { valueAsNumber: true })}
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms_min">Min Bathrooms</Label>
                    <Input
                      id="bathrooms_min"
                      type="number"
                      min="0"
                      step="0.5"
                      {...register("bathrooms_min", { valueAsNumber: true })}
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="square_feet_min">Min Square Feet</Label>
                    <Input
                      id="square_feet_min"
                      type="number"
                      min="0"
                      {...register("square_feet_min", { valueAsNumber: true })}
                      placeholder="1500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="square_feet_max">Max Square Feet</Label>
                    <Input
                      id="square_feet_max"
                      type="number"
                      min="0"
                      {...register("square_feet_max", { valueAsNumber: true })}
                      placeholder="2500"
                    />
                  </div>
                </div>

                {/* Preferred Locations */}
                <div className="space-y-2">
                  <Label>Preferred Locations *</Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Add location"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addLocation} size="sm" className="sm:w-auto w-full">
                      <Plus className="w-4 h-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden">Add Location</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watchedLocations.map((location) => (
                      <Badge key={location} variant="secondary" className="flex items-center space-x-1">
                        <span>{location}</span>
                        <button type="button" onClick={() => removeLocation(location)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.preferred_locations && (
                    <p className="text-sm text-destructive">{errors.preferred_locations.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget & Financing */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Financing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Min Budget *</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      min="0"
                      {...register("budget_min", { valueAsNumber: true })}
                      placeholder="300000"
                      className={errors.budget_min ? "border-destructive" : ""}
                    />
                    {errors.budget_min && <p className="text-sm text-destructive">{errors.budget_min.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Max Budget *</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      min="0"
                      {...register("budget_max", { valueAsNumber: true })}
                      placeholder="450000"
                      className={errors.budget_max ? "border-destructive" : ""}
                    />
                    {errors.budget_max && <p className="text-sm text-destructive">{errors.budget_max.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financing_type">Financing Type *</Label>
                    <Select
                      value={watch("financing_type")}
                      onValueChange={(value) => setValue("financing_type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="fha">FHA</SelectItem>
                        <SelectItem value="va">VA</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 sm:pt-6">
                    <Checkbox
                      id="pre_approved"
                      checked={watch("pre_approved")}
                      onCheckedChange={(checked) => setValue("pre_approved", checked as boolean)}
                    />
                    <Label htmlFor="pre_approved" className="text-sm sm:text-base">
                      Pre-approved for financing
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Management */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lead_quality">Lead Quality *</Label>
                    <Select
                      value={watch("lead_quality")}
                      onValueChange={(value) => setValue("lead_quality", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={watch("status")} onValueChange={(value) => setValue("status", value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_contact_date">Last Contact Date</Label>
                    <Input id="last_contact_date" type="date" {...register("last_contact_date")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_follow_up_date">Next Follow-up Date</Label>
                    <Input id="next_follow_up_date" type="date" {...register("next_follow_up_date")} />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} size="sm" className="sm:w-auto w-full">
                      <Plus className="w-4 h-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden">Add Tag</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watchedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent_notes">Agent Notes</Label>
                  <Textarea
                    id="agent_notes"
                    {...register("agent_notes")}
                    placeholder="Add any additional notes about this buyer..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard" className="sm:w-auto w-full">
                <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Buyer" : "Update Buyer"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
