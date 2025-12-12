export type AppRole = 'admin' | 'sales' | 'operations' | 'warehouse' | 'driver' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
}

export interface RolePermissions {
  canViewAllJobs: boolean;
  canCreateJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canViewPricing: boolean;
  canEditPricing: boolean;
  canViewCosts: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canRunOptimization: boolean;
  canAssignVehicles: boolean;
  canViewPackingVisualization: boolean;
  canMarkItemsLoaded: boolean;
  canViewRouteMap: boolean;
  canMarkDelivered: boolean;
  canUploadPOD: boolean;
  canShareWithClient: boolean;
  canDuplicateJobs: boolean;
}

export const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  admin: {
    canViewAllJobs: true,
    canCreateJobs: true,
    canEditJobs: true,
    canDeleteJobs: true,
    canViewPricing: true,
    canEditPricing: true,
    canViewCosts: true,
    canManageUsers: true,
    canExportData: true,
    canRunOptimization: true,
    canAssignVehicles: true,
    canViewPackingVisualization: true,
    canMarkItemsLoaded: true,
    canViewRouteMap: true,
    canMarkDelivered: true,
    canUploadPOD: true,
    canShareWithClient: true,
    canDuplicateJobs: true,
  },
  sales: {
    canViewAllJobs: false,
    canCreateJobs: true,
    canEditJobs: false,
    canDeleteJobs: false,
    canViewPricing: false,
    canEditPricing: false,
    canViewCosts: false,
    canManageUsers: false,
    canExportData: false,
    canRunOptimization: true,
    canAssignVehicles: false,
    canViewPackingVisualization: true,
    canMarkItemsLoaded: false,
    canViewRouteMap: true,
    canMarkDelivered: false,
    canUploadPOD: false,
    canShareWithClient: true,
    canDuplicateJobs: true,
  },
  operations: {
    canViewAllJobs: true,
    canCreateJobs: false,
    canEditJobs: true,
    canDeleteJobs: false,
    canViewPricing: false,
    canEditPricing: false,
    canViewCosts: false,
    canManageUsers: false,
    canExportData: false,
    canRunOptimization: true,
    canAssignVehicles: true,
    canViewPackingVisualization: true,
    canMarkItemsLoaded: false,
    canViewRouteMap: true,
    canMarkDelivered: false,
    canUploadPOD: false,
    canShareWithClient: false,
    canDuplicateJobs: false,
  },
  warehouse: {
    canViewAllJobs: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canViewPricing: false,
    canEditPricing: false,
    canViewCosts: false,
    canManageUsers: false,
    canExportData: false,
    canRunOptimization: false,
    canAssignVehicles: false,
    canViewPackingVisualization: true,
    canMarkItemsLoaded: true,
    canViewRouteMap: false,
    canMarkDelivered: false,
    canUploadPOD: false,
    canShareWithClient: false,
    canDuplicateJobs: false,
  },
  driver: {
    canViewAllJobs: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canViewPricing: false,
    canEditPricing: false,
    canViewCosts: false,
    canManageUsers: false,
    canExportData: false,
    canRunOptimization: false,
    canAssignVehicles: false,
    canViewPackingVisualization: false,
    canMarkItemsLoaded: false,
    canViewRouteMap: true,
    canMarkDelivered: true,
    canUploadPOD: true,
    canShareWithClient: false,
    canDuplicateJobs: false,
  },
  customer: {
    canViewAllJobs: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canViewPricing: false,
    canEditPricing: false,
    canViewCosts: false,
    canManageUsers: false,
    canExportData: false,
    canRunOptimization: false,
    canAssignVehicles: false,
    canViewPackingVisualization: true,
    canMarkItemsLoaded: false,
    canViewRouteMap: true,
    canMarkDelivered: false,
    canUploadPOD: false,
    canShareWithClient: false,
    canDuplicateJobs: false,
  },
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin / Owner',
  sales: 'Sales / Quotation',
  operations: 'Operations / Planner',
  warehouse: 'Warehouse / Loader',
  driver: 'Driver',
  customer: 'Customer / Client',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  sales: 'bg-primary text-primary-foreground',
  operations: 'bg-warning text-warning-foreground',
  warehouse: 'bg-success text-success-foreground',
  driver: 'bg-accent text-accent-foreground',
  customer: 'bg-muted text-muted-foreground',
};
