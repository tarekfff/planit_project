import { Button } from "@/components/ui/button"
import { logout } from "@/modules/auth/actions"

export default function ProfessionalDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          Professional Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your schedule and assigned appointments securely.
        </p>
      </div>
      
      <form action={logout}>
        <Button type="submit" variant="destructive" size="lg" className="px-10 h-12 shadow-sm hover:shadow-md transition-all font-semibold tracking-wide">
          Log Out
        </Button>
      </form>
    </div>
  )
}
