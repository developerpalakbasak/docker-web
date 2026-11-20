import React from 'react'

export default function Sidebar({
  currentView,
  onNavigate,
  containersCount,
  runningCount,
  imagesCount,
  volumesCount,
  networksCount,
  engineVersion,
  port,
}) {
  const handleClick = (e, path) => {
    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
      e.preventDefault()
      onNavigate(path)
    }
  }

  return (
    <aside>
      <div className="sidebar-menu">
        <a
          href="/containers"
          className={`menu-item ${currentView === 'containers' ? 'active' : ''}`}
          onClick={(e) => handleClick(e, 'containers')}
          style={{ textDecoration: 'none' }}
        >
          <div className="menu-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1zM6 9h3v6H6zm4.5 0h3v6h-3zm4.5 0h3v6h-3z" />
            </svg>
            <span>Containers</span>
          </div>
          <span className="menu-badge">{runningCount}/{containersCount}</span>
        </a>

        <a
          href="/images"
          className={`menu-item ${currentView === 'images' ? 'active' : ''}`}
          onClick={(e) => handleClick(e, 'images')}
          style={{ textDecoration: 'none' }}
        >
          <div className="menu-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
            </svg>
            <span>Images</span>
          </div>
          <span className="menu-badge">{imagesCount}</span>
        </a>

        <a
          href="/volumes"
          className={`menu-item ${currentView === 'volumes' ? 'active' : ''}`}
          onClick={(e) => handleClick(e, 'volumes')}
          style={{ textDecoration: 'none' }}
        >
          <div className="menu-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
            </svg>
            <span>Volumes</span>
          </div>
          <span className="menu-badge">{volumesCount}</span>
        </a>

        <a
          href="/networks"
          className={`menu-item ${currentView === 'networks' ? 'active' : ''}`}
          onClick={(e) => handleClick(e, 'networks')}
          style={{ textDecoration: 'none' }}
        >
          <div className="menu-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <span>Networks</span>
          </div>
          <span className="menu-badge">{networksCount}</span>
        </a>

        <a
          href="/system"
          className={`menu-item ${currentView === 'system' ? 'active' : ''}`}
          onClick={(e) => handleClick(e, 'system')}
          style={{ textDecoration: 'none' }}
        >
          <div className="menu-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" />
            </svg>
            <span>Engine & Host</span>
          </div>
        </a>
      </div>

      <div className="sidebar-footer">
        <div className="foot-row">
          <span>Engine:</span>
          <span>{engineVersion ? `v${engineVersion}` : 'Docker API'}</span>
        </div>
        <div className="foot-row">
          <span>Web UI:</span>
          <span>localhost:{port}</span>
        </div>
        <div className="foot-row">
          <span>Socket:</span>
          <span title="/var/run/docker.sock">unix://...</span>
        </div>

        <div className="foot-signature">
          <span>Developed by:</span>
          <a
            href="https://github.com/developerpalakbasak"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            developerpalak ↗
          </a>
        </div>
      </div>
    </aside>
  )
}
