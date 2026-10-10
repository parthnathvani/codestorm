import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  usersList: User[];
  loading: boolean;
  role: UserRole;
  switchUser: (userId: string) => Promise<void>;
  createAccount: (userData: Partial<User>) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadInitialUser = async () => {
    try {
      setLoading(true);
      const [currentUser, allUsers] = await Promise.all([
        api.getCurrentUser(),
        api.getAllUsers()
      ]);
      setUser(currentUser);
      setUsersList(allUsers);
    } catch (err: any) {
      console.error('Failed to load user', err);
      addToast('error', 'Authentication Sync Issue', 'Using cached identity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialUser();
  }, []);

  const switchUser = async (userId: string) => {
    try {
      const switched = await api.switchUser(userId);
      setUser(switched);
      addToast('info', `Switched identity to ${switched.name}`, `Role: ${switched.role.toUpperCase()}`);
    } catch (err: any) {
      addToast('error', 'Switch failed', err.message);
    }
  };

  const createAccount = async (userData: Partial<User>) => {
    try {
      const created = await api.createUser(userData);
      setUser(created);
      await refreshUsers();
      addToast('success', `Welcome, ${created.name}!`, `Account created with ${created.role.toUpperCase()} privileges.`);
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message);
      throw err;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setUsersList((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (user?.id === userId) {
        setUser(updated);
      }
      addToast('success', 'User Role Updated', `${updated.name} is now ${newRole}.`);
    } catch (err: any) {
      addToast('error', 'Role update failed', err.message);
    }
  };

  const refreshUsers = async () => {
    try {
      const all = await api.getAllUsers();
      setUsersList(all);
    } catch {
      // ignore
    }
  };

  const role = user?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        loading,
        role,
        switchUser,
        createAccount,
        updateUserRole,
        toasts,
        addToast,
        removeToast,
        refreshUsers
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
