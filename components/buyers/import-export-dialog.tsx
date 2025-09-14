"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import {
  exportBuyersToCSV,
  parseCSVFile,
  validateImportData,
  downloadCSV,
  getCSVTemplate,
  type ImportResult,
} from "@/lib/csv-utils"
import { db, type Buyer } from "@/lib/database"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface ImportExportDialogProps {
  isOpen: boolean
  onClose: () => void
  buyers: Buyer[]
  onImportComplete: () => void
}

export function ImportExportDialog({ isOpen, onClose, buyers, onImportComplete }: ImportExportDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleExport = () => {
    if (buyers.length === 0) {
      toast({
        title: "No Data to Export",
        description: "You don't have any buyers to export yet.",
        variant: "destructive",
      })
      return
    }

    const csvContent = exportBuyersToCSV(buyers)
    const timestamp = new Date().toISOString().split("T")[0]
    downloadCSV(csvContent, `buyers-export-${timestamp}.csv`)

    toast({
      title: "Export Successful",
      description: `Exported ${buyers.length} buyers to CSV file.`,
    })
  }

  const handleDownloadTemplate = () => {
    const template = getCSVTemplate()
    downloadCSV(template, "buyer-import-template.csv")

    toast({
      title: "Template Downloaded",
      description: "CSV template with sample data has been downloaded.",
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !user) return

    setIsProcessing(true)
    setImportProgress(0)

    try {
      // Read file
      const fileContent = await selectedFile.text()
      setImportProgress(25)

      // Parse CSV
      const rows = parseCSVFile(fileContent)
      setImportProgress(50)

      // Validate data
      const validationResult = validateImportData(rows)
      setImportProgress(75)

      if (validationResult.success && validationResult.imported > 0) {
        // Import valid buyers
        const validRows = rows.filter((_, index) => {
          const rowNumber = index + 2
          return !validationResult.errors.some((error) => error.row === rowNumber)
        })

        let importedCount = 0
        for (const row of validRows) {
          try {
            await db.buyers.create({
              name: row.Name,
              email: row.Email,
              phone: row.Phone,
              address: row.Address,
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
              owner_id: user.id,
            })
            importedCount++
          } catch (error) {
            // Handle individual import errors
            validationResult.errors.push({
              row: validRows.indexOf(row) + 2,
              message: `Failed to import: ${error instanceof Error ? error.message : "Unknown error"}`,
            })
          }
        }

        validationResult.imported = importedCount

        if (importedCount > 0) {
          toast({
            title: "Import Successful",
            description: `Successfully imported ${importedCount} buyers.`,
          })
        }
      }

      setImportResult(validationResult)
      setImportProgress(100)

      if (validationResult.imported > 0) {
        onImportComplete()
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        errors: [
          {
            row: 0,
            message: `File processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        duplicates: 0,
      })

      toast({
        title: "Import Failed",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetImport = () => {
    setSelectedFile(null)
    setImportResult(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import & Export Buyers</DialogTitle>
          <DialogDescription>Import buyers from CSV files or export your current buyer list</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Import Buyers from CSV</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                  />
                </div>

                {selectedFile && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processing import...</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                  </div>
                )}

                {importResult && (
                  <div className="space-y-4">
                    <Alert variant={importResult.success ? "default" : "destructive"}>
                      {importResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <AlertDescription>
                        {importResult.success
                          ? `Successfully imported ${importResult.imported} buyers`
                          : `Import completed with ${importResult.errors.length} errors`}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                        <div className="text-sm text-muted-foreground">Imported</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{importResult.duplicates}</div>
                        <div className="text-sm text-muted-foreground">Duplicates</div>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-destructive">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Import Errors</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {importResult.errors.slice(0, 10).map((error, index) => (
                              <div key={index} className="text-sm border-l-2 border-destructive pl-3">
                                <div className="font-medium">Row {error.row}</div>
                                {error.field && <div className="text-muted-foreground">Field: {error.field}</div>}
                                <div className="text-destructive">{error.message}</div>
                              </div>
                            ))}
                            {importResult.errors.length > 10 && (
                              <div className="text-sm text-muted-foreground">
                                ... and {importResult.errors.length - 10} more errors
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Template</span>
                  </Button>

                  <div className="space-x-2">
                    {importResult && (
                      <Button variant="outline" onClick={resetImport}>
                        Import Another File
                      </Button>
                    )}
                    <Button
                      onClick={handleImport}
                      disabled={!selectedFile || isProcessing}
                      className="flex items-center space-x-2"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Import Buyers</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Export Buyers to CSV</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Current Buyer Count</div>
                    <div className="text-2xl font-bold">{buyers.length}</div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    Ready to Export
                  </Badge>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    The export will include all buyer information including contact details, preferences, budget, and
                    lead management data.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleExport}
                  disabled={buyers.length === 0}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export All Buyers</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ImportExportDialog
