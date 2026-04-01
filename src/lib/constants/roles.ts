// Role definitions based on database profile roles
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  PROFESSIONAL: 'PROFESSIONAL',
  CLIENT: 'CLIENT',
} as const;

export type Role = keyof typeof ROLES;

// Define which routes each role is allowed to access
export const ROLE_ROUTE_MAP: Record<Role, string[]> = {
  ADMIN: ['/admin', '/manager', '/professional'],
  MANAGER: ['/manager', '/manager/appointments', '/manager/professionals'],
  PROFESSIONAL: ['/professional'],
  CLIENT: ['/'], // Base dashboard if any
};
