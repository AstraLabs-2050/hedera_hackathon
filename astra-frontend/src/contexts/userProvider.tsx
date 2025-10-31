"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  walletAddress?: string;
  brandName?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  identityVerified?: boolean;
  profileCompleted?: boolean;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// custom hook for easy usage
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
