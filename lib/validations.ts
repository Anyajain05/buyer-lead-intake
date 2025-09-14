import { z } from "zod"

export const buyerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(1, "Address is required"),
    budget_min: z.number().min(0, "Minimum budget must be positive"),
    budget_max: z.number().min(0, "Maximum budget must be positive"),
    preferred_locations: z.array(z.string()).min(1, "At least one location required"),
    property_type: z.enum(["single_family", "condo", "townhouse", "multi_family", "land", "commercial"]),
    bedrooms_min: z.number().min(0).optional(),
    bathrooms_min: z.number().min(0).optional(),
    square_feet_min: z.number().min(0).optional(),
    square_feet_max: z.number().min(0).optional(),
    move_in_timeline: z.enum(["immediate", "1_3_months", "3_6_months", "6_12_months", "over_1_year"]),
    financing_type: z.enum(["cash", "conventional", "fha", "va", "other"]),
    pre_approved: z.boolean(),
    agent_notes: z.string().optional(),
    lead_source: z.string().min(1, "Lead source is required"),
    lead_quality: z.enum(["hot", "warm", "cold"]),
    last_contact_date: z.string().optional(),
    next_follow_up_date: z.string().optional(),
    status: z.enum(["active", "inactive", "closed_won", "closed_lost"]),
    tags: z.array(z.string()),
  })
  .refine((data) => data.budget_max >= data.budget_min, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budget_max"],
  })

export type BuyerFormData = z.infer<typeof buyerSchema>
