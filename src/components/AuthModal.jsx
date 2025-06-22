import React, { useState } from 'react';
import { signUp, signIn, confirmSignUp } from '../authservice';

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      setError('');
      if (isSignUp) {
        await signUp(email, password);
        setShowVerification(true);
      } else {
        await signIn(email, password);
        onLoginSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmSignUp(email, confirmationCode);
      setShowVerification(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">
          {showVerification ? 'Verify Email' : isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        {!showVerification ? (
          <>
            <input
              className="w-full mb-2 p-2 border rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full mb-2 p-2 border rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
              onClick={handleAuth}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <p className="text-sm mt-3 text-center">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="text-blue-500 underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </>
        ) : (
          <>
            <input
              className="w-full mb-2 p-2 border rounded"
              type="text"
              placeholder="Enter Verification Code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
            />
            <button
              className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
              onClick={handleConfirm}
            >
              Confirm
            </button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </>
        )}

        <button
          className="mt-4 text-sm text-gray-600 underline w-full text-center"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthModal;