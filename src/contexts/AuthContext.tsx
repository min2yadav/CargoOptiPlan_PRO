import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppRole, UserProfile, ROLE_PERMISSIONS, RolePermissions } from '@/types/auth';

interface MockUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

interface AuthContextType {
  user: MockUser | null;
  profile: UserProfile | null;
  role: AppRole | null;
  permissions: RolePermissions | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  setMockRole: (role: AppRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: Record<string, { password: string; fullName: string; role: AppRole }> = {
  'admin@demo.com': { password: 'admin123', fullName: 'Admin User', role: 'admin' },
  'driver@demo.com': { password: 'driver123', fullName: 'Driver User', role: 'driver' },
  'sales@demo.com': { password: 'sales123', fullName: 'Sales User', role: 'sales' },
  'warehouse@demo.com': { password: 'warehouse123', fullName: 'Warehouse User', role: 'warehouse' },
  'customer@demo.com': { password: 'customer123', fullName: 'Customer User', role: 'customer' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);

  const permissions = role ? ROLE_PERMISSIONS[role] : null;

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = MOCK_USERS[email.toLowerCase()];
    
    if (mockUser && mockUser.password === password) {
      const userId = `user-${Date.now()}`;
      setUser({
        id: userId,
        email: email.toLowerCase(),
        user_metadata: { full_name: mockUser.fullName },
      });
      setProfile({
        id: userId,
        email: email.toLowerCase(),
        full_name: mockUser.fullName,
        avatar_url: null,
        role: mockUser.role,
      });
      setRole(mockUser.role);
      setLoading(false);
      return { error: null };
    }
    
    // Allow any email/password for demo - default to customer role
    const userId = `user-${Date.now()}`;
    setUser({
      id: userId,
      email: email.toLowerCase(),
      user_metadata: { full_name: email.split('@')[0] },
    });
    setProfile({
      id: userId,
      email: email.toLowerCase(),
      full_name: email.split('@')[0],
      avatar_url: null,
      role: 'customer',
    });
    setRole('customer');
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions?.[permission] ?? false;
  };

  const setMockRole = (newRole: AppRole) => {
    setRole(newRole);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      permissions,
      loading,
      signIn,
      signUp,
      signOut,
      hasPermission,
      setMockRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
