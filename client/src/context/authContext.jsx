import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useContext, createContext,useState, useEffect } from "react";
import { auth } from "../lib/firebase";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  let [user, setUser] = useState(null);
  let [loading, setLoading] = useState(true);

  useEffect(()=>{
    const unsubscribe=onAuthStateChanged(auth, (user) => {
      setUser(user||null);
      setLoading(false);
    });

    return () => unsubscribe();
  },[]);

  const signup=(email,password)=>createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, setUser }}>
    {children}
    </AuthContext.Provider>
  );
  
}
export const useAuth = () => useContext(AuthContext);