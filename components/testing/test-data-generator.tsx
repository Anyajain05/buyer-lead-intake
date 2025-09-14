"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { createTestBuyer, createMultipleTestBuyers, generateCSVTestData, validateBuyerData } from "@/lib/test-utils"
import { db } from "@/lib/database"
import { useAuth } from "@/components/auth/auth-provider"
import { TestTube, Download, Plus, Check, X, Loader2 } from "lucide-react"

interface TestDataGeneratorProps {
  onDataGenerated?: () => void
}

export function TestDataGenerator({ onDataGenerated }: TestDataGeneratorProps) {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCount, setGeneratedCount] = useState(5)
  const [testResults, setTestResults] = useState<any[]>([])
  const [customBuyerData, setCustomBuyerData] = useState("")

  const generateTestBuyers = async () => {
    if (!user) return

    setIsGenerating(true)
    setTestResults([])

    try {
      const testBuyers = createMultipleTestBuyers(generatedCount)
      const results = []

      for (const testBuyer of testBuyers) {
        try {
          const buyer = await db.buyers.create({
            ...testBuyer,
            owner_id: user.id,
          })
          results.push({ success: true, buyer: buyer.name, id: buyer.id })
        } catch (error) {
          results.push({
            success: false,
            buyer: testBuyer.name,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      setTestResults(results)
      onDataGenerated?.()
    } catch (error) {
      setTestResults([
        {
          success: false,
          buyer: "Generation",
          error: error instanceof Error ? error.message : "Failed to generate test data",
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadTestCSV = () => {
    const csvData = generateCSVTestData(generatedCount)
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `test-buyers-${generatedCount}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const validateCustomData = () => {
    try {
      const buyerData = JSON.parse(customBuyerData)
      const validation = validateBuyerData(buyerData)

      setTestResults([
        {
          success: validation.isValid,
          buyer: buyerData.name || "Custom Buyer",
          validation: validation,
        },
      ])
    } catch (error) {
      setTestResults([
        {
          success: false,
          buyer: "Custom Buyer",
          error: "Invalid JSON format",
        },
      ])
    }
  }

  const sampleBuyerJSON = JSON.stringify(createTestBuyer(), null, 2)

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>Test Data Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate Test Buyers */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Test Buyers</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={generatedCount}
                onChange={(e) => setGeneratedCount(Number.parseInt(e.target.value) || 5)}
                className="w-32"
              />
            </div>
            <div className="flex space-x-2 pt-6">
              <Button
                onClick={generateTestBuyers}
                disabled={isGenerating || !user}
                className="flex items-center space-x-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Generate Buyers</span>
              </Button>
              <Button
                variant="outline"
                onClick={downloadTestCSV}
                className="flex items-center space-x-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Generation Results:</h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{result.buyer}</span>
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <Badge variant="default" className="flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Success</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <X className="w-3 h-3" />
                          <span>Failed</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Data Validation */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Custom Data Validation</h3>
          <div className="space-y-2">
            <Label htmlFor="custom-data">Buyer JSON Data</Label>
            <Textarea
              id="custom-data"
              value={customBuyerData}
              onChange={(e) => setCustomBuyerData(e.target.value)}
              placeholder={sampleBuyerJSON}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={validateCustomData}
            disabled={!customBuyerData.trim()}
            variant="outline"
            className="bg-transparent"
          >
            Validate Data
          </Button>

          {testResults.length > 0 && testResults[0].validation && (
            <Alert variant={testResults[0].success ? "default" : "destructive"}>
              <AlertDescription>
                {testResults[0].success ? (
                  "✅ Data is valid and ready for import"
                ) : (
                  <div>
                    <div className="font-medium mb-2">❌ Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {testResults[0].validation.errors.map((error: string, index: number) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="space-y-2 border-t pt-6">
          <h3 className="text-lg font-medium">Usage Instructions</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              • <strong>Generate Buyers:</strong> Creates test buyers directly in the database
            </p>
            <p>
              • <strong>Download CSV:</strong> Downloads a CSV file with test data for import testing
            </p>
            <p>
              • <strong>Custom Validation:</strong> Test your own buyer data format before importing
            </p>
            <p>
              • <strong>Rate Limiting:</strong> Test data generation respects rate limits (max 100 requests per 15
              minutes)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
