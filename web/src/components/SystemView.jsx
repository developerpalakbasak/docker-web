import React from 'react'

export default function SystemView({ systemInfo }) {
  const info = systemInfo?.info || {}
  const ver = systemInfo?.version || {}

  return (
    <section className="view-content active">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Engine & Host Information</h1>
          <p>Detailed Docker daemon configuration and system metrics</p>
        </div>
      </div>

      <div className="cards-grid">
        <div className="info-card">
          <h4>Docker Version</h4>
          <div className="card-val">{ver.Version || 'N/A'}</div>
          <div className="card-sub">API {ver.ApiVersion || 'N/A'}</div>
        </div>
        <div className="info-card">
          <h4>Operating System</h4>
          <div className="card-val">{info.OperatingSystem || 'Linux'}</div>
          <div className="card-sub">{info.Architecture || 'x86_64'} (Kernel {info.KernelVersion || ''})</div>
        </div>
        <div className="info-card">
          <h4>Hardware Resources</h4>
          <div className="card-val">{info.NCPU || 1} CPUs</div>
          <div className="card-sub">{((info.MemTotal || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB RAM</div>
        </div>
        <div className="info-card">
          <h4>Containers Total</h4>
          <div className="card-val">{info.Containers || 0}</div>
          <div className="card-sub" style={{ color: 'var(--status-running)' }}>
            {info.ContainersRunning || 0} Running, {info.ContainersStopped || 0} Stopped
          </div>
        </div>
        <div className="info-card">
          <h4>Images Stored</h4>
          <div className="card-val">{info.Images || 0}</div>
          <div className="card-sub">Storage Driver: {info.Driver || 'overlay2'}</div>
        </div>
        <div className="info-card">
          <h4>Docker Root Directory</h4>
          <div className="card-val" style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            {info.DockerRootDir || '/var/lib/docker'}
          </div>
          <div className="card-sub">Live Socket: /var/run/docker.sock</div>
        </div>
      </div>
    </section>
  )
}
