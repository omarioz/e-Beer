import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('selectedRole');
      
      if (token && storedUser) {
        const user = JSON.parse(storedUser);
        console.log('Auth check: Found stored user with role:', user.role, 'storedRole:', storedRole);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          role: storedRole as UserRole || user.role || null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          role: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
      });
    }
  };

  const login = async (phone_number: string, password: string) => {
    try {
      const response = await apiClient.login(phone_number, password);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Get user profile to get role information
      const profileResponse = await apiClient.getProfile();
      
      const user: User = {
        id: response.data?.user_id || 'temp-id',
        email: phone_number, // Using phone_number as email for now
        name: profileResponse.data?.name || phone_number,
        role: profileResponse.data?.role || 'buyer',
        region: 'Hargeisa',
        language: 'en',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('selectedRole', user.role);
      
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        role: user.role,
      }));

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    name: string;
    role: UserRole;
    phone_number: string;
  }) => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Auto-login after successful registration
      const loginResponse = await apiClient.login(userData.username, userData.password);
      
      if (loginResponse.error) {
        throw new Error(loginResponse.error);
      }

      // Create user object with the role from registration data
      const user: User = {
        id: loginResponse.data?.user_id || 'temp-id',
        email: userData.phone_number,
        name: userData.name,
        role: userData.role, // Use the role from registration data
        region: 'Hargeisa',
        language: 'en',
        createdAt: new Date().toISOString(),
      };

      console.log('Registration successful, setting role to:', userData.role);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('selectedRole', user.role);
      
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        role: user.role,
      }));

      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const setRole = async (role: UserRole) => {
    localStorage.setItem('selectedRole', role);
    setAuthState(prev => ({
      ...prev,
      role,
    }));
  };

  const switchRole = async (newRole: UserRole) => {
    localStorage.setItem('selectedRole', newRole);
    // Force page reload to reset app state
    window.location.reload();
  };

  const logout = async () => {
    apiClient.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('selectedRole');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
    });
  };

  return {
    ...authState,
    login,
    register,
    setRole,
    switchRole,
    logout,
    checkAuthStatus,
  };
};

export const useAuthActions = () => {
  const navigate = useNavigate();

  const logout = async () => {
    apiClient.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('selectedRole');
    navigate('/auth/login', { replace: true });
  };

  const switchRole = async () => {
    localStorage.removeItem('selectedRole');
    navigate('/auth/login', { replace: true });
  };

  return { logout, switchRole };
};