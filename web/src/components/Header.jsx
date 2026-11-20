import React from 'react'

export default function Header({ 
  port, 
  engineStatus, 
  globalSearch, 
  setGlobalSearch, 
  onRefresh, 
  onOpenSystem,
  onGoHome 
}) {
  return (
    <header>
      <div className="header-left">
        <div className="docker-logo" onClick={onGoHome}>
          <svg viewBox="0 0 24 24">
            <path d="M13.9 11.2h-1.8V9.4h1.8v1.8zm-2.4 0H9.7V9.4h1.8v1.8zm-2.4 0H7.3V9.4h1.8v1.8zm7.2 0h-1.8V9.4h1.8v1.8zm-4.8-2.4H9.7V7h1.8v1.8zm2.4 0h-1.8V7h1.8v1.8zm2.4 0h-1.8V7h1.8v1.8zM23 12.3c-.6-.4-1.8-.7-2.7-.2-.2-.6-.6-1.2-1.3-1.6-.8-.5-1.9-.4-2.7.1-.1-2.4-2-4.4-4.5-4.4H4.3C3.6 6.2 3 6.8 3 7.5v6.2c0 3.3 2.7 6 6 6h6.8c4.3 0 7.8-3.4 8-7.7.1.1.2.2.3.2.3.1.7.1.9-.1z" />
          </svg>
          <span className="docker-title">Docker Desktop</span>
          <span className="edition-badge">Port {port}</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <svg viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            id="global-search-input"
            type="text"
            placeholder="Search containers, images, volumes... (Ctrl+K)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="engine-status-pill" title="Docker Engine Status">
          <div className={`status-dot ${engineStatus.connected ? 'active' : 'error'}`} />
          <span>{engineStatus.connected ? 'Engine running' : 'Engine stopped'}</span>
        </div>

        <button className="header-btn" title="Refresh Now" onClick={onRefresh}>
          <svg viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>

        <button className="header-btn" title="System Dashboard" onClick={onOpenSystem}>
          <svg viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>

        <a 
          className="header-btn" 
          href="https://github.com/developerpalakbasak" 
          target="_blank" 
          rel="noopener noreferrer" 
          title="Developer GitHub: developerpalak"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
      </div>
    </header>
  )
}
