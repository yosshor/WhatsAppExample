import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode
} from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

import { auth } from '../config/firebase'; // path to your Firebase setup
import { User } from '@/models/user/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  auth: Auth | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const API_URL = 'http://localhost:3000/api';

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/user`, {
          method: 'GET',
          credentials: 'include',
        });
        const authData = await response.json();
        return authData.auth;
      } catch (error) {
        console.error('Error fetching auth:', error);
        return null;
      }
    };

    const initializeAuth = async () => {
      try {
        const authInstance = await getAuthUser();
        setAuth(authInstance);

        if (authInstance) {
          const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
              const userObj: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                profileImage: firebaseUser.photoURL || '',
                status: 'online',
                lastSeen: new Date()
              };
              setUser(userObj);
            } else {
              setUser(null);
            }
            setLoading(false);
          });

          return unsubscribe;
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    auth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};




// import React, { createContext, useState, useContext, useEffect } from 'react';
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   User as FirebaseUser,
//   Auth
// } from 'firebase/auth';
// import { User } from '../models/user/user';

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   auth: Auth | null;
// }

// // const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// // export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = (): AuthContextType => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [auth, setAuth] = useState<Auth | null>(null);
//   const API_URL = 'http://localhost:3000/api';


//   useEffect(() => {
//     const getAuthUSer = async () => {
//       const auth = await fetch(`${API_URL}/auth/user`, {
//         method: 'GET',
//         credentials: 'include',
//       });
//       const authData = await auth.json();
//       setAuth(authData.auth);
//     }
//     getAuthUSer();
//     if (!auth) return;  

//     const unsubscribe = onAuthStateChanged(auth as Auth, (firebaseUser: FirebaseUser | null) => {
//       if (firebaseUser) {
//         // Convert Firebase user to your User type
//         const userObj: User = {
//           id: firebaseUser.uid,
//           email: firebaseUser.email || '',
//           name: firebaseUser.displayName || '',
//           profileImage: firebaseUser.photoURL || '',
//           status: 'online',
//           lastSeen: new Date()
//         };
//         console.log('userObj', userObj);
//         setUser(userObj);
//       } else {
//         setUser(null);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const signIn = async (email: string, password: string) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
//       // Additional user data fetching if needed
//     } catch (error) {
//       console.error('Sign in error:', error);
//       throw error;
//     }
//   };

//   const signUp = async (email: string, password: string) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);
//       // Additional user setup if needed
//     } catch (error) {
//       console.error('Sign up error:', error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await signOut(auth as Auth);
//     } catch (error) {
//       console.error('Logout error:', error);
//       throw error;
//     }
//   };

//   return {
//     user,
//     loading,
//     signIn,
//     signUp,
//     logout,
//     auth
//   };

// }; 