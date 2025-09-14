import type { Buyer, BuyerFormData } from "@/lib/database"
import { buyerSchema } from "@/lib/validations"

export interface ImportResult {
  success: boolean
  imported: number
  errors: ImportError[]
  duplicates: number
}

export interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

export function exportBuyersToCSV(buyers: Buyer[]): string {
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
    "Created At",
  ]

  const csvRows = [headers.join(",")]

  buyers.forEach((buyer) => {
    const row = [
      `"${buyer.name.replace(/"/g, '""')}"`,
      `"${buyer.email}"`,
      `"${buyer.phone}"`,
      `"${buyer.address.replace(/"/g, '""')}"`,
      buyer.budget_min.toString(),
      buyer.budget_max.toString(),
      `"${buyer.preferred_locations.join("; ")}"`,
      buyer.property_type,
      buyer.bedrooms_min?.toString() || "",
      buyer.bathrooms_min?.toString() || "",
      buyer.square_feet_min?.toString() || "",
      buyer.square_feet_max?.toString() || "",
      buyer.move_in_timeline,
      buyer.financing_type,
      buyer.pre_approved.toString(),
      `"${(buyer.agent_notes || "").replace(/"/g, '""')}"`,
      `"${buyer.lead_source.replace(/"/g, '""')}"`,
      buyer.lead_quality,
      buyer.last_contact_date || "",
      buyer.next_follow_up_date || "",
      buyer.status,
      `"${buyer.tags.join("; ")}"`,
      buyer.created_at,
    ]
    csvRows.push(row.join(","))
  })

  return csvRows.join("\n")
}

export function parseCSVFile(csvContent: string): any[] {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = parseCSVRow(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i])
    if (values.length === 0) continue

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    rows.push(row)
  }

  return rows
}

function parseCSVRow(row: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < row.length) {
    const char = row[i]
    const nextChar = row[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 2
        continue
      } else {
        inQuotes = !inQuotes
        i++
        continue
      }
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
      i++
      continue
    }

    current += char
    i++
  }

  result.push(current.trim())
  return result
}

export function validateImportData(rows: any[]): ImportResult {
  const errors: ImportError[] = []
  let imported = 0
  let duplicates = 0
  const emailSet = new Set<string>()

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // +2 because index starts at 0 and we skip header

    try {
      // Check for duplicate emails in the import
      if (row.Email && emailSet.has(row.Email.toLowerCase())) {
        duplicates++
        errors.push({
          row: rowNumber,
          field: "Email",
          message: "Duplicate email in import file",
          data: row,
        })
        return
      }

      // Convert CSV row to buyer data format
      const buyerData: Partial<BuyerFormData> = {
        name: row.Name || "",
        email: row.Email || "",
        phone: row.Phone || "",
        address: row.Address || "",
        budget_min: Number.parseFloat(row["Budget Min"]) || 0,
        budget_max: Number.parseFloat(row["Budget Max"]) || 0,
        preferred_locations: row["Preferred Locations"]
          ? row["Preferred Locations"]
              .split(";")
              .map((loc: string) => loc.trim())
              .filter(Boolean)
          : [],
        property_type: row["Property Type"] || "single_family",
        bedrooms_min: row["Bedrooms Min"] ? Number.parseInt(row["Bedrooms Min"]) : undefined,
        bathrooms_min: row["Bathrooms Min"] ? Number.parseFloat(row["Bathrooms Min"]) : undefined,
        square_feet_min: row["Square Feet Min"] ? Number.parseInt(row["Square Feet Min"]) : undefined,
        square_feet_max: row["Square Feet Max"] ? Number.parseInt(row["Square Feet Max"]) : undefined,
        move_in_timeline: row["Move In Timeline"] || "3_6_months",
        financing_type: row["Financing Type"] || "conventional",
        pre_approved: row["Pre Approved"]?.toLowerCase() === "true",
        agent_notes: row["Agent Notes"] || "",
        lead_source: row["Lead Source"] || "",
        lead_quality: row["Lead Quality"] || "warm",
        last_contact_date: row["Last Contact Date"] || undefined,
        next_follow_up_date: row["Next Follow Up Date"] || undefined,
        status: row.Status || "active",
        tags: row.Tags
          ? row.Tags.split(";")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : [],
      }

      // Validate using Zod schema
      const result = buyerSchema.safeParse(buyerData)

      if (!result.success) {
        result.error.errors.forEach((error) => {
          errors.push({
            row: rowNumber,
            field: error.path.join("."),
            message: error.message,
            data: row,
          })
        })
      } else {
        if (buyerData.email) {
          emailSet.add(buyerData.email.toLowerCase())
        }
        imported++
      }
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: row,
      })
    }
  })

  return {
    success: errors.length === 0,
    imported,
    errors,
    duplicates,
  }
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function getCSVTemplate(): string {
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

  const sampleRow = [
    "John Smith",
    "john.smith@email.com",
    "(555) 123-4567",
    "123 Main St, Anytown, ST 12345",
    "300000",
    "450000",
    "Downtown; Suburbs",
    "single_family",
    "3",
    "2",
    "1500",
    "2500",
    "3_6_months",
    "conventional",
    "true",
    "Very motivated buyer",
    "Website",
    "hot",
    "2024-01-15",
    "2024-01-22",
    "active",
    "first-time-buyer; pre-approved",
  ]

  return [headers.join(","), sampleRow.join(",")].join("\n")
}
