"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>; // Keep simple, actual validation not implemented
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth status from localStorage or a cookie
    const storedUser = localStorage.getItem('rippleChatUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _:string) => {
    // Mock login: find user by email from mock data, ignore password
    // In a real app, this would be an API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('rippleChatUser', JSON.stringify(foundUser));
    } else {
      // For simplicity, if not found, log in as the first mock user
      // Or handle error: throw new Error("User not found or invalid credentials");
      setUser(mockUsers[0]);
      localStorage.setItem('rippleChatUser', JSON.stringify(mockUsers[0]));
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rippleChatUser');
  };

  const signup = async (name: string, email: string, _:string) => {
    // Mock signup: create a new user and log them in
    // In a real app, this would be an API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatarUrl: `https://placehold.co/100x100.png?text=${name.substring(0,1)}`,
      status: 'online',
    };
    // In a real app, you'd probably add this to your backend.
    // For mock, we just set this new user.
    setUser(newUser);
    localStorage.setItem('rippleChatUser', JSON.stringify(newUser));
    // mockUsers.push(newUser); // Not persistent, but for demo
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
