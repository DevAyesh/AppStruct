import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  HiLightningBolt, 
  HiDesktopComputer, 
  HiDeviceMobile, 
  HiCube,
  HiDocumentText,
  HiDownload,
  HiFolder,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiClipboardCopy,
  HiEye,
  HiEyeOff
} from 'react-icons/hi';
import API_URL from './config/api';
import { GoogleLogin } from '@react-oauth/google';

function App() {
  const [appIdea, setAppIdea] = useState('');
  const [platform, setPlatform] = useState('web');
  const [detailLevel, setDetailLevel] = useState('full'); // 'brief' or 'full'
  const [blueprint, setBlueprint] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [, setAuthToken] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAuthMode, setIsAuthMode] = useState('login'); // 'login' or 'register'
  const [resetToken, setResetToken] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle verification/reset tokens and restore session via cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    const resetTokenFromUrl = params.get('resetToken');
  
    if (verifyToken) {
      verifyEmail(verifyToken);
    }
  
    if (resetTokenFromUrl) {
      setResetToken(resetTokenFromUrl);
      setIsAuthMode('reset');
      setIsLoginModalOpen(true);
    }
  
    fetchUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAuthToken('cookie-session');
      } else {
        setAuthToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Session is stored in secure httpOnly cookie
      setAuthToken('cookie-session');
      setUser(data.user);
      setIsLoginModalOpen(false);
      setError(null);
      showToast('Welcome back!', 'success');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }
  
      setAuthToken('cookie-session');
      setUser(data.user);
      setIsLoginModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }
  
      showToast(data.message, 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email })
      });
      const data = await response.json();
      setError(null);
      setAuthSuccess(data.message || 'If an account exists, a reset link has been sent. Check your inbox.');
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const passwordStrong = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordStrong.test(loginForm.password)) {
      setError('Password must be at least 8 characters and include both letters and numbers.');
      return;
    }

    if (loginForm.password !== loginForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Password reset failed');
        return;
      }

      setError(null);
      setResetToken(null);
      window.history.replaceState({}, document.title, window.location.pathname);
      setAuthSuccess('Password reset successful! You can now sign in with your new password.');
    } catch (error) {
      setError('Password reset failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const passwordStrong = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordStrong.test(loginForm.password)) {
        setError('Password must be at least 8 characters and include both letters and numbers.');
        return;
      }

      if (loginForm.password !== loginForm.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      const username = loginForm.email.split('@')[0];
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: loginForm.email,
          password: loginForm.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      setError(null);
      setAuthSuccess(data.message || 'Account created! Please check your email to verify your account before signing in.');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (logoutError) {
      console.error('Logout request failed:', logoutError);
    }

    setAuthToken(null);
    setUser(null);
    setSavedBlueprints([]);
    setLoginForm({ email: '', password: '', confirmPassword: '' });
    setError(null);
    setAuthSuccess(null);
    setIsAuthMode('login');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const generateBlueprint = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setBlueprint(''); // Clear previous blueprint

      if (!user) {
        setIsLoginModalOpen(true);
        setIsGenerating(false);
        return;
      }

      if (!appIdea || !platform) {
        setError('Please provide both an app idea and platform');
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/generate-stream`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idea: appIdea,
          platform: platform,
          detailLevel: detailLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate blueprint');
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMarkdown = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullMarkdown += chunk;
        setBlueprint(fullMarkdown); // Update in real-time
      }

      // Save the blueprint after generation
      const saveResponse = await fetch(`${API_URL}/api/blueprints`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ideaInput: appIdea,
          platform: platform,
          generatedMarkdown: fullMarkdown,
          detailLevel: detailLevel
        })
      });

      if (!saveResponse.ok) {
        console.error('Failed to save blueprint:', await saveResponse.text());
      }

      // Refresh blueprints list
      fetchBlueprints();

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchBlueprints = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/blueprints`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch blueprints');
      }

      const data = await response.json();
      setSavedBlueprints(data);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      setError('Failed to fetch saved blueprints');
    }
  };

  // Fetch blueprints when user logs in
  useEffect(() => {
    if (user) {
      fetchBlueprints();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-16 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-accent-600'
        } text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm`}>
          {toast.type === 'error' ? (
            <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <HiCheckCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Minimal Navigation */}
      <nav className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <HiLightningBolt className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">AppStruct</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user ? (
                <>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <HiFolder className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Saved ({savedBlueprints.length})</span>
                  </button>
                  <span className="hidden md:inline text-sm text-gray-600">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white/50 rounded-full transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setIsLoginModalOpen(true); setLoginForm({ email: '', password: '', confirmPassword: '' }); setError(null); setAuthSuccess(null); setShowPassword(false); setShowConfirmPassword(false); }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white/50 rounded-full transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthMode('register');
                      setIsLoginModalOpen(true);
                      setLoginForm({ email: '', password: '', confirmPassword: '' });
                      setError(null);
                      setAuthSuccess(null);
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full transition-all shadow-md"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {!blueprint ? (
          /* Hero Section - Centered Input */
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-10 sm:pb-20 pt-6 sm:pt-0">
            <div className="max-w-4xl w-full">
              {/* Hero Heading */}
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                  Transform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">your app idea</span> into technical blueprints
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
                  Describe your vision and get AI-powered architectural blueprints in seconds
                </p>
              </div>

              {/* Error Message */}
              {error && !isLoginModalOpen && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between max-w-3xl mx-auto">
                  <div className="flex items-center space-x-2">
                    <HiExclamationCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-red-700">{error}</span>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <HiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}

              {/* Large Input Box */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <textarea
                  value={appIdea}
                  onChange={(e) => {
                    setAppIdea(e.target.value);
                    setError(null);
                  }}
                  rows={3}
                  className="block w-full border-0 focus:ring-0 text-sm sm:text-base text-gray-700 placeholder-gray-400 resize-none"
                  placeholder="e.g., A social media platform for pet lovers with photo sharing, profiles, and location-based features..."
                  disabled={isGenerating}
                />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Platform Pills */}
                    <div className="flex items-center flex-wrap gap-2">
                      {[
                        { value: 'web', icon: HiDesktopComputer, label: 'Web' },
                        { value: 'mobile', icon: HiDeviceMobile, label: 'Mobile' },
                        { value: 'both', icon: HiCube, label: 'Both' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPlatform(option.value)}
                          className={`inline-flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                            platform === option.value
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          disabled={isGenerating}
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Detail Level Pills */}
                    <div className="flex items-center flex-wrap gap-2 sm:pl-4 sm:border-l sm:border-gray-200">
                      {[
                        { value: 'brief', icon: HiLightningBolt, label: 'Quick' },
                        { value: 'full', icon: HiDocumentText, label: 'Detailed' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDetailLevel(option.value)}
                          className={`inline-flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                            detailLevel === option.value
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          disabled={isGenerating}
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateBlueprint}
                    className={`inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg ${
                      isGenerating || !appIdea.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                    }`}
                    disabled={isGenerating || !appIdea.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <HiLightningBolt className="w-5 h-5" />
                        <span>Generate Blueprint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Start Suggestions */}
              <div className="text-center px-2">
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Quick start with these ideas:</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    'E-commerce store',
                    'Social media app',
                    'Task manager',
                    'Booking platform',
                    'Food delivery app'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAppIdea(suggestion)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 hover:bg-white text-gray-700 text-xs sm:text-sm font-medium rounded-full border border-gray-200 hover:border-purple-300 transition-all"
                      disabled={isGenerating}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 sm:mt-6">
                  AI can make mistakes. Always double-check the results.
                </p>
              </div>
            </div>
          </div>
        ) : (

          /* Blueprint Output View */
          <div className="flex-1 bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
            {/* Header with Actions */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setBlueprint('')}
                  className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">New Blueprint</span>
                  <span className="sm:hidden">New</span>
                </button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Blueprint</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(blueprint);
                    showToast('Copied to clipboard!', 'success');
                  }}
                  className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <HiClipboardCopy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([blueprint], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'app-blueprint.md';
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Blueprint downloaded!', 'success');
                  }}
                  className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full transition-all shadow-md"
                >
                  <HiDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            {/* Blueprint Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 prose prose-sm sm:prose-base md:prose-lg max-w-none">
                  <ReactMarkdown>{blueprint}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Saved Blueprints */}
      {user && savedBlueprints.length > 0 && isSidebarOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          <div className="fixed right-0 top-14 sm:top-16 bottom-0 w-full sm:w-96 bg-white/90 backdrop-blur-md border-l border-gray-200 shadow-2xl transition-all duration-300 z-40 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <HiFolder className="w-5 h-5 text-purple-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Saved Blueprints</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {savedBlueprints.length}
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {savedBlueprints.map((savedBlueprint) => (
                <div
                  key={savedBlueprint._id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                    {savedBlueprint.ideaInput}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {savedBlueprint.platform}
                    </span>
                    <span className="hidden sm:inline">{new Date(savedBlueprint.createdAt).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(savedBlueprint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setAppIdea(savedBlueprint.ideaInput);
                        setPlatform(savedBlueprint.platform);
                        setBlueprint(savedBlueprint.generatedMarkdown);
                        setIsSidebarOpen(false);
                        showToast('Blueprint loaded!', 'success');
                      }}
                      className="flex-1 text-xs sm:text-sm py-2 px-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all font-medium"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([savedBlueprint.generatedMarkdown], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `blueprint-${savedBlueprint._id}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast('Blueprint downloaded!', 'success');
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <HiDownload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Login/Register Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isAuthMode === 'login' ? 'Welcome back' : 'Get started'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {isAuthMode === 'login' ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setError(null);
                  setAuthSuccess(null);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setLoginForm({ email: '', password: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex space-x-2 mb-4 sm:mb-6 p-1 bg-gray-100 rounded-xl sm:rounded-2xl">
              <button
                onClick={() => { setIsAuthMode('login'); setError(null); setAuthSuccess(null); setShowPassword(false); setShowConfirmPassword(false); setLoginForm(f => ({ ...f, password: '', confirmPassword: '' })); }}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isAuthMode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsAuthMode('register'); setError(null); setAuthSuccess(null); setShowPassword(false); setShowConfirmPassword(false); setLoginForm(f => ({ ...f, password: '', confirmPassword: '' })); }}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isAuthMode === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authSuccess ? (
              <div className="py-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isAuthMode === 'reset' ? 'Password Updated!' : 'Check your email'}
                </h3>
                <p className="text-sm text-gray-600">{authSuccess}</p>
                <button
                  type="button"
                  onClick={() => { setAuthSuccess(null); setIsAuthMode('login'); setLoginForm({ email: '', password: '', confirmPassword: '' }); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg text-sm"
                >
                  Go to Sign In
                </button>
              </div>
            ) : (
            <>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HiExclamationCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            )}

            <form
                onSubmit={
                  isAuthMode === 'login'
                    ? handleLogin
                    : isAuthMode === 'register'
                    ? handleRegister
                    : isAuthMode === 'forgot'
                    ? handleForgotPassword
                    : handleResetPassword
                }
                className="space-y-4"
              >
              {isAuthMode !== 'reset' && (
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="block w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              )}
              {isAuthMode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    {isAuthMode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="block w-full px-4 py-2.5 sm:py-3 pr-11 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {(isAuthMode === 'reset' || isAuthMode === 'register') && (
                    <p className="mt-1 text-xs text-gray-400">Min 8 characters, include letters and numbers</p>
                  )}
                </div>
              )}

              {(isAuthMode === 'reset' || isAuthMode === 'register') && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={loginForm.confirmPassword}
                      onChange={(e) => setLoginForm({ ...loginForm, confirmPassword: e.target.value })}
                      className="block w-full px-4 py-2.5 sm:py-3 pr-11 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isAuthMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsAuthMode('forgot')}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Forgot password?
                  </button>
                )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
              >
                {isAuthMode === 'login'
                  ? 'Sign in'
                  : isAuthMode === 'register'
                  ? 'Create account'
                  : isAuthMode === 'forgot'
                  ? 'Send reset link'
                  : 'Reset password'}
              </button>
            </form>
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert('Google sign-in failed')}
              />
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
