// src/services/authService.js
import { Amplify, Auth } from 'aws-amplify';
import { cognitoConfig } from '../config/cognito';

// Configure Amplify
Amplify.configure(cognitoConfig);

class AuthService {
  // Sign Up
  async signUp(email, password, firstName, lastName) {
    try {
      const result = await Auth.signUp({
        username: email,
        password: password,
        attributes: {
          email: email,
          given_name: firstName,
          family_name: lastName,
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
      await Auth.confirmSignUp(email, confirmationCode);
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
      const user = await Auth.signIn(email, password);
      console.log('Sign in success:', user);
      
      return {
        success: true,
        user: {
          username: user.username,
          email: user.attributes.email,
          firstName: user.attributes.given_name,
          lastName: user.attributes.family_name,
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
      await Auth.signOut();
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
      const user = await Auth.currentAuthenticatedUser();
      return {
        success: true,
        user: {
          username: user.username,
          email: user.attributes.email,
          firstName: user.attributes.given_name,
          lastName: user.attributes.family_name,
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
      await Auth.currentAuthenticatedUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Forgot Password
  async forgotPassword(email) {
    try {
      await Auth.forgotPassword(email);
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
      await Auth.forgotPasswordSubmit(email, confirmationCode, newPassword);
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
      await Auth.resendSignUp(email);
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