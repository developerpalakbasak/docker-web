package main

import (
	"context"
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

//go:embed web/dist/*
var distFS embed.FS

func main() {
	var (
		portFlag    int
		pFlag       int
		socket      string
		sSocket     string
		openBrowser bool
		autoDaemon  bool
	)

	flag.IntVar(&portFlag, "port", 0, "Port for the Docker Desktop Web UI (e.g. --port 8000)")
	flag.IntVar(&pFlag, "p", 0, "Port shorthand (e.g. -p 8000)")
	flag.StringVar(&socket, "socket", "/var/run/docker.sock", "Path to Docker daemon unix socket")
	flag.StringVar(&sSocket, "s", "", "Path to Docker daemon unix socket (shorthand)")
	flag.BoolVar(&openBrowser, "open", true, "Automatically open web browser on startup")
	flag.BoolVar(&autoDaemon, "auto-daemon", true, "Automatically run docker-on on start and docker-off on exit")

	flag.Usage = func() {
		fmt.Fprintf(flag.CommandLine.Output(), `Docker Desktop Web CLI (Windows Edition UI)

Usage:
  docker-web [flags] [port]

Examples:
  docker-web --port 8000
  docker-web -p 8000
  docker-web 8000
  docker-web --port 8000 --open=false

Flags:
`)
		flag.PrintDefaults()
	}
	flag.Parse()

	// Resolve port (default 5000)
	port := 5000
	if portFlag != 0 {
		port = portFlag
	} else if pFlag != 0 {
		port = pFlag
	} else if len(flag.Args()) > 0 {
		if p, err := strconv.Atoi(strings.TrimPrefix(flag.Args()[0], ":")); err == nil && p > 0 {
			port = p
		}
	}
	if sSocket != "" {
		socket = sSocket
	}

	// Initialize Docker client & auto-start if enabled
	docker := NewDockerClient(socket)
	if autoDaemon {
		fmt.Println("🚀 Starting Docker daemon: sudo systemctl start docker")
		runCommand("sudo", "systemctl", "start", "docker")
		// Brief wait for socket readiness
		for i := 0; i < 10; i++ {
			ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
			if err := docker.Ping(ctx); err == nil {
				cancel()
				break
			}
			cancel()
			time.Sleep(300 * time.Millisecond)
		}
	}

	// Quick check if daemon is responsive
	chkCtx, chkCancel := context.WithTimeout(context.Background(), 2*time.Second)
	daemonRunning := docker.Ping(chkCtx) == nil
	chkCancel()

	// Setup Gin Engine in Release Mode
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	// Simple CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// Register REST API endpoints
	RegisterAPIRoutes(router, docker, port)

	// Serve embedded React-Vite SPA
	indexHTML, _ := distFS.ReadFile("web/dist/index.html")
	distSub, _ := fs.Sub(distFS, "web/dist")

	router.NoRoute(func(c *gin.Context) {
		path := strings.TrimPrefix(c.Request.URL.Path, "/")
		if path != "" {
			if f, err := distSub.Open(path); err == nil {
				f.Close()
				c.FileFromFS(path, http.FS(distSub))
				return
			}
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
	})

	uiURL := fmt.Sprintf("http://localhost:%d", port)
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: router,
	}

	printBanner(port, socket, uiURL, daemonRunning)

	if openBrowser {
		go func() {
			time.Sleep(400 * time.Millisecond)
			launchBrowser(uiURL)
		}()
	}

	// Graceful shutdown on Ctrl+C
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-stop
	fmt.Println("\n🛑 Shutting down Docker Desktop Web CLI...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	_ = server.Shutdown(shutdownCtx)

	if autoDaemon {
		fmt.Println("🛑 Stopping Docker daemon: sudo systemctl stop docker.service docker.socket")
		runCommand("sudo", "systemctl", "stop", "docker.service", "docker.socket")
	}
	fmt.Println("Goodbye! 🐳")
}

func runCommand(name string, args ...string) {
	cmd := exec.Command(name, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	_ = cmd.Run()
}

func printBanner(port int, socket, uiURL string, running bool) {
	status := "🟢 Connected (Daemon running)"
	if !running {
		status = "🟡 Offline (Run 'sudo systemctl start docker' when needed)"
	}
	fmt.Println("\n  ===============================================================")
	fmt.Println("    🐳  DOCKER DESKTOP - WEB CLI (GIN + REACT EDITION)")
	fmt.Println("  ===============================================================")
	fmt.Printf("   📦  Containers:      %s/containers\n", uiURL)
	fmt.Printf("   🖼️   Images:          %s/images\n", uiURL)
	fmt.Printf("   💾  Volumes:         %s/volumes\n", uiURL)
	fmt.Printf("   🌐  Networks:        %s/networks\n", uiURL)
	fmt.Printf("   ℹ️   System & Engine: %s/system\n", uiURL)
	fmt.Println("  ---------------------------------------------------------------")
	fmt.Printf("   🔌  Docker Socket:   %s\n", socket)
	fmt.Printf("   ⚡  Engine Status:   %s\n", status)
	fmt.Println("  ---------------------------------------------------------------")
	fmt.Println("   👨‍💻  Developed by:    developerpalakbasak")
	fmt.Println("   🔗  GitHub:          https://github.com/developerpalakbasak")
	fmt.Println("  ---------------------------------------------------------------")
	fmt.Println("   Press Ctrl+C to stop the Web CLI server anytime.")
	fmt.Println("  ===============================================================\n")
}

func launchBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		if _, err := exec.LookPath("wslview"); err == nil {
			cmd = exec.Command("wslview", url)
		} else if _, err := exec.LookPath("xdg-open"); err == nil {
			cmd = exec.Command("xdg-open", url)
		} else if _, err := exec.LookPath("gio"); err == nil {
			cmd = exec.Command("gio", "open", url)
		}
	}
	if cmd != nil {
		_ = cmd.Start()
	}
}
