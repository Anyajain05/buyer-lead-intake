export interface Buyer {
  id: string
  owner_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  budget_min?: number
  budget_max?: number
  preferred_locations: string[]
  property_type?: "house" | "condo" | "townhouse" | "apartment" | "other"
  bedrooms?: number
  bathrooms?: number
  square_footage?: number
  move_in_timeline?: "immediate" | "1-3 months" | "3-6 months" | "6+ months"
  financing_status?: "pre-approved" | "pre-qualified" | "cash" | "needs-financing"
  agent_notes?: string
  tags: string[]
  lead_source?: string
  priority: "low" | "medium" | "high"
  status: "active" | "inactive" | "closed"
  created_at: string
  updated_at: string
}

export interface BuyerHistory {
  id: string
  buyer_id: string
  owner_id: string
  action: "created" | "updated" | "status_changed" | "note_added"
  field_name?: string
  old_value?: string
  new_value?: string
  notes?: string
  created_at: string
}

export interface Profile {
  id: string
  first_name?: string
  last_name?: string
  company?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface BuyerFilters {
  search?: string
  status?: string
  priority?: string
  property_type?: string
  budget_min?: number
  budget_max?: number
  tags?: string[]
}
