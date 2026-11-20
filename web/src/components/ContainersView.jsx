import React, { useState } from 'react'

export default function ContainersView({
  containers,
  searchVal,
  onAction,
  onRemove,
  onPrune,
  onOpenRun,
  onOpenLogs,
  onOpenInspect,
}) {
  const [filter, setFilter] = useState('all')

  const runningCount = containers.filter((c) => c.State === 'running').length
  const stoppedCount = containers.filter((c) => c.State !== 'running').length

  const filtered = containers.filter((c) => {
    if (filter === 'running' && c.State !== 'running') return false
    if (filter === 'exited' && c.State === 'running') return false
    if (searchVal) {
      const q = searchVal.toLowerCase()
      const names = (c.Names || []).join(' ').toLowerCase()
      const img = (c.Image || '').toLowerCase()
      return names.includes(q) || img.includes(q) || (c.Id || '').includes(q)
    }
    return true
  })

  return (
    <section className="view-content active">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Containers</h1>
          <p>Manage, view logs, start, stop, and inspect running or exited containers</p>
        </div>
        <div className="action-bar">
          <button className="btn btn-secondary" onClick={onPrune} title="Remove all stopped containers">
            Prune Stopped
          </button>
          <button className="btn btn-primary" onClick={onOpenRun}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            Run Container
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <div
          className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({containers.length})
        </div>
        <div
          className={`filter-pill ${filter === 'running' ? 'active' : ''}`}
          onClick={() => setFilter('running')}
        >
          Running ({runningCount})
        </div>
        <div
          className={`filter-pill ${filter === 'exited' ? 'active' : ''}`}
          onClick={() => setFilter('exited')}
        >
          Stopped ({stoppedCount})
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '28px' }}></th>
              <th>Name / ID</th>
              <th>Image</th>
              <th>Status</th>
              <th>Port(s)</th>
              <th>Created</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const isRunning = c.State === 'running'
              const name = (c.Names && c.Names[0]) ? c.Names[0].replace(/^\//, '') : c.Id.substring(0, 12)
              const shortId = (c.Id || '').substring(0, 12)
              const statusText = c.Status || (isRunning ? 'Running' : 'Exited')
              const createdDate = new Date((c.Created || 0) * 1000).toLocaleString()

              return (
                <tr key={c.Id}>
                  <td style={{ textAlign: 'center' }}>
                    <div className={`status-dot ${isRunning ? 'active' : ''}`} style={{ margin: 'auto' }} />
                  </td>
                  <td>
                    <div className="container-name-cell">
                      <div>
                        <div className="container-title" onClick={() => onOpenInspect(c.Id, name)}>
                          {name}
                        </div>
                        <div className="container-sub">{shortId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {c.Image}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${isRunning ? 'running' : 'exited'}`}>
                      ● {statusText}
                    </span>
                  </td>
                  <td>
                    {c.Ports && c.Ports.length > 0 ? (
                      c.Ports.map((p, idx) => (
                        p.PublicPort ? (
                          <a
                            key={idx}
                            href={`http://localhost:${p.PublicPort}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="port-link"
                            style={{ marginRight: '6px' }}
                          >
                            {p.PublicPort}:{p.PrivatePort} ↗
                          </a>
                        ) : (
                          <span key={idx} style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-dim)', marginRight: '6px' }}>
                            {p.PrivatePort}/{p.Type}
                          </span>
                        )
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>-</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{createdDate}</td>
                  <td>
                    <div className="row-actions">
                      {isRunning ? (
                        <button className="btn-icon" title="Stop Container" onClick={() => onAction(c.Id, 'stop')}>
                          <svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                        </button>
                      ) : (
                        <button className="btn-icon" title="Start Container" onClick={() => onAction(c.Id, 'start')}>
                          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                      )}
                      <button className="btn-icon" title="Restart" onClick={() => onAction(c.Id, 'restart')}>
                        <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                      </button>
                      <button className="btn-icon" title="View Logs" onClick={() => onOpenLogs(c.Id, name)}>
                        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                      </button>
                      <button className="btn-icon" title="Inspect JSON" onClick={() => onOpenInspect(c.Id, name)}>
                        <svg viewBox="0 0 24 24"><path d="M11 9h2V7h-2v2zm1 11c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6z" /></svg>
                      </button>
                      <button className="btn-icon" style={{ color: '#ef4444' }} title="Delete Container" onClick={() => onRemove(c.Id, name)}>
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z" /></svg>
            <h3>No containers found</h3>
            <p>No Docker containers match your current filter. Click "+ Run Container" to launch an image like nginx, redis, or postgres.</p>
            <button className="btn btn-primary" onClick={onOpenRun}>+ Run Container</button>
          </div>
        )}
      </div>
    </section>
  )
}
