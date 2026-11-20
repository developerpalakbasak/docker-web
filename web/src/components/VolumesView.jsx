import React from 'react'

export default function VolumesView({ volumes, onOpenCreateVolume, onRemoveVolume }) {
  return (
    <section className="view-content active">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Volumes</h1>
          <p>Persistent storage volumes used by containers</p>
        </div>
        <div className="action-bar">
          <button className="btn btn-primary" onClick={onOpenCreateVolume}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            Create Volume
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Volume Name</th>
              <th>Driver</th>
              <th>Mountpoint</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(volumes || []).map((vol) => (
              <tr key={vol.Name}>
                <td>
                  <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{vol.Name}</strong>
                </td>
                <td>
                  <span style={{ color: 'var(--text-dim)' }}>{vol.Driver || 'local'}</span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                    {vol.Mountpoint || '-'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Delete Volume"
                      onClick={() => onRemoveVolume(vol.Name)}
                    >
                      <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!volumes || volumes.length === 0) && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2z" /></svg>
            <h3>No volumes found</h3>
            <p>Create a named volume for persistent database or file storage.</p>
            <button className="btn btn-primary" onClick={onOpenCreateVolume}>Create Volume</button>
          </div>
        )}
      </div>
    </section>
  )
}
