import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { getUserProfile, signOutUser, subscribeToAuthState } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: User) => {
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Fallback default profile
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'Owner',
          role: 'owner',
        });
      }
    } catch (e) {
      console.warn('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const reloadProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const isOwner = userProfile?.role === 'owner' || !currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isOwner,
        logout,
        reloadProfile,
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
