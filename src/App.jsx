import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [appIdea, setAppIdea] = useState('');
  const [platform, setPlatform] = useState('web');
  const [blueprint, setBlueprint] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [savedBlueprints, setSavedBlueprints] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's blueprints when logged in
  useEffect(() => {
    if (user) {
      fetchUserBlueprints();
    }
  }, [user]);

  const fetchUserBlueprints = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/blueprints/${user.id}`);
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

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({
      id: loginForm.username,
      username: loginForm.username
    });
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setSavedBlueprints([]);
  };

  const generateBlueprint = async () => {
    if (!appIdea.trim()) {
      setError('Please enter an app idea');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const generateResponse = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: appIdea,
          platform
        }),
      });

      const data = await generateResponse.json();

      if (!generateResponse.ok) {
        throw new Error(data.message || 'Failed to generate blueprint');
      }

      setBlueprint(data.markdown);

      if (user) {
        const saveResponse = await fetch('http://localhost:5000/api/blueprints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            ideaInput: appIdea,
            platform,
            generatedMarkdown: data.markdown
          }),
        });

        if (!saveResponse.ok) {
          const saveData = await saveResponse.json();
          throw new Error(saveData.message || 'Failed to save blueprint');
        }

        await fetchUserBlueprints();
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate blueprint. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                AppStruct
              </span>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-medium">{user.username}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-400 rounded-md shadow-sm animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Describe Your App Idea</h2>
              <textarea
                value={appIdea}
                onChange={(e) => {
                  setAppIdea(e.target.value);
                  setError(null);
                }}
                rows={6}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-150"
                placeholder="Describe your app idea in plain language..."
                disabled={isGenerating}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Target Platform</h2>
              <div className="flex flex-wrap gap-4">
                {['web', 'mobile', 'both'].map((option) => (
                  <label key={option} className="flex-1 min-w-[120px]">
                    <div className={`
                      flex items-center justify-center p-4 rounded-md border-2 cursor-pointer transition-all duration-150
                      ${platform === option 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 hover:border-primary-200'}
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                      <input
                        type="radio"
                        name="platform"
                        value={option}
                        checked={platform === option}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="sr-only"
                        disabled={isGenerating}
                      />
                      <span className="capitalize font-medium">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={generateBlueprint}
              className={`
                w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium
                transition-all duration-150 space-x-2
                ${isGenerating
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }
                text-white
              `}
              disabled={isGenerating || !appIdea.trim()}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Blueprint...</span>
                </>
              ) : (
                'Generate Blueprint'
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Generated Blueprint</h2>
                {blueprint && (
                  <button
                    onClick={() => {
                      const blob = new Blob([blueprint], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'app-blueprint.md';
                      a.click();
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                )}
              </div>
              <div className={`
                prose max-w-none bg-gray-50 p-6 rounded-md border border-gray-200
                ${isGenerating ? 'animate-pulse' : ''}
                h-[600px] overflow-y-auto
              `}>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="mt-4 font-medium">Generating your blueprint...</p>
                      <p className="mt-2 text-sm">This may take a few moments</p>
                    </div>
                  </div>
                ) : blueprint ? (
                  <ReactMarkdown>{blueprint}</ReactMarkdown>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 font-medium">Your blueprint will appear here</p>
                      <p className="mt-2 text-sm">Enter your app idea and click generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Blueprints Section */}
            {user && savedBlueprints.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Blueprints</h2>
                <div className="space-y-4">
                  {savedBlueprints.map((saved) => (
                    <div
                      key={saved._id}
                      className="p-4 border border-gray-200 rounded-md hover:border-primary-200 hover:bg-gray-50 cursor-pointer transition-all duration-150"
                      onClick={() => {
                        setAppIdea(saved.ideaInput);
                        setPlatform(saved.platform);
                        setBlueprint(saved.generatedMarkdown);
                      }}
                    >
                      <div className="font-medium text-gray-900">{saved.ideaInput}</div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {saved.platform}
                        </span>
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(saved.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
