import { Button } from "@/components/ui/button"
import { logout } from "@/modules/auth/actions"
import { createClient } from "@/lib/supabase/server"

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>No active session found.</div>
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold text-destructive">Database Profile Missing</h1>
        <p className="text-muted-foreground">Your authenticated account exists, but your database profile failed to generate.</p>
        <div className="w-full bg-red-500/10 p-4 rounded text-left border border-red-500/20 text-sm overflow-x-auto text-red-500">
          <p className="font-bold mb-2">Debug Error Log:</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
          <p className="mt-4 font-bold text-foreground">User ID:</p>
          <pre className="text-foreground">{user.id}</pre>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">Log Out</Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          Welcome back, {profile.full_name}!
        </h1>
        <p className="text-muted-foreground text-lg">
          You are securely logged in as a Client.
        </p>
      </div>

      <div className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border shadow-sm max-w-md w-full border-primary/10">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Client Account Details
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="text-muted-foreground font-medium">Role</span>
            <span className="col-span-2 uppercase font-bold text-primary tracking-wider">{profile.role}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <span className="text-muted-foreground font-medium">System ID</span>
            <span className="col-span-2 font-mono text-xs truncate" title={profile.id}>{profile.id}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground font-medium">Member Since</span>
            <span className="col-span-2">{new Date(profile.created_at || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <form action={logout}>
        <Button type="submit" variant="destructive" size="lg" className="px-10 h-12 shadow-sm hover:shadow-md transition-all font-semibold tracking-wide">
          Log Out
        </Button>
      </form>
    </div>
  )
}
