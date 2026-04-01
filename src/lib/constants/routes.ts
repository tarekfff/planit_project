export const ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
  },
  public: {
    home: '/',
    booking: (wilaya: string, slug: string) => `/${wilaya}/${slug}`,
  },
  dashboard: {
    admin: '/admin',
    manager: {
      index: '/manager',
      appointments: '/manager/appointments',
      professionals: '/manager/professionals',
    },
    professional: '/professional',
  },
} as const;
