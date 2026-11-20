import React, { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import ContainersView from './components/ContainersView.jsx'
import ImagesView from './components/ImagesView.jsx'
import VolumesView from './components/VolumesView.jsx'
import NetworksView from './components/NetworksView.jsx'
import SystemView from './components/SystemView.jsx'
import { RunModal, PullModal, VolumeModal, LogsModal, InspectModal } from './components/Modals.jsx'

const VALID_ROUTES = ['containers', 'images', 'volumes', 'networks', 'system']

const getViewFromPath = () => {
  const p = window.location.pathname.replace(/^\/+|\/+$/g, '')
  return VALID_ROUTES.includes(p) ? p : 'containers'
}

export default function App() {
  const [currentView, setCurrentView] = useState(getViewFromPath)
  const [globalSearch, setGlobalSearch] = useState('')
  const [port, setPort] = useState(window.location.port || '5000')

  const [engineStatus, setEngineStatus] = useState({ connected: false })
  const [containers, setContainers] = useState([])
  const [images, setImages] = useState([])
  const [volumes, setVolumes] = useState([])
  const [networks, setNetworks] = useState([])
  const [systemInfo, setSystemInfo] = useState({})
  const [toasts, setToasts] = useState([])

  // Modals state
  const [isRunOpen, setIsRunOpen] = useState(false)
  const [prefilledImage, setPrefilledImage] = useState('')
  const [isPullOpen, setIsPullOpen] = useState(false)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)
  const [logsModal, setLogsModal] = useState({ isOpen: false, id: '', name: '' })
  const [inspectModal, setInspectModal] = useState({ isOpen: false, id: '', name: '' })

  const navigateTo = (view) => {
    if (!VALID_ROUTES.includes(view)) view = 'containers'
    const target = '/' + view
    if (window.location.pathname !== target) {
      window.history.pushState({ view }, '', target)
    }
    setCurrentView(view)
  }

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setEngineStatus(data)
      if (data.port) setPort(data.port)
    } catch {
      setEngineStatus({ connected: false })
    }
  }

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/containers')
      const data = await res.json()
      if (data.success) setContainers(data.containers || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images')
      const data = await res.json()
      if (data.success) setImages(data.images || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVolumes = async () => {
    try {
      const res = await fetch('/api/volumes')
      const data = await res.json()
      if (data.success) setVolumes(data.volumes || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchNetworks = async () => {
    try {
      const res = await fetch('/api/networks')
      const data = await res.json()
      if (data.success) setNetworks(data.networks || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/system/info')
      const data = await res.json()
      if (data.success) setSystemInfo(data)
    } catch (err) {
      console.error(err)
    }
  }

  const refreshAll = () => {
    checkStatus()
    if (currentView === 'containers') fetchContainers()
    if (currentView === 'images') fetchImages()
    if (currentView === 'volumes') fetchVolumes()
    if (currentView === 'networks') fetchNetworks()
    if (currentView === 'system') fetchSystemInfo()
  }

  useEffect(() => {
    // Canonicalize root "/" to "/containers"
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
    if (!VALID_ROUTES.includes(path)) {
      window.history.replaceState({ view: 'containers' }, '', '/containers')
    }

    const onPopState = () => {
      setCurrentView(getViewFromPath())
    }
    window.addEventListener('popstate', onPopState)

    checkStatus()
    fetchContainers()
    fetchImages()
    fetchVolumes()
    fetchNetworks()
    fetchSystemInfo()

    const interval = setInterval(() => {
      if (currentView === 'containers') fetchContainers()
      checkStatus()
    }, 4000)

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', onPopState)
    }
  }, [currentView])

  // Container Actions
  const handleContainerAction = async (id, action) => {
    addToast(`Sending ${action} command...`, 'info')
    try {
      const res = await fetch(`/api/containers/${id}/${action}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        addToast(data.message || `Container ${action} succeeded`, 'success')
        fetchContainers()
      } else {
        addToast(data.error || `Failed to ${action}`, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRemoveContainer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove container "${name}"?`)) return
    try {
      const res = await fetch(`/api/containers/${id}?force=true`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        addToast(`Container "${name}" removed`, 'success')
        fetchContainers()
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handlePruneContainers = async () => {
    if (!window.confirm('Remove all stopped containers?')) return
    try {
      const res = await fetch('/api/containers/prune', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        addToast('Stopped containers pruned', 'success')
        fetchContainers()
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRunSubmit = async (payload) => {
    try {
      const res = await fetch('/api/containers/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        addToast(data.message, 'success')
        fetchContainers()
        navigateTo('containers')
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  // Image Actions
  const handlePullSubmit = async (image) => {
    addToast(`Pulling '${image}' layers from Docker Hub...`, 'info')
    try {
      const res = await fetch('/api/images/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(data.message, 'success')
        fetchImages()
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRemoveImage = async (id, tag) => {
    if (!window.confirm(`Delete image "${tag}"?`)) return
    try {
      const res = await fetch(`/api/images/${id}?force=true`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        addToast(`Image deleted`, 'success')
        fetchImages()
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  // Volume Actions
  const handleCreateVolume = async (name) => {
    try {
      const res = await fetch('/api/volumes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(data.message, 'success')
        fetchVolumes()
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRemoveVolume = async (name) => {
    if (!window.confirm(`Delete volume "${name}"?`)) return
    try {
      const res = await fetch(`/api/volumes/${name}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        addToast(data.message, 'success')
        fetchVolumes()
      } else {
        addToast(data.error, 'error')
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const runningCount = containers.filter((c) => c.State === 'running').length

  return (
    <>
      <Header
        port={port}
        engineStatus={engineStatus}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        onRefresh={refreshAll}
        onOpenSystem={() => navigateTo('system')}
        onGoHome={() => navigateTo('containers')}
      />

      <div className="app-body">
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          containersCount={containers.length}
          runningCount={runningCount}
          imagesCount={images.length}
          volumesCount={volumes.length}
          networksCount={networks.length}
          engineVersion={engineStatus?.version?.Version}
          port={port}
        />

        <main>
          {!engineStatus.connected && (
            <div className="daemon-alert">
              <span>
                ⚠️ <strong>Docker Engine is not running or unreachable.</strong> If stopped, run{' '}
                <code>sudo systemctl start docker</code> in your terminal.
              </span>
              <button onClick={checkStatus}>Retry Connection</button>
            </div>
          )}

          {currentView === 'containers' && (
            <ContainersView
              containers={containers}
              searchVal={globalSearch}
              onAction={handleContainerAction}
              onRemove={handleRemoveContainer}
              onPrune={handlePruneContainers}
              onOpenRun={() => {
                setPrefilledImage('')
                setIsRunOpen(true)
              }}
              onOpenLogs={(id, name) => setLogsModal({ isOpen: true, id, name })}
              onOpenInspect={(id, name) => setInspectModal({ isOpen: true, id, name })}
            />
          )}

          {currentView === 'images' && (
            <ImagesView
              images={images}
              searchVal={globalSearch}
              onOpenPull={() => setIsPullOpen(true)}
              onPrefillRun={(tag) => {
                setPrefilledImage(tag)
                setIsRunOpen(true)
              }}
              onRemoveImage={handleRemoveImage}
            />
          )}

          {currentView === 'volumes' && (
            <VolumesView
              volumes={volumes}
              onOpenCreateVolume={() => setIsVolumeOpen(true)}
              onRemoveVolume={handleRemoveVolume}
            />
          )}

          {currentView === 'networks' && <NetworksView networks={networks} />}

          {currentView === 'system' && <SystemView systemInfo={systemInfo} />}
        </main>
      </div>

      {/* Modals */}
      <RunModal
        isOpen={isRunOpen}
        onClose={() => setIsRunOpen(false)}
        onSubmit={handleRunSubmit}
        initialImage={prefilledImage}
      />
      <PullModal
        isOpen={isPullOpen}
        onClose={() => setIsPullOpen(false)}
        onSubmit={handlePullSubmit}
      />
      <VolumeModal
        isOpen={isVolumeOpen}
        onClose={() => setIsVolumeOpen(false)}
        onSubmit={handleCreateVolume}
      />
      <LogsModal
        isOpen={logsModal.isOpen}
        onClose={() => setLogsModal({ isOpen: false, id: '', name: '' })}
        containerId={logsModal.id}
        containerName={logsModal.name}
      />
      <InspectModal
        isOpen={inspectModal.isOpen}
        onClose={() => setInspectModal({ isOpen: false, id: '', name: '' })}
        containerId={inspectModal.id}
        containerName={inspectModal.name}
      />

      {/* Toasts */}
      <div id="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
