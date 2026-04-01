export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-24">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login to Planit</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials below to access your account</p>
        </div>
        {/* TODO: Add Login Form Component */}
      </div>
    </div>
  );
}
