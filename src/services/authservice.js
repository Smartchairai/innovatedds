// src/services/authService.js
import { Amplify } from 'aws-amplify';
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser, resendSignUpCode, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { cognitoConfig } from '../config/cognito';

// Configure Amplify
Amplify.configure(cognitoConfig);

class AuthService {
  // Sign Up
  async signUp(email, password, firstName, lastName) {
    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            given_name: firstName,
            family_name: lastName,
          },
        },
      });
      
      console.log('Sign up success:', result);
      return {
        success: true,
        user: result.user,
        userSub: result.userSub,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Sign up failed',
      };
    }
  }

  // Confirm Sign Up (email verification)
  async confirmSignUp(email, confirmationCode) {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });
      return { success: true };
    } catch (error) {
      console.error('Confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Confirmation failed',
      };
    }
  }

  // Sign In
  async signIn(email, password) {
    try {
      const result = await signIn({
        username: email,
        password: password,
      });
      
      console.log('Sign in success:', result);
      
      return {
        success: true,
        user: {
          username: result.username,
          email: result.signInDetails?.loginId || email,
          firstName: result.signInDetails?.authFlowType || 'User',
          lastName: '',
        },
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  }

  // Sign Out
  async signOut() {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  // Get Current User
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return {
        success: true,
        user: {
          username: user.username,
          email: user.signInDetails?.loginId || user.username,
          firstName: user.signInDetails?.authFlowType || 'User',
          lastName: '',
        },
      };
    } catch (error) {
      // User not authenticated
      return {
        success: false,
        error: 'User not authenticated',
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Forgot Password
  async forgotPassword(email) {
    try {
      await resetPassword({
        username: email,
      });
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send reset code',
      };
    }
  }

  // Reset Password
  async resetPassword(email, confirmationCode, newPassword) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: confirmationCode,
        newPassword: newPassword,
      });
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  // Resend confirmation code
  async resendConfirmationCode(email) {
    try {
      await resendSignUpCode({
        username: email,
      });
      return { success: true };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend confirmation code',
      };
    }
  }
}

export default new AuthService();