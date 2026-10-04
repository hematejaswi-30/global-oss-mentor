import { useState } from 'react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [prTitle, setPrTitle] = useState('');
  const [prBody, setPrBody] = useState('');
  const [prLoading, setPrLoading] = useState(false);
  const [prCritique, setPrCritique] = useState('');
  const [prError, setPrError] = useState('');

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
    setPrLoading(true); setPrError(''); setPrCritique('');

    try {
      const res = await fetch('/judge_pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_title: prTitle, pr_body: prBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to judge PR.');
      setPrCritique(data.critique);
    } catch (err) {
      setPrError(err.message);
    } finally {
      setPrLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="bg-dark text-white text-center py-5 mb-5 shadow">
        <h1 className="fw-bold">🚀 Global OSS Mentor</h1>
        <p className="lead">Your Interactive Developer Co-Pilot. Powered by Gemma 4.</p>
      </div>

      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Step 1: Matching Card */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body p-4">
            <h3 className="fw-bold mb-3">Step 1: Find Your Match</h3>
            <form onSubmit={handleAnalyze}>
              <div className="mb-3">
                <label className="form-label fw-bold">GitHub Repository URL</label>
                <input type="url" className="form-control form-control-lg" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="e.g., https://github.com/facebook/react" required />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Your Current Skills</label>
                <input type="text" className="form-control" value={userSkills} onChange={e => setUserSkills(e.target.value)} placeholder="e.g., HTML, CSS, intermediate Python, beginner React" required />
              </div>
              <button className="btn btn-primary btn-lg w-100" type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Roadmap'}
              </button>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        </div>

        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 fw-bold text-muted">Gemma 4 is reading the repo and building your custom roadmap...</p>
          </div>
        )}

        {result && (
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100 text-center p-4">
                <h5 className="text-muted text-uppercase fw-bold">Confidence Score</h5>
                <h1 className={`display-1 fw-bold ${getScoreColor(result.confidence_score)}`}>{result.confidence_score}%</h1>
                <p className="mt-2 text-muted">Match with your skills</p>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card shadow-sm border-0 h-100 p-4">
                <h4 className="fw-bold mb-3">Gap Analysis</h4>
                <p>{result.summary}</p>
                <h6 className="fw-bold mt-3">What you need to learn before contributing:</h6>
                <ul className="list-group list-group-flush">
                  {result.gap_analysis && result.gap_analysis.map((gap, i) => (
                    <li key={i} className="list-group-item bg-transparent border-0 px-0">
                      <span className="badge bg-warning text-dark me-2">Missing</span> {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h4 className="fw-bold mb-4">🚀 Hackathon Sprints</h4>
                <div className="row">
                  {result.sprints && result.sprints.map((sprint, i) => (
                    <div className="col-md-3 mb-3" key={i}>
                      <div className="card bg-light border-0 h-100 p-3">
                        <span className="badge bg-primary mb-2 w-100">Sprint {i + 1}</span>
                        <p className="small mb-0">{sprint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="card shadow-sm border-0 mb-5 bg-dark text-white">
            <div className="card-body p-5">
              <h3 className="fw-bold mb-3">Step 2: PR Simulator (Etiquette Checker)</h3>
              <p className="text-light">Don't submit your Pull Request to GitHub just yet! Paste your draft title and description here, and our AI Maintainer will review it.</p>
              
              <form onSubmit={handleJudgePR}>
                <div className="mb-3">
                  <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="PR Title" value={prTitle} onChange={e => setPrTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <textarea className="form-control bg-dark text-white border-secondary" rows="4" placeholder="PR Description / Body" value={prBody} onChange={e => setPrBody(e.target.value)} required></textarea>
                </div>
                <button className="btn btn-light" type="submit" disabled={prLoading}>
                  {prLoading ? 'Reviewing...' : 'Grade my PR'}
                </button>
              </form>
              
              {prError && <div className="alert alert-danger mt-3">{prError}</div>}
              {prCritique && (
                <div className="mt-4 p-4 bg-secondary rounded" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(prCritique) : prCritique }}>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
