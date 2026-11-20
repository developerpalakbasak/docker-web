# 🐳 Docker Desktop Web CLI (Windows Edition UI)

A lightweight Go CLI tool that provides a **Docker Desktop for Windows** web interface in your browser on **Port 5000**.

Powered by the **Gin Web Framework** (Go) + **React & Vite** (Frontend), directly controlling the Docker daemon over the Unix socket (`/var/run/docker.sock`).

---

## 🛠️ Frontend (React + Vite)

The UI is built with **React** and bundled using **Vite**.

### Frontend Development:
```bash
cd web
npm run dev
```
*(Runs on `http://localhost:3000` with hot-module reloading and automatically proxies API calls to Go on `:5000`)*.

### Building Frontend for Go Embedding:
```bash
cd web
npm run build
cd ..
```
*(Outputs to `web/dist/`, which is embedded directly into the Go executable via `//go:embed`)*.

---

## 🔨 Building the Optimized Executable

To compile into a lightweight, standalone binary with debug symbols and file paths stripped:

```bash
go build -ldflags="-s -w" -trimpath -o docker-web
```

- **`-s`**: Omits symbol table.
- **`-w`**: Omits DWARF debug information (reduces file size by ~35%).
- **`-trimpath`**: Removes internal directory and source file paths from the binary.

---

## 🚀 Quick Start

When you run `./docker-web`, it directly executes `sudo systemctl start docker` to start Docker, and when you press **Ctrl+C**, it directly executes `sudo systemctl stop docker.service docker.socket` to stop Docker completely.

```bash
# Run prebuilt binary
./docker-web

# Or run with Go
go run .
```
*(With custom port: `./docker-web --port 8000` or `go run . --port 8000`)*

---

## 🌐 Dedicated URL Routes

You can navigate directly to or bookmark any of these separate routes:

- **Containers**: `http://localhost:5000/containers`
- **Images**: `http://localhost:5000/images`
- **Volumes**: `http://localhost:5000/volumes`
- **Networks**: `http://localhost:5000/networks`
- **Engine & System Info**: `http://localhost:5000/system`

Full browser navigation support:
- Click sidebar links for instantaneous, seamless SPA transitions.
- Use browser **Back** / **Forward** buttons.
- Open in a new tab or bookmark direct URLs.

---

## ⚙️ CLI Options & Port Selection

You can pass the port in any of the following ways:

```bash
# 1. Using --port flag
./docker-web --port 8000

# 2. Using short -p flag
./docker-web -p 8000

# 3. Direct positional port number
./docker-web 8000

# 4. Without opening the browser automatically
./docker-web --port 8000 --open=false
```

| Flag | Shorthand | Default | Description |
|------|-----------|---------|-------------|
| `--port` | `-p` | `5000` | Port for the Web UI (e.g. `--port 8000`) |
| `--socket` | `-s` | `/var/run/docker.sock` | Path to Docker daemon socket |
| `--open` | | `true` | Automatically open browser on launch |

---

### 💡 Make `docker-web` available everywhere:
If you want to run `docker-web --port 8000` from any folder without typing `./`:
```bash
sudo cp docker-web /usr/local/bin/
```
Then simply run:
```bash
docker-web --port 8000
```

---

## ✨ Features

- **Windows Docker Desktop Theme**: Authentic dark mode UI with Fluent typography, Docker blue accents, and icon badges.
- **Containers Management**:
  - View running, stopped, and all containers.
  - One-click **Start**, **Stop**, **Restart**, and **Delete**.
  - **Live Logs viewer** with configurable tail and auto-scroll.
  - **Inspect JSON** viewer for complete container metadata.
  - **Port Mappings**: Clickable host port links (e.g., `8080:80` opens `http://localhost:8080`).
  - **Quick Run Modal**: Launch new containers (Image, Name, Port bindings, Environment variables, Restart policies).
  - **Prune Stopped**: Batch-clean all exited containers.
- **Images Management**:
  - List all downloaded images with sizes and creation dates.
  - Pull new images from Docker Hub directly in the browser.
  - Delete or run images directly.
- **Volumes & Networks**:
  - View, create, and remove named volumes.
  - Inspect bridge and host networks.
- **Engine & System Metrics**:
  - Live Docker daemon status, CPU count, RAM capacity, kernel version, and storage driver.
  - Automatic reconnection alert when the Docker daemon starts or stops.
