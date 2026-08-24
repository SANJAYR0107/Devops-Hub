import { useState } from 'react'
import './App.css'

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [status, setStatus] = useState('Idle')
  const [logs, setLogs] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `[INFO] ${msg}`])
  }

  const addError = (msg) => {
    setLogs((prev) => [...prev, `[ERROR] ${msg}`])
  }

  const handleAnalyze = async () => {
    if (!repoUrl) return

    setStatus('Processing')
    setResult(null)
    setError(null)
    setLogs([])

    addLog('Repository URL received')
    
    try {
      const response = await fetch('http://localhost:5000/api/repository/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl: repoUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze repository')
      }

      addLog('Repository cloned')
      addLog('Repository analyzed')
      if (data.analysis?.technology) {
          addLog(`${data.analysis.technology} project detected`)
      }
      if (data.analysis?.dockerfileExists) {
          addLog('Dockerfile found')
          addLog('Docker image build started')
          if (data.dockerBuildStatus === 'SUCCESS') addLog('Docker image built successfully')
          if (data.containerStatus === 'RUNNING') addLog('Container started')
      }

      setResult(data)
      setStatus('Completed')
    } catch (err) {
      setError(err.message)
      addError(err.message)
      setStatus('Failed')
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>DevOpsHub</h1>
        <p>Self-Service DevOps Deployment Platform</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <label>GitHub Repository URL</label>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="https://github.com/user/project" 
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={status === 'Processing'}
            />
            <button 
              onClick={handleAnalyze}
              disabled={!repoUrl || status === 'Processing'}
            >
              {status === 'Processing' ? 'Analyzing...' : 'Analyze Repository'}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="dashboard-section">
          <div className="panel">
            <h2>Dashboard</h2>
            {result ? (
              <div className="dashboard-stats">
                <div className="stat-row">
                  <span className="stat-label">Repository:</span>
                  <span className="stat-value">{result.projectName}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Technology:</span>
                  <span className="stat-value">{result.analysis?.technology}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Project Type:</span>
                  <span className="stat-value">{result.analysis?.projectType}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Dockerfile:</span>
                  <span className="stat-value">{result.analysis?.dockerfileExists ? 'Found' : 'Not Found'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Docker Build:</span>
                  <span className="stat-value">{result.dockerBuildStatus}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Container:</span>
                  <span className="stat-value">{result.containerStatus}</span>
                </div>
              </div>
            ) : (
              <p className="placeholder-text">Submit a repository to view analysis</p>
            )}
          </div>

          <div className="panel logs-panel">
            <h2>Logs</h2>
            <div className="logs-container">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className={`log-line ${log.includes('[ERROR]') ? 'error-log' : ''}`}>
                    {log}
                  </div>
                ))
              ) : (
                <p className="placeholder-text">No logs yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
