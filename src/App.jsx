import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  HiLightningBolt, 
  HiLightBulb, 
  HiDesktopComputer, 
  HiDeviceMobile, 
  HiCube,
  HiDocumentText,
  HiDownload,
  HiFolder,
  HiLogin,
  HiLogout,
  HiX,
  HiMail,
  HiLockClosed,
  HiCheckCircle,
  HiExclamationCircle,
  HiClipboardCopy,
  HiRefresh,
  HiCalendar
} from 'react-icons/hi';

function App() {
  const [appIdea, setAppIdea] = useState('');
  const [platform, setPlatform] = useState('web');
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
      const response = await fetch('http://localhost:5000/api/auth/me', {
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
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

      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoginModalOpen(true);
        return;
      }

      if (!appIdea || !platform) {
        setError('Please provide both an app idea and platform');
        return;
      }

      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idea: appIdea,
          platform: platform
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate blueprint');
      }

      const data = await response.json();
      setBlueprint(data.markdown);

      // Save the blueprint
      const saveResponse = await fetch('http://localhost:5000/api/blueprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ideaInput: appIdea,
          platform: platform,
          generatedMarkdown: data.markdown
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
      const response = await fetch('http://localhost:5000/api/blueprints', {
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
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-down ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-accent-600'
        } text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3`}>
          {toast.type === 'error' ? (
            <HiExclamationCircle className="w-5 h-5" />
          ) : (
            <HiCheckCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center shadow-md">
                  <HiLightningBolt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    AppStruct
                  </span>
                  <p className="text-xs text-gray-500 font-medium -mt-1">Blueprint Generator</p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Welcome back</p>
                      <p className="text-sm font-bold text-gray-800">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors duration-200"
                  >
                    <HiLogout className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors duration-200 shadow-sm"
                >
                  <HiLogin className="w-4 h-4 mr-2" />
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Build Your App{' '}
            <span className="text-accent-600">
              Blueprint
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into detailed architectural blueprints powered by AI
          </p>
        </div>

        {error && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HiExclamationCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-red-900">Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-4 text-red-400 hover:text-red-600 transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-2 mb-4">
                <HiLightBulb className="w-5 h-5 text-accent-600" />
                <h2 className="text-lg font-semibold text-gray-900">Describe Your Idea</h2>
              </div>
              <div className="relative">
                <textarea
                  value={appIdea}
                  onChange={(e) => {
                    setAppIdea(e.target.value);
                    setError(null);
                  }}
                  rows={6}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 transition-colors duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="e.g., A social media app for pet lovers with photo sharing, pet profiles, and a community forum..."
                  disabled={isGenerating}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                  {appIdea.length} characters
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-2 mb-4">
                <HiCube className="w-5 h-5 text-accent-600" />
                <h2 className="text-lg font-semibold text-gray-900">Choose Platform</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'web', icon: HiDesktopComputer, label: 'Web' },
                  { value: 'mobile', icon: HiDeviceMobile, label: 'Mobile' },
                  { value: 'both', icon: HiCube, label: 'Both' }
                ].map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="platform"
                      value={option.value}
                      checked={platform === option.value}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="sr-only"
                      disabled={isGenerating}
                    />
                    <div className={`
                      relative rounded-lg border-2 transition-all duration-200
                      ${platform === option.value 
                        ? 'bg-accent-50 border-accent-500 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'}
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                      p-4 text-center
                    `}>
                      <option.icon className={`w-8 h-8 mx-auto mb-2 ${
                        platform === option.value ? 'text-accent-600' : 'text-gray-400'
                      }`} />
                      <span className={`font-semibold text-sm ${
                        platform === option.value ? 'text-accent-900' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                      {platform === option.value && (
                        <HiCheckCircle className="absolute top-2 right-2 w-5 h-5 text-accent-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={generateBlueprint}
              className={`
                w-full flex justify-center items-center rounded-lg text-white font-semibold text-base py-3.5 px-6
                transition-all duration-200 shadow-sm
                ${isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-accent-600 hover:bg-accent-700 hover:shadow-md'
                }
              `}
              disabled={isGenerating || !appIdea.trim()}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <HiLightningBolt className="w-5 h-5 mr-2" />
                  <span>Generate Blueprint</span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <HiDocumentText className="w-5 h-5 text-accent-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Your Blueprint</h2>
                </div>
                {blueprint && (
                  <button
                    onClick={() => {
                      const blob = new Blob([blueprint], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'app-blueprint.md';
                      a.click();
                      showToast('Blueprint downloaded!', 'success');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors duration-200 shadow-sm"
                  >
                    <HiDownload className="h-4 w-4 mr-1.5" />
                    Download
                  </button>
                )}
              </div>
              <div className={`
                relative prose prose-sm max-w-none bg-gray-50 p-5 rounded-lg border border-gray-200
                ${isGenerating ? 'animate-pulse' : ''}
                h-[600px] overflow-y-auto custom-scrollbar
              `}>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="relative inline-block">
                        <svg className="animate-spin h-16 w-16 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-800">Crafting Your Blueprint</p>
                        <p className="mt-1 text-sm text-gray-500">This may take a few moments...</p>
                      </div>
                    </div>
                  </div>
                ) : blueprint ? (
                  <ReactMarkdown>{blueprint}</ReactMarkdown>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <HiDocumentText className="w-10 h-10 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-800">Ready to Create</p>
                        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                          Enter your app idea above and click generate to see your blueprint here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Blueprints Section */}
            {user && savedBlueprints.length > 0 && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <HiFolder className="w-5 h-5 text-accent-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Saved Blueprints</h2>
                    <span className="px-2 py-1 bg-accent-100 text-accent-700 text-xs font-semibold rounded">
                      {savedBlueprints.length}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                    {savedBlueprints.map((savedBlueprint) => (
                      <div
                        key={savedBlueprint._id}
                        className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-accent-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                              {savedBlueprint.ideaInput}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center px-2 py-1 bg-accent-100 text-accent-700 font-semibold rounded">
                                <HiCube className="h-3 w-3 mr-1" />
                                {savedBlueprint.platform}
                              </span>
                              <span className="inline-flex items-center text-gray-500">
                                <HiCalendar className="h-3 w-3 mr-1" />
                                {new Date(savedBlueprint.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setAppIdea(savedBlueprint.ideaInput);
                                setPlatform(savedBlueprint.platform);
                                setBlueprint(savedBlueprint.generatedMarkdown);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                showToast('Blueprint loaded!', 'success');
                              }}
                              className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                              title="Load blueprint"
                            >
                              <HiRefresh className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const blob = new Blob([savedBlueprint.generatedMarkdown], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `blueprint-${savedBlueprint._id}.md`;
                                a.click();
                                showToast('Blueprint downloaded!', 'success');
                              }}
                              className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <HiDownload className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(savedBlueprint.generatedMarkdown);
                                showToast('Copied to clipboard!', 'success');
                              }}
                              className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                              title="Copy to clipboard"
                            >
                              <HiClipboardCopy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Login/Register Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
                  <HiLogin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isAuthMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex space-x-2 mb-6 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setIsAuthMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all ${
                  isAuthMode === 'login'
                    ? 'bg-white text-accent-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthMode('register')}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all ${
                  isAuthMode === 'register'
                    ? 'bg-white text-accent-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={isAuthMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors"
              >
                {isAuthMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
