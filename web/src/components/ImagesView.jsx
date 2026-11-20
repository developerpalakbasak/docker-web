import React from 'react'

export default function ImagesView({ images, searchVal, onOpenPull, onPrefillRun, onRemoveImage }) {
  const filtered = images.filter((img) => {
    const tags = (img.RepoTags || []).join(' ').toLowerCase()
    return tags.includes(searchVal.toLowerCase()) || (img.Id || '').includes(searchVal.toLowerCase())
  })

  return (
    <section className="view-content active">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Images</h1>
          <p>Locally stored Docker container images ready to run</p>
        </div>
        <div className="action-bar">
          <button className="btn btn-primary" onClick={onOpenPull}>
            <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" /></svg>
            Pull Image
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Repository : Tag</th>
              <th>Image ID</th>
              <th>Created</th>
              <th>Size</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((img) => {
              const tag = (img.RepoTags && img.RepoTags[0]) ? img.RepoTags[0] : '<none>:<none>'
              const shortId = (img.Id || '').replace(/^sha256:/, '').substring(0, 12)
              const sizeMb = ((img.Size || 0) / (1024 * 1024)).toFixed(1) + ' MB'
              const createdDate = new Date((img.Created || 0) * 1000).toLocaleDateString()

              return (
                <tr key={img.Id}>
                  <td>
                    <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}>{tag}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)', fontSize: '12px' }}>
                      {shortId}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>{createdDate}</td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{sizeMb}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => onPrefillRun(tag)}
                      >
                        ▶ Run
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Delete Image"
                        onClick={() => onRemoveImage(img.Id, tag)}
                      >
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
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" /></svg>
            <h3>No images downloaded yet</h3>
            <p>Pull an image from Docker Hub to get started.</p>
            <button className="btn btn-primary" onClick={onOpenPull}>Pull Image</button>
          </div>
        )}
      </div>
    </section>
  )
}
