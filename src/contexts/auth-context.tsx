
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserJson = localStorage.getItem('rippleChatUser');
    if (storedUserJson) {
      try {
        const storedUser = JSON.parse(storedUserJson) as User;
        // Validate if storedUser is still a recognizable user from mockUsers
        const isValidMockUser = mockUsers.some(u => u.id === storedUser.id && u.email === storedUser.email);
        if (isValidMockUser) {
          setUser(storedUser);
        } else {
          // Stored user is outdated or invalid, clear it
          localStorage.removeItem('rippleChatUser');
          setUser(null); // Treat as logged out
        }
      } catch (error) {
        // Problem parsing stored user, clear it
        localStorage.removeItem('rippleChatUser');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _:string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('rippleChatUser', JSON.stringify(foundUser));
      setLoading(false);
    } else {
      setLoading(false);
      throw new Error("User not found or invalid credentials. Please sign up or try a different email.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rippleChatUser');
    // Optionally, also clear guest ID if you want a full reset for the next guest
    // localStorage.removeItem('rippleChatGuestId'); 
  };

  const signup = async (name: string, email: string, _:string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatarUrl: `https://placehold.co/100x100.png?text=${name.substring(0,1)}`,
      status: 'online',
    };
    setUser(newUser);
    localStorage.setItem('rippleChatUser', JSON.stringify(newUser));
    // Note: This new user is not added to the persistent mockUsers array,
    // so they effectively exist only in localStorage for this session/browser.
    // For a real app, signup would add them to a database.
    setLoading(false);
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
