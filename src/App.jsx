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
  HiClipboardCopy
} from 'react-icons/hi';
import API_URL from './config/api';

function App() {
  const [appIdea, setAppIdea] = useState('');
  const [platform, setPlatform] = useState('web');
  const [detailLevel, setDetailLevel] = useState('full'); // 'brief' or 'full'
  const [blueprint, setBlueprint] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [toast, setToast] = useState(null);
  const [isAuthMode, setIsAuthMode] = useState('login'); // 'login' or 'register'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load token from localStorage on startup
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem('authToken');
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
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user data
      localStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
      setUser(data.user);
      setIsLoginModalOpen(false);
      setError(null);
      showToast('Welcome back!', 'success');
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const username = loginForm.email.split('@')[0];
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
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

      // Auto-login after registration
      localStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
      setUser(data.user);
      setIsLoginModalOpen(false);
      setError(null);
      showToast('Account created successfully!', 'success');
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    setSavedBlueprints([]);
  };

  const generateBlueprint = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setBlueprint(''); // Clear previous blueprint

      const token = localStorage.getItem('authToken');
      if (!token) {
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    if (!authToken) return;

    try {
      const response = await fetch(`${API_URL}/api/blueprints`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
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
        <div className={`fixed top-4 right-4 z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-accent-600'
        } text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
          {toast.type === 'error' ? (
            <HiExclamationCircle className="w-4 h-4" />
          ) : (
            <HiCheckCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Minimal Navigation */}
      <nav className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <HiLightningBolt className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AppStruct</h1>
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <HiFolder className="w-4 h-4 mr-2" />
                    Saved ({savedBlueprints.length})
                  </button>
                  <span className="text-sm text-gray-600">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/50 rounded-full transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/50 rounded-full transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthMode('register');
                      setIsLoginModalOpen(true);
                    }}
                    className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full transition-all shadow-md"
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
          <div className="flex-1 flex items-center justify-center px-6 pb-20">
            <div className="max-w-4xl w-full">
              {/* Hero Heading */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                  Transform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">your app idea</span> into technical blueprints
                </h1>
                <p className="text-xl text-gray-600">
                  Describe your vision and get AI-powered architectural blueprints in seconds
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between max-w-3xl mx-auto">
                  <div className="flex items-center space-x-2">
                    <HiExclamationCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Large Input Box */}
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                <textarea
                  value={appIdea}
                  onChange={(e) => {
                    setAppIdea(e.target.value);
                    setError(null);
                  }}
                  rows={3}
                  className="block w-full border-0 focus:ring-0 text-base text-gray-700 placeholder-gray-400 resize-none"
                  placeholder="e.g., A social media platform for pet lovers with photo sharing, profiles, and location-based features..."
                  disabled={isGenerating}
                />
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    {/* Platform Pills */}
                    <div className="flex items-center space-x-2">
                      {[
                        { value: 'web', icon: HiDesktopComputer, label: 'Web' },
                        { value: 'mobile', icon: HiDeviceMobile, label: 'Mobile' },
                        { value: 'both', icon: HiCube, label: 'Both' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPlatform(option.value)}
                          className={`inline-flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                    <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                      {[
                        { value: 'brief', icon: HiLightningBolt, label: 'Quick' },
                        { value: 'full', icon: HiDocumentText, label: 'Detailed' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDetailLevel(option.value)}
                          className={`inline-flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                    className={`inline-flex items-center space-x-2 px-8 py-3 rounded-full text-base font-semibold transition-all shadow-lg ${
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
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Quick start with these ideas:</p>
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
                      className="px-4 py-2 bg-white/70 hover:bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:border-purple-300 transition-all"
                      disabled={isGenerating}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-6">
                  AI can make mistakes. Always double-check the results.
                </p>
              </div>
            </div>
          </div>
        ) : (

          /* Blueprint Output View */
          <div className="flex-1 bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
            {/* Header with Actions */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setBlueprint('')}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>New Blueprint</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h2 className="text-lg font-semibold text-gray-900">Your Blueprint</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(blueprint);
                    showToast('Copied to clipboard!', 'success');
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <HiClipboardCopy className="w-4 h-4" />
                  <span>Copy</span>
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
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full transition-all shadow-md"
                >
                  <HiDownload className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Blueprint Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 prose prose-lg max-w-none">
                  <ReactMarkdown>{blueprint}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Saved Blueprints */}
      {user && savedBlueprints.length > 0 && isSidebarOpen && (
        <div className="fixed right-0 top-16 bottom-0 w-96 bg-white/90 backdrop-blur-md border-l border-gray-200 shadow-2xl transition-all duration-300 z-40 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <HiFolder className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Saved Blueprints</h3>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedBlueprints.map((savedBlueprint) => (
              <div
                key={savedBlueprint._id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                  {savedBlueprint.ideaInput}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {savedBlueprint.platform}
                  </span>
                  <span>{new Date(savedBlueprint.createdAt).toLocaleDateString()}</span>
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
                    className="flex-1 text-sm py-2 px-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all font-medium"
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
      )}

      {/* Login/Register Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isAuthMode === 'login' ? 'Welcome back' : 'Get started'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isAuthMode === 'login' ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex space-x-2 mb-6 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setIsAuthMode('login')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isAuthMode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthMode('register')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isAuthMode === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={isAuthMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
              >
                {isAuthMode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
