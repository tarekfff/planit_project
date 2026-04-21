import { Button } from "@/components/ui/button"
import { AppointmentsTable } from "@/components/features/dashboard/AppointmentsTable"
import { Calendar, Clock, LayoutDashboard, Plus } from "lucide-react"
import { getProfessionalDashboardData } from "@/modules/appointments/queries"

export default async function ProfessionalDashboardPage() {
  const { metrics, appointments } = await getProfessionalDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Tableau de Bord
          </h1>
        </div>
        <Button className="font-semibold shadow-sm hover:shadow-md transition-all gap-2 bg-primary">
          <Plus className="w-4 h-4" />
          Créer un RDV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{metrics.rdvToday}</div>
            <div className="text-sm font-medium text-gray-500">RDV Aujourd'hui</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{metrics.rdvWeek}</div>
            <div className="text-sm font-medium text-gray-500">RDV Cette semaine</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{metrics.activeServices}</div>
            <div className="text-sm font-medium text-gray-500">services actifs</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <AppointmentsTable 
          title="Planning du jour" 
          appointments={appointments} 
        />
        
        {/* Bottom Actions */}
        <div className="flex justify-end">
            <Button className="font-semibold shadow-sm hover:shadow-md transition-all gap-2 bg-primary">
              <Plus className="w-4 h-4" />
              Créer un RDV
            </Button>
        </div>
      </div>
    </div>
  )
}
