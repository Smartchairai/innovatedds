import React, { useState, useEffect } from 'react';
import { Search, User, LogOut, Globe, Mail, Phone, MapPin, Star, Filter, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { fetchProducts, getCategories } from './services/airtableService';
import authService from './services/authService';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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
  
  // New state for Airtable data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for authentication
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser.success) {
          setIsAuthenticated(true);
          setUser(currentUser.user);
        }
      } catch (error) {
        console.log('User not authenticated');
      }
    };

    checkAuthStatus();
  }, []);

  // Load data from Airtable on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading products and categories from Airtable...');
        
        // Load products and categories
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          getCategories()
        ]);
        
        console.log('Loaded products:', productsData.length);
        console.log('Loaded categories:', categoriesData);
        
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
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signin') {
        // Sign In
        const result = await authService.signIn(formData.email, formData.password);
        
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
          setShowAuthModal(false);
          setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
        } else {
          setAuthError(result.error);
        }
      } else {
        // Sign Up
        if (formData.password !== formData.confirmPassword) {
          setAuthError('Passwords do not match');
          return;
        }

        const result = await authService.signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
        
        if (result.success) {
          setNeedsVerification(true);
          setAuthError('');
        } else {
          setAuthError(result.error);
        }
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerification = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const result = await authService.confirmSignUp(formData.email, verificationCode);
      
      if (result.success) {
        setNeedsVerification(false);
        setAuthMode('signin');
        setVerificationCode('');
        setAuthError('Account verified! Please sign in.');
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError('Verification failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    try {
      const result = await authService.resendConfirmationCode(formData.email);
      if (result.success) {
        setAuthError('Verification code sent! Check your email.');
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError('Failed to resend code.');
    }
  };

  const handleGoogleSignIn = () => {
    setUser({ firstName: 'Google', lastName: 'User', email: 'user@gmail.com' });
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
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
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.firstName}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-2xl">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="btn btn-primary">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            <div className="search-section">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Dental Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Discover high-quality dental equipment, materials, and instruments from trusted manufacturers worldwide.</p>
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
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-badge">{product.category}</div>
                    <div className="rating-badge">
                      <Star className="w-3 h-3 text-yellow-500" style={{fill: 'currentColor'}} />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                  
                  <div className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-manufacturer">{product.manufacturer}</p>
                    <p className="product-description">{product.basicDescription}</p>
                    
                    <button onClick={() => openProductDetails(product)} className="view-details-btn">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600">
                    {authMode === 'signin' 
                      ? 'Access detailed product information' 
                      : 'Join to view detailed product information'
                    }
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {authError}
                  </div>
                )}

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
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
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
                        {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                      </div>
                    ) : (
                      authMode === 'signin' ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button onClick={handleGoogleSignIn} className="mt-4 w-full flex items-center justify-center space-x-2 border border-gray-300 bg-white py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-gray-600">
                    We've sent a verification code to <strong>{formData.email}</strong>
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
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-600 hover:text-gray-900 rounded-full p-2 z-10"
            >
              ×
            </button>
            
            <div className="relative">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProduct.name}</h2>
                  <p className="text-gray-600">{selectedProduct.manufacturer}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400" style={{fill: 'currentColor'}} />
                  <span className="text-gray-600">{selectedProduct.rating}</span>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;