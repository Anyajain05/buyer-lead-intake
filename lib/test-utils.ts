import type { BuyerFormData } from "./database"

export interface TestBuyer extends Omit<BuyerFormData, "budget_min" | "budget_max"> {
  budget_min?: number
  budget_max?: number
}

export const createTestBuyer = (overrides: Partial<TestBuyer> = {}): TestBuyer => {
  const defaultBuyer: TestBuyer = {
    name: "Test Buyer",
    email: `test${Math.random().toString(36).substr(2, 9)}@example.com`,
    phone: "(555) 123-4567",
    address: "123 Test St, Test City, TS 12345",
    budget_min: 300000,
    budget_max: 450000,
    preferred_locations: ["Test Location"],
    property_type: "single_family",
    bedrooms_min: 3,
    bathrooms_min: 2,
    square_feet_min: 1500,
    square_feet_max: 2500,
    move_in_timeline: "3_6_months",
    financing_type: "conventional",
    pre_approved: true,
    agent_notes: "Test buyer for testing purposes",
    lead_source: "Test Source",
    lead_quality: "warm",
    last_contact_date: "2024-01-15",
    next_follow_up_date: "2024-01-22",
    status: "active",
    tags: ["test", "automated"],
  }

  return { ...defaultBuyer, ...overrides }
}

export const createMultipleTestBuyers = (count: number, baseOverrides: Partial<TestBuyer> = {}): TestBuyer[] => {
  return Array.from({ length: count }, (_, index) =>
    createTestBuyer({
      ...baseOverrides,
      name: `Test Buyer ${index + 1}`,
      email: `testbuyer${index + 1}@example.com`,
    }),
  )
}

export const validateBuyerData = (buyer: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!buyer.name || typeof buyer.name !== "string") {
    errors.push("Name is required and must be a string")
  }

  if (!buyer.email || typeof buyer.email !== "string" || !buyer.email.includes("@")) {
    errors.push("Valid email is required")
  }

  if (!buyer.phone || typeof buyer.phone !== "string") {
    errors.push("Phone is required and must be a string")
  }

  if (!buyer.address || typeof buyer.address !== "string") {
    errors.push("Address is required and must be a string")
  }

  if (typeof buyer.budget_min !== "number" || buyer.budget_min < 0) {
    errors.push("Budget min must be a positive number")
  }

  if (typeof buyer.budget_max !== "number" || buyer.budget_max < 0) {
    errors.push("Budget max must be a positive number")
  }

  if (buyer.budget_max < buyer.budget_min) {
    errors.push("Budget max must be greater than or equal to budget min")
  }

  if (!Array.isArray(buyer.preferred_locations) || buyer.preferred_locations.length === 0) {
    errors.push("At least one preferred location is required")
  }

  const validPropertyTypes = ["single_family", "condo", "townhouse", "multi_family", "land", "commercial"]
  if (!validPropertyTypes.includes(buyer.property_type)) {
    errors.push("Invalid property type")
  }

  const validTimelines = ["immediate", "1_3_months", "3_6_months", "6_12_months", "over_1_year"]
  if (!validTimelines.includes(buyer.move_in_timeline)) {
    errors.push("Invalid move-in timeline")
  }

  const validFinancingTypes = ["cash", "conventional", "fha", "va", "other"]
  if (!validFinancingTypes.includes(buyer.financing_type)) {
    errors.push("Invalid financing type")
  }

  if (typeof buyer.pre_approved !== "boolean") {
    errors.push("Pre-approved must be a boolean")
  }

  if (!buyer.lead_source || typeof buyer.lead_source !== "string") {
    errors.push("Lead source is required and must be a string")
  }

  const validQualities = ["hot", "warm", "cold"]
  if (!validQualities.includes(buyer.lead_quality)) {
    errors.push("Invalid lead quality")
  }

  const validStatuses = ["active", "inactive", "closed_won", "closed_lost"]
  if (!validStatuses.includes(buyer.status)) {
    errors.push("Invalid status")
  }

  if (!Array.isArray(buyer.tags)) {
    errors.push("Tags must be an array")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const generateCSVTestData = (count = 5): string => {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Address",
    "Budget Min",
    "Budget Max",
    "Preferred Locations",
    "Property Type",
    "Bedrooms Min",
    "Bathrooms Min",
    "Square Feet Min",
    "Square Feet Max",
    "Move In Timeline",
    "Financing Type",
    "Pre Approved",
    "Agent Notes",
    "Lead Source",
    "Lead Quality",
    "Last Contact Date",
    "Next Follow Up Date",
    "Status",
    "Tags",
  ]

  const rows = [headers.join(",")]

  for (let i = 1; i <= count; i++) {
    const row = [
      `"Test Buyer ${i}"`,
      `"testbuyer${i}@example.com"`,
      `"(555) 123-456${i}"`,
      `"${i}23 Test St, Test City, TS 1234${i}"`,
      "300000",
      "450000",
      `"Test Location ${i}"`,
      "single_family",
      "3",
      "2",
      "1500",
      "2500",
      "3_6_months",
      "conventional",
      "true",
      `"Test buyer ${i} for testing"`,
      "Test Source",
      "warm",
      "2024-01-15",
      "2024-01-22",
      "active",
      `"test; buyer-${i}"`,
    ]
    rows.push(row.join(","))
  }

  return rows.join("\n")
}

export const simulateNetworkDelay = (ms = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const mockApiResponse = (data: any, delay = 500): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export const createErrorScenarios = () => {
  return {
    networkError: () => Promise.reject(new Error("Network error")),
    validationError: () => Promise.reject(new Error("Validation failed")),
    rateLimitError: () => Promise.reject(new Error("Rate limit exceeded")),
    notFoundError: () => Promise.reject(new Error("Resource not found")),
    serverError: () => Promise.reject(new Error("Internal server error")),
  }
}
