package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func RegisterAPIRoutes(r *gin.Engine, docker *DockerClient, port int) {
	api := r.Group("/api")

	// Status & Ping
	api.GET("/status", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()

		if err := docker.Ping(ctx); err != nil {
			c.JSON(http.StatusOK, gin.H{"connected": false, "port": port, "error": err.Error()})
			return
		}
		info, _ := docker.GetInfo(ctx)
		ver, _ := docker.GetVersion(ctx)
		c.JSON(http.StatusOK, gin.H{"connected": true, "port": port, "info": info, "version": ver})
	})

	// Containers
	api.GET("/containers", func(c *gin.Context) {
		list, err := docker.ListContainers(c.Request.Context(), true)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "containers": list})
	})

	api.POST("/containers/:id/:action", func(c *gin.Context) {
		id, act := c.Param("id"), c.Param("action")
		var err error
		switch act {
		case "start":
			err = docker.StartContainer(c.Request.Context(), id)
		case "stop":
			err = docker.StopContainer(c.Request.Context(), id)
		case "restart":
			err = docker.RestartContainer(c.Request.Context(), id)
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid action"})
			return
		}

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": fmt.Sprintf("Container %s %sed", id[:8], act)})
	})

	api.DELETE("/containers/:id", func(c *gin.Context) {
		force := c.Query("force") == "true"
		if err := docker.RemoveContainer(c.Request.Context(), c.Param("id"), force); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Container removed"})
	})

	api.POST("/containers/prune", func(c *gin.Context) {
		if err := docker.PruneContainers(c.Request.Context()); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Stopped containers pruned"})
	})

	api.GET("/containers/:id/logs", func(c *gin.Context) {
		logs, err := docker.GetLogs(c.Request.Context(), c.Param("id"), c.Query("tail"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "logs": logs})
	})

	api.GET("/containers/:id/inspect", func(c *gin.Context) {
		data, err := docker.InspectContainer(c.Request.Context(), c.Param("id"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
	})

	api.POST("/containers/run", func(c *gin.Context) {
		var payload RunContainerPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		id, err := docker.RunContainer(c.Request.Context(), payload)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "id": id, "message": "Container started successfully"})
	})

	// Images
	api.GET("/images", func(c *gin.Context) {
		images, err := docker.ListImages(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "images": images})
	})

	api.POST("/images/pull", func(c *gin.Context) {
		var req struct {
			Image string `json:"image"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.Image == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "valid image name required"})
			return
		}
		if err := docker.PullImage(c.Request.Context(), req.Image); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Image pulled successfully"})
	})

	api.DELETE("/images/:id", func(c *gin.Context) {
		force := c.Query("force") == "true"
		if err := docker.RemoveImage(c.Request.Context(), c.Param("id"), force); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Image removed"})
	})

	// Volumes
	api.GET("/volumes", func(c *gin.Context) {
		vols, err := docker.ListVolumes(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "volumes": vols})
	})

	api.POST("/volumes/create", func(c *gin.Context) {
		var req struct {
			Name string `json:"name"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "volume name required"})
			return
		}
		if err := docker.CreateVolume(c.Request.Context(), req.Name); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Volume created"})
	})

	api.DELETE("/volumes/:name", func(c *gin.Context) {
		if err := docker.RemoveVolume(c.Request.Context(), c.Param("name")); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Volume deleted"})
	})

	// Networks & System
	api.GET("/networks", func(c *gin.Context) {
		nets, err := docker.ListNetworks(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "networks": nets})
	})

	api.GET("/system/info", func(c *gin.Context) {
		info, err := docker.GetInfo(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ver, _ := docker.GetVersion(c.Request.Context())
		c.JSON(http.StatusOK, gin.H{"success": true, "info": info, "version": ver})
	})
}
