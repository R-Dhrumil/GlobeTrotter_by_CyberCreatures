/**
 * Dynamic Hackathon Role Registry & RBAC Permissions
 * Customized for: globetrotter_BE
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const ALL_ROLES = Object.values(ROLES);

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.USER]: ['read:own_profile'],
};

export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
};
