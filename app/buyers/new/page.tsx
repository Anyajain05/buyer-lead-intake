import { BuyerForm } from "@/components/buyers/buyer-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function NewBuyerPage() {
  return (
    <ProtectedRoute>
      <BuyerForm mode="create" />
    </ProtectedRoute>
  )
}
