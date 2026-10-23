import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/crm';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (module: string, action?: 'view' | 'create' | 'edit' | 'delete' | 'export') => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    StorageService.init();
    const storedUsers = StorageService.getUsers();
    setUsers(storedUsers);

    // Default to the first admin user for instant testing convenience
    const savedUserId = localStorage.getItem('kypas_crm_active_user_id');
    if (savedUserId) {
      const found = storedUsers.find(u => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        return;
      }
    }
    // Fallback to Administrator
    const defaultAdmin = storedUsers.find(u => u.role === 'Administrator') || storedUsers[0];
    setCurrentUser(defaultAdmin);
  }, []);

  const login = (email: string, forcedRole?: UserRole): boolean => {
    const freshUsers = StorageService.getUsers();
    let user = freshUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user && forcedRole) {
      user = freshUsers.find(u => u.role === forcedRole);
    }

    if (user && user.isActive) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      setCurrentUser(updatedUser);
      localStorage.setItem('kypas_crm_active_user_id', user.id);
      
      StorageService.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN',
        module: 'Users',
        recordId: user.id,
        recordIdentifier: user.email,
        details: `User ${user.name} logged into KYPAS Solar CRM Pro with role ${user.role}.`,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      StorageService.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'LOGIN',
        module: 'Users',
        recordId: currentUser.id,
        recordIdentifier: currentUser.email,
        details: `User ${currentUser.name} logged out.`,
      });
    }
    setCurrentUser(null);
    localStorage.removeItem('kypas_crm_active_user_id');
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = users.find(u => u.role === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('kypas_crm_active_user_id', targetUser.id);
      StorageService.addAuditLog({
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: targetUser.role,
        action: 'STATUS_CHANGE',
        module: 'Users',
        recordId: targetUser.id,
        recordIdentifier: targetUser.email,
        details: `Active session switched to ${newRole} (${targetUser.name}).`,
      });
    }
  };

  // Enforce role-based module permissions
  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' = 'view'): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;

    // Administrator has full privileges across all modules
    if (role === 'Administrator') return true;

    // Deletion is strictly reserved for Administrator and Managers in their own domains
    if (action === 'delete') {
      if (role === 'Sales Manager' && ['Leads', 'Quotations'].includes(module)) return true;
      if (role === 'Service Manager' && ['Services', 'AMC', 'Installations'].includes(module)) return true;
      return false;
    }

    switch (role) {
      case 'Sales Manager':
        return ['Dashboard', 'Leads', 'Customers', 'Quotations', 'Maintenance Calendar', 'Reports & Analytics', 'Activity History'].includes(module);

      case 'Sales Executive':
        if (module === 'Reports & Analytics' && action !== 'view') return false;
        return ['Dashboard', 'Leads', 'Customers', 'Quotations', 'Maintenance Calendar'].includes(module);

      case 'Loan Processing Executive':
        return ['Dashboard', 'Bank Loan Tracking', 'Customers', 'Maintenance Calendar', 'Reports & Analytics'].includes(module);

      case 'Service Manager':
        return ['Dashboard', 'Customers', 'Installation Management', 'Service Management', 'AMC Management', 'Maintenance Calendar', 'Reports & Analytics', 'Activity History'].includes(module);

      case 'Service Technician':
        if (action === 'export') return false;
        return ['Dashboard', 'Installation Management', 'Service Management', 'AMC Management', 'Maintenance Calendar'].includes(module);

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchRole,
        hasPermission,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
