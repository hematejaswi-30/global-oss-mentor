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

  const [prTitle, setPrTitle] = useState('');
  const [prBody, setPrBody] = useState('');
  const [prLoading, setPrLoading] = useState(false);
  const [prCritique, setPrCritique] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
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
    <div className="min-vh-100 d-flex flex-column">
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
              <img src="https://github.com/identicons/hema.png" alt="Avatar" width="30" className="rounded-circle" />
              <span className="fw-bold">@hematejaswi</span>
            </div>
          ) : (
            <button className="btn github-btn" onClick={() => setIsLoggedIn(true)}>
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

        {/* Input Area (Replaces Dropdowns from Image) */}
        <div className="search-container shadow mx-auto" style={{maxWidth: '700px'}}>
          <form onSubmit={handleAnalyze} className="d-flex flex-column gap-3">
            <div className="d-flex gap-2">
              <input 
                type="url" 
                className="form-control custom-input p-3" 
                placeholder="Paste GitHub Repository URL (e.g. pallets/flask)" 
                value={repoUrl} onChange={e => setRepoUrl(e.target.value)} required 
              />
            </div>
            <div className="d-flex gap-2">
              <input 
                type="text" 
                className="form-control custom-input p-3" 
                placeholder="Your Skills (e.g. Python, Beginner)" 
                value={userSkills} onChange={e => setUserSkills(e.target.value)} required 
              />
              <button type="submit" className="btn neon-btn px-4" disabled={loading}>
                {loading ? 'Analyzing...' : 'Find Path'}
              </button>
            </div>
          </form>
          {error && <div className="text-danger mt-3">{error}</div>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-5 text-neon">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            Analyzing Repository...
          </div>
        )}

        {/* Results Cards (Styled like the reference image) */}
        {result && (
          <div className="row g-4 mt-5 text-start">
            
            {/* Sprints acting as "Issues" */}
            {result.sprints && result.sprints.map((sprint, i) => (
              <div className="col-md-4" key={i}>
                <div className="result-card p-4 h-100">
                  <div className="text-gray small mb-2 d-flex align-items-center gap-2">
                    <span className="badge-purple">Sprint {i+1}</span>
                  </div>
                  <h5 className="fw-bold text-white mb-4">{sprint}</h5>
                  <div className="d-flex gap-2 mt-auto">
                    <span className="badge-neon">good first issue</span>
                    <span className="badge-purple">Actionable</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="col-12 mt-4">
              <div className="result-card p-4 border-success">
                <h4 className="text-neon fw-bold mb-3">Gap Analysis (Confidence: {result.confidence_score}%)</h4>
                <p className="text-white">{result.summary}</p>
                <ul className="text-gray">
                  {result.gap_analysis && result.gap_analysis.map((gap, i) => <li key={i}>{gap}</li>)}
                </ul>
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
