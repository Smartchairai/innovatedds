import React, { useState, useEffect } from 'react';
import { Search, User, LogOut, Globe, Mail, Phone, MapPin, Star, Filter, ChevronRight, Eye, EyeOff, Lock } from 'lucide-react';
import { fetchProducts, getCategories } from './services/airtableService';

// AWS Amplify v6 imports
import { Amplify } from 'aws-amplify';
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser, resendSignUpCode } from 'aws-amplify/auth';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

// Configure Amplify with NEW app client (no secret)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_OWGJIHWbR',
      userPoolClientId: 't6344gqqauaaa9vc2jv1bi537',
      loginWith: {
        email: true,
        username: false,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
    },
  },
});

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Helper function to format product names with proper spacing
const formatProductName = (name) => {
  if (!name) return '';
  
  // Debug log
  console.log('formatProductName input:', name);
  
  // If the name already has spaces, return it as-is
  if (name.includes(' ')) {
    console.log('Name already has spaces, returning as-is');
    return name;
  }
  
  // First, check if this might be a product name stored incorrectly
  // Common patterns where the actual name has a space but it's stored without one
  const knownProducts = {
    'DentalFloss': 'Dental Floss',
    'Trykiroku': 'Try Kiroku',  // Add this specific case
    'TryKiroku': 'Try Kiroku',  // Alternative capitalization
    // Add more known products here as needed
  };
  
  if (knownProducts[name]) {
    console.log('Found in known products:', knownProducts[name]);
    return knownProducts[name];
  }
  
  // First, handle common dental product patterns
  let formatted = name;
  
  // Add spaces before capital letters (for camelCase/PascalCase)
  // but not at the beginning of the string
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle cases where there are multiple capitals in a row (e.g., "DDSPro" -> "DDS Pro")
  formatted = formatted.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  
  // Handle numbers (e.g., "Bird2000" -> "Bird 2000")
  formatted = formatted.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  formatted = formatted.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  
  // Handle specific patterns like "Try" at the beginning
  formatted = formatted.replace(/^(Try)([A-Z])/g, '$1 $2');
  
  // Handle specific dental terms that might be concatenated
  const dentalTerms = [
    { pattern: /Dental/g, replacement: 'Dental ' },
    { pattern: /Floss/g, replacement: ' Floss' },
    { pattern: /Brush/g, replacement: ' Brush' },
    { pattern: /Paste/g, replacement: ' Paste' },
    { pattern: /Rinse/g, replacement: ' Rinse' },
    { pattern: /Guard/g, replacement: ' Guard' },
    { pattern: /Whitening/g, replacement: ' Whitening' },
    { pattern: /Orthodontic/g, replacement: ' Orthodontic' },
    { pattern: /Implant/g, replacement: ' Implant' },
    { pattern: /Crown/g, replacement: ' Crown' },
    { pattern: /Bridge/g, replacement: ' Bridge' },
    { pattern: /Veneer/g, replacement: ' Veneer' },
    { pattern: /Root/g, replacement: ' Root' },
    { pattern: /Canal/g, replacement: ' Canal' },
    { pattern: /Cavity/g, replacement: ' Cavity' },
    { pattern: /Filling/g, replacement: ' Filling' },
    { pattern: /Extraction/g, replacement: ' Extraction' },
    { pattern: /Periodontal/g, replacement: ' Periodontal' },
    { pattern: /Gingivitis/g, replacement: ' Gingivitis' },
    { pattern: /Plaque/g, replacement: ' Plaque' },
    { pattern: /Tartar/g, replacement: ' Tartar' },
    { pattern: /Enamel/g, replacement: ' Enamel' },
    { pattern: /Fluoride/g, replacement: ' Fluoride' },
    { pattern: /Mouthwash/g, replacement: ' Mouthwash' },
    { pattern: /Toothpick/g, replacement: ' Toothpick' },
    { pattern: /Denture/g, replacement: ' Denture' },
    { pattern: /Retainer/g, replacement: ' Retainer' },
    { pattern: /Braces/g, replacement: ' Braces' },
    { pattern: /Aligner/g, replacement: ' Aligner' },
    { pattern: /Sealant/g, replacement: ' Sealant' },
    { pattern: /X-Ray/gi, replacement: ' X-Ray' },
    { pattern: /XRay/gi, replacement: ' X-Ray' },
    { pattern: /Ultrasonic/g, replacement: ' Ultrasonic' },
    { pattern: /Scaler/g, replacement: ' Scaler' },
    { pattern: /Polisher/g, replacement: ' Polisher' },
    { pattern: /Sterilizer/g, replacement: ' Sterilizer' },
    { pattern: /Composite/g, replacement: ' Composite' },
    { pattern: /Amalgam/g, replacement: ' Amalgam' },
    { pattern: /Anesthetic/g, replacement: ' Anesthetic' },
    { pattern: /Sedation/g, replacement: ' Sedation' },
    { pattern: /Prophylaxis/g, replacement: ' Prophylaxis' },
    { pattern: /Restoration/g, replacement: ' Restoration' },
    { pattern: /Try/g, replacement: 'Try ' },  // Add this for "Try" pattern
    { pattern: /Kiroku/g, replacement: ' Kiroku' }  // Add this specific term
  ];
  
  // Apply dental term replacements only if they're part of concatenated words
  dentalTerms.forEach(({ pattern, replacement }) => {
    // Only add space if the term is preceded by a letter (not already a space)
    formatted = formatted.replace(new RegExp('([a-zA-Z])' + pattern.source, 'g'), '$1' + replacement);
  });
  
  // Clean up any double spaces that might have been created
  formatted = formatted.replace(/\s+/g, ' ').trim();
  
  // Handle edge cases where we might have added unwanted spaces
  formatted = formatted.replace(/\s+([.,!?;:])/g, '$1'); // Remove spaces before punctuation
  formatted = formatted.replace(/^\s+|\s+$/g, ''); // Trim start and end
  
  // Special handling for common product names that should stay together
  const keepTogether = [
    { find: /Oral\s+B/gi, replace: 'Oral-B' },
    { find: /3\s+M/gi, replace: '3M' },
    { find: /Co\s+Jet/gi, replace: 'CoJet' },
    { find: /Pro\s+Phy/gi, replace: 'ProPhy' }
  ];
  
  keepTogether.forEach(({ find, replace }) => {
    formatted = formatted.replace(find, replace);
  });
  
  console.log('formatProductName output:', formatted);
  return formatted;
};

