import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApiKeysTab } from "@/components/dashboard/api-keys-tab"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-balance">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-balance">Manage your API keys and access credentials</p>
        </div>
        <ApiKeysTab />
      </div>
    </DashboardLayout>
  )
}
