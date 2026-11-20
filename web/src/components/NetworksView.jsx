import React from 'react'

export default function NetworksView({ networks }) {
  return (
    <section className="view-content active">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Networks</h1>
          <p>Docker virtual network bridges and drivers</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Network Name</th>
              <th>Network ID</th>
              <th>Driver</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {(networks || []).map((net) => (
              <tr key={net.Id}>
                <td>
                  <strong style={{ color: '#fff' }}>{net.Name}</strong>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)', fontSize: '12px' }}>
                    {(net.Id || '').substring(0, 12)}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-muted)' }}>{net.Driver}</span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-dim)' }}>{net.Scope}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