// Test the function with examples (remove these console.logs in production)
console.log('formatProductName tests:');
console.log(formatProductName('DentalFloss')); // "Dental Floss"
console.log(formatProductName('DDSPro2000')); // "DDS Pro 2000"
console.log(formatProductName('UltrasonicScaler')); // "Ultrasonic Scaler"
console.log(formatProductName('3MDentalComposite')); // "3M Dental Composite"
console.log(formatProductName('OralBToothbrush')); // "Oral-B Toothbrush"

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null); // 'cognito' or 'google'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  // Authentication states
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Airtable data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check Cognito authentication
        const currentUser = await getCurrentUser();
        console.log('Cognito user found:', currentUser);
        setIsAuthenticated(true);
        setAuthProvider('cognito');
        setUser({
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || currentUser.username,
          firstName: 'User',
          lastName: ''
        });
      } catch (error) {
        console.log('No Cognito user found');
        
        // Check Firebase authentication
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            console.log('Firebase user found:', firebaseUser);
            setIsAuthenticated(true);
            setAuthProvider('google');
            setUser({
              username: firebaseUser.displayName || firebaseUser.email,
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              photoURL: firebaseUser.photoURL
            });
          } else {
            setIsAuthenticated(false);
            setAuthProvider(null);
          }
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Load data from Airtable
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          getCategories()
        ]);
        
        // Debug: Check what's coming from Airtable
        console.log('=== PRODUCT NAME DEBUG ===');
        productsData.forEach((product, index) => {
          console.log(`Product ${index + 1}:`);
          console.log('  Raw name from Airtable:', product.name);
          console.log('  Formatted name:', formatProductName(product.name));
          console.log('  Are they different?', product.name !== formatProductName(product.name));
        });
        console.log('=========================');
        
        setProducts(productsData);
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const formattedName = formatProductName(product.name);
    const matchesSearch = formattedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google sign in successful:', user);
      setIsAuthenticated(true);
      setAuthProvider('google');
      setUser({
        username: user.displayName || user.email,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ')[1] || '',
        photoURL: user.photoURL
      });
      setShowAuthModal(false);
    } catch (error) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setAuthError('Pop-up blocked. Please allow pop-ups for this site.');
      } else {
        setAuthError('Google sign in failed. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Clean AWS Cognito Authentication (No SECRET_HASH)
  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signin') {
        console.log('Attempting sign in for:', formData.email);
        
        const result = await signIn({
          username: formData.email,
          password: formData.password,
        });
        
        console.log('Sign in result:', result);
        
        if (result.isSignedIn) {
          const currentUser = await getCurrentUser();
          setUser({
            username: currentUser.username,
            email: formData.email,
            firstName: formData.firstName || 'User',
            lastName: formData.lastName || ''
          });
          setIsAuthenticated(true);
          setAuthProvider('cognito');
          setShowAuthModal(false);
          setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
        } else {
          setAuthError('Sign in failed. Please check your credentials.');
        }
      } else {
        // Sign Up
        if (formData.password !== formData.confirmPassword) {
          setAuthError('Passwords do not match');
          return;
        }

        console.log('Attempting sign up for:', formData.email);
        
        const result = await signUp({
          username: formData.email,
          password: formData.password,
          options: {
            userAttributes: {
              email: formData.email,
              given_name: formData.firstName,
              family_name: formData.lastName,
            },
          },
        });
        
        console.log('Sign up result:', result);
        setNeedsVerification(true);
        setAuthError('✅ Account created! Check your email for verification code.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle specific Cognito errors
      if (error.name === 'NotAuthorizedException') {
        setAuthError('Invalid email or password');
      } else if (error.name === 'UserNotConfirmedException') {
        setAuthError('Please verify your email first');
        setNeedsVerification(true);
      } else if (error.name === 'UsernameExistsException') {
        setAuthError('Account already exists with this email');
      } else if (error.name === 'InvalidPasswordException') {
        setAuthError('Password must be at least 8 characters with uppercase, lowercase, and numbers');
      } else if (error.message && error.message.includes('SECRET_HASH')) {
        setAuthError('❌ Please use the new app client without secret (check console instructions)');
      } else {
        setAuthError(error.message || 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Email Verification
  const handleVerification = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      console.log('Confirming sign up for:', formData.email);
      
      await confirmSignUp({
        username: formData.email,
        confirmationCode: verificationCode,
      });
      
      setNeedsVerification(false);
      setAuthMode('signin');
      setVerificationCode('');
      setAuthError('✅ Email verified! Please sign in with your credentials.');
    } catch (error) {
      console.error('Verification error:', error);
      setAuthError(error.message || 'Verification failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    try {
      await resendSignUpCode({
        username: formData.email,
      });
      setAuthError('✅ New verification code sent! Check your email.');
    } catch (error) {
      setAuthError('Failed to resend code');
    }
  };

  // Universal Sign Out
  const handleLogout = async () => {
    try {
      if (authProvider === 'cognito') {
        await signOut();
      } else if (authProvider === 'google') {
        await firebaseSignOut(auth);
      }
      
      setIsAuthenticated(false);
      setUser(null);
      setAuthProvider(null);
      setSelectedProduct(null);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const openProductDetails = (product) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedProduct(product);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="logo">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">DDS Directory</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Professional Dental Products</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-green-50 rounded-2xl px-4 py-2 border border-green-200">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.firstName} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          ✓
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-green-700 hidden sm:block">
                      {user?.firstName || 'Verified User'}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-2xl">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-orange-50 rounded-2xl px-4 py-2 border border-orange-200">
                    <Lock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700 hidden sm:block">
                      Limited Access
                    </span>
                  </div>
                  <button onClick={() => setShowAuthModal(true)} className="btn btn-primary">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Configuration Notice */}
        {JSON.stringify(Amplify.getConfig()).includes('REPLACE_WITH_NEW_CLIENT_ID') && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="text-red-500 text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-900">Configuration Required</h3>
                <p className="text-red-700 text-sm">
                  Please create a new Cognito app client without secret and update userPoolClientId in the code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Access Level Notice */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">🔒 Protected Content</h3>
                <p className="text-orange-700 text-sm">
                  Viewing product names only. <button 
                    onClick={() => setShowAuthModal(true)} 
                    className="text-orange-600 hover:text-orange-800 underline font-medium"
                  >
                    Sign in or create account
                  </button> for full product details and contact information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="icon-container">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Products</h3>
            <p className="text-gray-600">Fetching the latest dental products from our directory...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="icon-container bg-red-100">
              <div className="text-red-500 text-4xl">⚠️</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            <div className="search-section">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Dental Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {isAuthenticated 
                    ? "🔓 Full access granted! Explore comprehensive product details and contact information."
                    : "Browse product names and categories. Create an account for complete access to details."
                  }
                </p>
              </div>
              
              <div className="search-controls">
                <div className="search-container">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products, manufacturers, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-container">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="results-count">
                <p>
                  Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                  {selectedCategory !== 'all' && (
                    <span> in <span className="font-semibold text-blue-600">{selectedCategory}</span></span>
                  )}
                </p>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.map(product => {
                // Debug log for each product
                console.log(`Rendering product: "${product.name}" -> "${formatProductName(product.name)}"`);
                
                return (
                  <div key={product.id} className={`product-card ${!isAuthenticated ? 'limited-card' : ''}`}>
                    <div className="product-image-container">
                      {/* Use logo if available, otherwise fallback to image */}
                      {product.logo ? (
                        <img 
                          src={product.logo} 
                          alt={`${formatProductName(product.name)} logo`} 
                          className="product-image object-contain p-4 bg-white"
                          onError={(e) => {
                            // Fallback to placeholder if logo fails to load
                            e.target.onerror = null;
                            e.target.src = product.image || 'https://via.placeholder.com/400x300?text=No+Logo';
                            e.target.classList.remove('object-contain', 'p-4');
                            e.target.classList.add('object-cover');
                          }}
                        />
                      ) : (
                        <img 
                          src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                          alt={formatProductName(product.name)} 
                          className="product-image object-cover" 
                        />
                      )}
                      
                      <div className="product-badge">{product.category}</div>
                      {!isAuthenticated && (
                        <div className="access-overlay">
                          <Lock className="w-6 h-6 text-white mb-2" />
                          <span className="text-white text-sm font-medium">Account Required</span>
                        </div>
                      )}
                      {isAuthenticated && product.rating && (
                        <div className="rating-badge">
                          <Star className="w-3 h-3 text-yellow-500" style={{fill: 'currentColor'}} />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="product-content">
                      {/* CRITICAL FIX: Use dangerouslySetInnerHTML to ensure spaces render */}
                      <h3 
                        className="product-title" 
                        dangerouslySetInnerHTML={{ 
                          __html: formatProductName(product.name).replace(/ /g, '&nbsp;') 
                        }}
                      />
                      <p className="product-manufacturer">{product.manufacturer}</p>
                      
                      {isAuthenticated ? (
                        <>
                          <p className="product-description">{product.basicDescription}</p>
                          <button onClick={() => openProductDetails(product)} className="view-details-btn">
                            <span>View Full Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="product-description text-gray-400">
                            Complete product information available to verified users...
                          </p>
                          <button onClick={() => setShowAuthModal(true)} className="view-details-btn bg-orange-500 hover:bg-orange-600">
                            <Lock className="w-4 h-4" />
                            <span>Sign In for Details</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <div className="icon-container">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3>No products found</h3>
                <p>We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => {
              setShowAuthModal(false);
              setNeedsVerification(false);
              setAuthError('');
              setVerificationCode('');
            }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            
            {!needsVerification ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {authMode === 'signin' ? '🔐 Secure Sign In' : '📝 Create Account'}
                  </h2>
                  <p className="text-gray-600">
                    {authMode === 'signin' 
                      ? 'Access your account securely' 
                      : 'Join to unlock full product details and contact information'
                    }
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {authError}
                  </div>
                )}

                {/* Google Sign In Button */}
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="google-signin-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {authLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                  
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (8+ chars, mixed case, numbers)"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {authMode === 'signup' && (
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  )}

                  <button 
                    onClick={handleAuth} 
                    disabled={authLoading}
                    className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {authLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {authMode === 'signin' ? 'Authenticating...' : 'Creating Account...'}
                      </div>
                    ) : (
                      authMode === 'signin' ? 'Sign In with Email' : 'Create Account'
                    )}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="text-blue-600 hover:text-blue-700 text-sm">
                    {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </>
            ) : (
              /* Email Verification Screen */
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">📧 Verify Your Email</h2>
                  <p className="text-gray-600">
                    We sent a 6-digit verification code to <strong>{formData.email}</strong>
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {authError}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                    maxLength="6"
                  />

                  <button 
                    onClick={handleVerification} 
                    disabled={authLoading || !verificationCode}
                    className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {authLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify Email'
                    )}
                  </button>

                  <div className="text-center">
                    <button 
                      onClick={resendVerificationCode}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal - Only for authenticated users */}
      {selectedProduct && isAuthenticated && (
        <div className="modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-600 hover:text-gray-900 rounded-full p-2 z-10"
            >
              ×
            </button>
            
            <div className="relative">
              {selectedProduct.logo ? (
                <div className="w-full h-64 bg-white flex items-center justify-center p-8 rounded-t-2xl">
                  <img
                    src={selectedProduct.logo}
                    alt={`${formatProductName(selectedProduct.name)} logo`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // Fallback to regular image if logo fails
                      e.target.onerror = null;
                      e.target.src = selectedProduct.image || 'https://via.placeholder.com/400x300?text=No+Logo';
                      e.target.parentElement.className = 'relative';
                      e.target.className = 'w-full h-64 object-cover rounded-t-2xl';
                    }}
                  />
                </div>
              ) : (
                <img
                  src={selectedProduct.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={formatProductName(selectedProduct.name)}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {selectedProduct.category}
                  </span>
                  {/* Also use dangerouslySetInnerHTML here for consistency */}
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-1"
                    dangerouslySetInnerHTML={{ 
                      __html: formatProductName(selectedProduct.name).replace(/ /g, '&nbsp;') 
                    }}
                  />
                  <p className="text-gray-600">{selectedProduct.manufacturer}</p>
                </div>
                {selectedProduct.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400" style={{fill: 'currentColor'}} />
                    <span className="text-gray-600">{selectedProduct.rating}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedProduct.detailedDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {selectedProduct.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <a href={selectedProduct.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          Visit Website
                        </a>
                      </div>
                    )}
                    {selectedProduct.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <a href={`mailto:${selectedProduct.email}`} className="text-gray-700 hover:text-gray-900">
                          {selectedProduct.email}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {selectedProduct.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{selectedProduct.phone}</span>
                      </div>
                    )}
                    {selectedProduct.address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                        <span className="text-gray-700">{selectedProduct.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ <strong>Verified User</strong> - You have complete access to this content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;