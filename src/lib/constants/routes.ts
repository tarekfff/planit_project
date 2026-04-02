export const ROUTES = {
  auth: {
    login:    '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
  },
  dashboard: {
    root:         '/dashboard',
    admin:        '/dashboard/admin',
    manager:      '/dashboard/manager',
    professional: '/dashboard/professional',
    appointments: '/dashboard/manager/appointments',
    professionals:'/dashboard/manager/professionals',
  },
  public: {
    home:              '/',
    establishment: (wilaya: string, slug: string) => `/${wilaya}/${slug}`,
  },
} as const
