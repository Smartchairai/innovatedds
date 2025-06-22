// src/components/AuthWrapper.jsx
import { useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function AuthWrapper({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider).catch(console.error);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute top-4 right-4">
        <button onClick={handleLogout} className="text-sm bg-gray-200 px-3 py-1 rounded">
          Logout ({user.displayName})
        </button>
      </div>
      {children}
    </div>
  );
}