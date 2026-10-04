import { useState } from 'react';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Fake GitHub Auth for Demo
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [githubUser, setGithubUser] = useState('');
  const [inputUser, setInputUser] = useState('');

  const [prTitle, setPrTitle] = useState('');
  const [prBody, setPrBody] = useState('');
  const [prLoading, setPrLoading] = useState(false);
  const [prCritique, setPrCritique] = useState('');

  const runAnalysis = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, user_skills: userSkills })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    runAnalysis();
  };

  const simulateLogin = () => {
    if (!inputUser.trim()) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setGithubUser(inputUser.trim());
      setIsLoggedIn(true);
      setIsLoggingIn(false);
      setShowAuthModal(false);
      // Auto-start analysis if they already typed something
      if (repoUrl && userSkills) {
        runAnalysis();
      }
    }, 1500);
  };

  const handleJudgePR = async (e) => {
    e.preventDefault();
    setPrLoading(true); setPrCritique('');
    try {
      const res = await fetch('/judge_pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_title: prTitle, pr_body: prBody })
      });
      const data = await res.json();
      if (res.ok) setPrCritique(data.critique);
    } finally {
      setPrLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column position-relative">
      
      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-custom text-center">
            <h3 className="fw-bold mb-3 text-white">GitHub Required</h3>
            <p className="text-gray mb-4">Please connect your GitHub account to analyze repositories and receive your customized mentorship plan.</p>
            
            <input 
              type="text" 
              className="form-control custom-input mb-4 p-3 text-center fs-5 text-white" 
              placeholder="Enter your GitHub username" 
              value={inputUser} 
              onChange={e => setInputUser(e.target.value)} 
              autoFocus
            />

            <button 
              className="btn neon-btn w-100 py-3 mb-3 d-flex justify-content-center align-items-center fs-5" 
              onClick={simulateLogin} 
              disabled={isLoggingIn || !inputUser.trim()}
            >
              {isLoggingIn ? (
                <><div className="spinner-border spinner-border-sm me-2"></div> Authenticating...</>
              ) : (
                'Connect Account'
              )}
            </button>
            <button className="btn btn-link text-gray text-decoration-none" onClick={() => setShowAuthModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar-custom d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="text-neon fs-4 me-2">▨</span>
          <h5 className="mb-0 fw-bold">OSS Guide</h5>
        </div>
        <div className="d-none d-md-flex gap-4 text-gray">
          <span style={{cursor:'pointer'}} className="text-white">Find issues</span>
          <span style={{cursor:'pointer'}}>How it works</span>
          <span style={{cursor:'pointer'}}>Resources</span>
        </div>
        <div>
          {isLoggedIn ? (
            <div className="d-flex align-items-center gap-2">
              <img src={`https://github.com/${githubUser}.png`} alt="Avatar" width="30" className="rounded-circle border border-secondary" />
              <span className="fw-bold text-white">@{githubUser}</span>
            </div>
          ) : (
            <button className="btn github-btn" onClick={() => setShowAuthModal(true)}>
              Sign in with GitHub
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container flex-grow-1 text-center mt-5" style={{maxWidth: '1000px'}}>
        
        {/* Hero */}
        <span className="badge rounded-pill border border-success text-neon px-3 py-2 mb-4" style={{backgroundColor: 'transparent'}}>
          Hacktoberfest ready
        </span>
        <h1 className="hero-title">
          Make your first <span className="text-neon">open source</span> contribution
        </h1>
        <p className="text-gray mt-3 fs-5">
          Find beginner-friendly issues and follow a clear path from fork to pull request.
        </p>

        {/* Input Area */}
        <div className="search-container shadow mx-auto text-start" style={{maxWidth: '700px'}}>
          <form onSubmit={handleAnalyzeClick} className="d-flex flex-column gap-4">
            
            {/* Step 1: Repository */}
            <div>
              <label className="form-label text-neon fw-bold mb-2 fs-5">1. Target Repository</label>
              <input 
                type="url" 
                className="form-control custom-input p-3 fs-5 text-white" 
                placeholder="Paste GitHub Repository URL (e.g., https://github.com/pallets/flask)" 
                value={repoUrl} onChange={e => setRepoUrl(e.target.value)} required 
              />
              <div className="text-gray mt-2 small">
                Paste the full URL of the public GitHub project you want to contribute to.
              </div>
            </div>

            {/* Step 2: Skills */}
            <div>
              <label className="form-label text-neon fw-bold mb-2 fs-5">2. Your Developer Profile</label>
              <input 
                type="text" 
                className="form-control custom-input p-3 fs-5 text-white" 
                placeholder="e.g., HTML, CSS, intermediate React developer" 
                value={userSkills} onChange={e => setUserSkills(e.target.value)} required 
              />
              <div className="text-gray mt-2 small">
                Tell the AI your current skills so it can calculate your Confidence Score and find issues that match your level.
              </div>
            </div>

            <button type="submit" className="btn neon-btn py-3 fs-5 mt-2 fw-bold shadow-lg" disabled={loading}>
              {loading ? (
                <><div className="spinner-border spinner-border-sm me-2"></div> Generating Roadmap...</>
              ) : (
                'Generate Contribution Path'
              )}
            </button>
          </form>
          {error && <div className="text-danger mt-4 text-center p-3 rounded" style={{backgroundColor: 'rgba(255,0,0,0.1)'}}>{error}</div>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-5 text-neon">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            Analyzing Repository...
          </div>
        )}

        {/* Results Cards */}
        {result && (
          <div className="row g-4 mt-5 text-start">
            <div className="col-12 mt-4">
              <div className="result-card p-4 border-success">
                <div className="text-white" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(result.markdown || '') : (result.markdown || '') }}></div>
              </div>
            </div>

            {/* PR Simulator */}
            <div className="col-12 mt-4 text-start">
              <div className="result-card p-4">
                <h4 className="text-neon fw-bold mb-3">PR Simulator (Etiquette Check)</h4>
                <form onSubmit={handleJudgePR}>
                  <input type="text" className="form-control custom-input mb-3" placeholder="PR Title" value={prTitle} onChange={e => setPrTitle(e.target.value)} required />
                  <textarea className="form-control custom-input mb-3" rows="3" placeholder="PR Description" value={prBody} onChange={e => setPrBody(e.target.value)} required></textarea>
                  <button className="btn neon-btn" type="submit" disabled={prLoading}>
                    {prLoading ? 'Reviewing...' : 'Grade my PR'}
                  </button>
                </form>
                {prCritique && (
                  <div className="mt-4 p-3 badge-purple" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(prCritique) : prCritique }}></div>
                )}
              </div>
            </div>
            
          </div>
        )}

      </div>

      {/* Bottom Stepper (from the image) */}
      <div className="stepper-container mt-auto">
        <div className="container d-flex justify-content-between text-gray">
          <div className="d-flex align-items-center"><div className="step-circle">1</div> Fork the repo</div>
          <div className="d-flex align-items-center"><div className="step-circle">2</div> Create a branch</div>
          <div className="d-flex align-items-center"><div className="step-circle">3</div> Commit changes</div>
          <div className="d-flex align-items-center"><div className="step-circle">4</div> Open a pull request</div>
        </div>
      </div>
    </div>
  );
}

export default App;
