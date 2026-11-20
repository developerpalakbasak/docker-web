import React, { useState } from 'react'

export function RunModal({ isOpen, onClose, onSubmit, initialImage }) {
  const [image, setImage] = useState(initialImage || '')
  const [name, setName] = useState('')
  const [ports, setPorts] = useState('')
  const [env, setEnv] = useState('')
  const [restartPolicy, setRestartPolicy] = useState('unless-stopped')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!image.trim()) {
      alert('Please specify an image name')
      return
    }
    setLoading(true)
    const envList = env.trim() ? env.split('\n').map((s) => s.trim()).filter(Boolean) : []
    await onSubmit({ image: image.trim(), name: name.trim(), ports: ports.trim(), env: envList, restartPolicy })
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Run a New Container</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Docker Image *</label>
            <input
              type="text"
              placeholder="e.g. nginx:alpine, redis:latest, postgres:alpine"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <div className="form-hint">Image name and tag from local storage or Docker Hub</div>
          </div>
          <div className="form-group">
            <label>Container Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. my-web-server"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Port Mappings</label>
            <input
              type="text"
              placeholder="HostPort:ContainerPort (e.g. 8080:80, 5432:5432)"
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Environment Variables (one per line)</label>
            <textarea
              rows="3"
              placeholder={'POSTGRES_PASSWORD=secret\nNODE_ENV=production'}
              value={env}
              onChange={(e) => setEnv(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Restart Policy</label>
            <select value={restartPolicy} onChange={(e) => setRestartPolicy(e.target.value)}>
              <option value="no">No restart</option>
              <option value="always">Always restart</option>
              <option value="unless-stopped">Unless stopped</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Launching...' : 'Launch Container'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PullModal({ isOpen, onClose, onSubmit }) {
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!image.trim()) {
      alert('Please specify an image name')
      return
    }
    setLoading(true)
    await onSubmit(image.trim())
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Pull Image from Docker Hub</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Image Tag</label>
            <input
              type="text"
              placeholder="e.g. nginx:alpine, redis:alpine, node:20-alpine"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <div className="form-hint">Downloads image layers from Docker Hub to your local engine</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Pulling layers...' : 'Pull Image'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function VolumeModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!name.trim()) return
    await onSubmit(name.trim())
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Create Persistent Volume</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Volume Name *</label>
            <input
              type="text"
              placeholder="e.g. postgres-data, app-storage"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Volume</button>
        </div>
      </div>
    </div>
  )
}

export function LogsModal({ isOpen, onClose, containerId, containerName }) {
  const [tail, setTail] = useState('250')
  const [logs, setLogs] = useState('Fetching logs...')
  const [loading, setLoading] = useState(false)

  const fetchLogs = async (t = tail) => {
    if (!containerId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/containers/${containerId}/logs?tail=${t}`)
      const data = await res.json()
      setLogs(data.logs || '(No logs produced yet)')
    } catch (err) {
      setLogs('Error fetching logs: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (isOpen && containerId) {
      fetchLogs(tail)
    }
  }, [isOpen, containerId, tail])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(logs)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card large">
        <div className="modal-header">
          <h2>Logs: {containerName}</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              style={{
                background: 'var(--bg-darker)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '3px 6px',
                fontSize: '12px',
              }}
              value={tail}
              onChange={(e) => setTail(e.target.value)}
            >
              <option value="100">Tail 100</option>
              <option value="250">Tail 250</option>
              <option value="500">Tail 500</option>
              <option value="1000">Tail 1000</option>
            </select>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => fetchLogs()}>
              Refresh
            </button>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ padding: '10px' }}>
          <div className="terminal-box">{logs}</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCopy}>Copy All</button>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function InspectModal({ isOpen, onClose, containerId, containerName }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (isOpen && containerId) {
      setLoading(true)
      fetch(`/api/containers/${containerId}/inspect`)
        .then((r) => r.json())
        .then((d) => setData(d.data))
        .catch((e) => setData({ error: e.message }))
        .finally(() => setLoading(false))
    }
  }, [isOpen, containerId])

  if (!isOpen) return null

  const jsonStr = data ? JSON.stringify(data, null, 2) : 'Loading...'

  return (
    <div className="modal-backdrop">
      <div className="modal-card large">
        <div className="modal-header">
          <h2>Inspect: {containerName}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '10px' }}>
          <div className="terminal-box" style={{ color: '#a7f3d0' }}>
            {loading ? 'Fetching inspect JSON...' : jsonStr}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(jsonStr)}>
            Copy JSON
          </button>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
