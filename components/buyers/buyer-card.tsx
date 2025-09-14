import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Buyer } from "@/lib/database"
import { Mail, Phone, MapPin, DollarSign, Calendar, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface BuyerCardProps {
  buyer: Buyer
}

export function BuyerCard({ buyer }: BuyerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "closed_won":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "closed_lost":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "hot":
        return "bg-red-100 text-red-800 border-red-200"
      case "warm":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-balance">{buyer.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(buyer.status)}>{buyer.status.replace("_", " ")}</Badge>
              <Badge className={getQualityColor(buyer.lead_quality)}>{buyer.lead_quality}</Badge>
            </div>
          </div>
          <div className="flex space-x-1">
            <Link href={`/buyers/${buyer.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/buyers/${buyer.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{buyer.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{buyer.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{buyer.preferred_locations.join(", ")}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>
              {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {buyer.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {buyer.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{buyer.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Added {formatDistanceToNow(new Date(buyer.created_at), { addSuffix: true })}</span>
          </div>
          <span className="capitalize">{buyer.property_type.replace("_", " ")}</span>
        </div>
      </CardContent>
    </Card>
  )
}
