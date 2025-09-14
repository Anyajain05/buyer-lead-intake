import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

export type Buyer = Database["public"]["Tables"]["buyers"]["Row"] & { 
  name: string;
  lead_quality: string;
  pre_approved: boolean;
}
export type BuyerInsert = Database["public"]["Tables"]["buyers"]["Insert"]
export type BuyerUpdate = Database["public"]["Tables"]["buyers"]["Update"]
export type BuyerHistory = Database["public"]["Tables"]["buyer_history"]["Row"]
export type BuyerHistoryInsert = Database["public"]["Tables"]["buyer_history"]["Insert"]

import { checkRateLimit } from "./rate-limiter"
import { RateLimitError, NotFoundError, ValidationError } from "./error-handler"

export const db = {
  // Debug function to test basic connectivity
  testConnection: async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('buyers').select('count').limit(1)
      return { success: true, data, error }
    } catch (error) {
      return { success: false, error }
    }
  },

  buyers: {
    findMany: async (userId: string): Promise<Buyer[]> => {
      const rateLimitResult = checkRateLimit(`findMany:${userId}`)
      if (!rateLimitResult.allowed) {
        throw new RateLimitError("Too many requests. Please try again later.")
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch buyers: ${error.message}`)
      }

      // Add computed fields after fetching
      const buyersWithComputedFields = (data || []).map((buyer: Database["public"]["Tables"]["buyers"]["Row"]) => ({
        ...buyer,
        name: `${buyer.first_name} ${buyer.last_name}`,
        lead_quality: buyer.priority,
        pre_approved: buyer.financing_status === 'pre-approved'
      })) as Buyer[]

      return buyersWithComputedFields
    },

    findById: async (id: string, userId: string): Promise<Buyer | null> => {
      const rateLimitResult = checkRateLimit(`findById:${userId}`)
      if (!rateLimitResult.allowed) {
        throw new RateLimitError("Too many requests. Please try again later.")
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .eq("owner_id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch buyer: ${error.message}`)
      }

      if (!data) {
        return null
      }

      // Add computed fields after fetching
      const buyerWithComputedFields: Buyer = {
        ...data,
        name: `${data.first_name} ${data.last_name}`,
        lead_quality: data.priority,
        pre_approved: data.financing_status === 'pre-approved'
      }

      return buyerWithComputedFields
    },

    create: async (data: BuyerInsert): Promise<Buyer> => {
      const rateLimitResult = checkRateLimit(`create:${data.owner_id}`)
      if (!rateLimitResult.allowed) {
        throw new RateLimitError("Too many requests. Please try again later.")
      }

      const supabase = createClient()

      const { data: existingBuyer } = await supabase
        .from("buyers")
        .select("id")
        .eq("email", data.email.toLowerCase())
        .eq("owner_id", data.owner_id)
        .single()

      if (existingBuyer) {
        throw new ValidationError("A buyer with this email already exists")
      }

      const { data: buyer, error } = await supabase
        .from("buyers")
        .insert([data])
        .select("*")
        .single()

      if (error) {
        throw new Error(`Failed to create buyer: ${error.message}`)
      }

      // Add computed fields
      const buyerWithComputedFields: Buyer = {
        ...buyer,
        name: `${buyer.first_name} ${buyer.last_name}`,
        lead_quality: buyer.priority,
        pre_approved: buyer.financing_status === 'pre-approved'
      }

      await db.buyerHistory.create({
        buyer_id: buyerWithComputedFields.id,
        action: "created",
        notes: `Buyer ${buyerWithComputedFields.first_name} ${buyerWithComputedFields.last_name} was created`,
        owner_id: buyerWithComputedFields.owner_id,
      })

      return buyerWithComputedFields
    },

    update: async (id: string, data: BuyerUpdate, userId: string): Promise<Buyer | null> => {
      const rateLimitResult = checkRateLimit(`update:${userId}`)
      if (!rateLimitResult.allowed) {
        throw new RateLimitError("Too many requests. Please try again later.")
      }

      const supabase = createClient()

      const { data: existingBuyer } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .eq("owner_id", userId)
        .single()

      if (!existingBuyer) {
        throw new NotFoundError("Buyer not found")
      }

      if (data.email && data.email !== existingBuyer.email) {
        const { data: duplicateBuyer } = await supabase
          .from("buyers")
          .select("id")
          .eq("email", data.email.toLowerCase())
          .eq("owner_id", userId)
          .neq("id", id)
          .single()

        if (duplicateBuyer) {
          throw new ValidationError("A buyer with this email already exists")
        }
      }

      const { data: buyer, error } = await supabase
        .from("buyers")
        .update(data)
        .eq("id", id)
        .eq("owner_id", userId)
        .select("*")
        .single()

      if (error) {
        throw new Error(`Failed to update buyer: ${error.message}`)
      }

      // Add computed fields
      const buyerWithComputedFields: Buyer = {
        ...buyer,
        name: `${buyer.first_name} ${buyer.last_name}`,
        lead_quality: buyer.priority,
        pre_approved: buyer.financing_status === 'pre-approved'
      }

      await db.buyerHistory.create({
        buyer_id: id,
        action: "updated",
        notes: "Buyer information was updated",
        owner_id: userId,
      })

      return buyerWithComputedFields
    },

    delete: async (id: string, userId: string): Promise<boolean> => {
      const rateLimitResult = checkRateLimit(`delete:${userId}`)
      if (!rateLimitResult.allowed) {
        throw new RateLimitError("Too many requests. Please try again later.")
      }

      const supabase = createClient()

      const { error } = await supabase.from("buyers").delete().eq("id", id).eq("owner_id", userId)

      if (error) {
        throw new Error(`Failed to delete buyer: ${error.message}`)
      }

      return true
    },
  },

  buyerHistory: {
    findByBuyerId: async (buyerId: string, userId: string): Promise<BuyerHistory[]> => {
      const rateLimitResult = checkRateLimit(`history:${userId}`)
      if (!rateLimitResult.allowed) {
        throw new RateLimitError("Too many requests. Please try again later.")
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("buyer_history")
        .select("*")
        .eq("buyer_id", buyerId)
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch buyer history: ${error.message}`)
      }

      return data || []
    },

    create: async (data: BuyerHistoryInsert): Promise<BuyerHistory> => {
      const supabase = createClient()
      const { data: history, error } = await supabase.from("buyer_history").insert([data]).select().single()

      if (error) {
        throw new Error(`Failed to create history entry: ${error.message}`)
      }

      return history
    },
  },
}

export const seedSampleData = async (userId: string) => {
  // Sample data seeding is now handled by the database migration scripts
  // This function is kept for compatibility but does nothing
  return
}
